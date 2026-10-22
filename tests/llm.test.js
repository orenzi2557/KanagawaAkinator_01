// LLM に依存する処理のテスト。Ollama はすべてモックする。

import { afterEach, describe, it, expect, vi } from "vitest";
import spots from "@/data/spots.json";
import { TAGS } from "@/lib/engine";
import {
  PARSE_SCHEMA,
  buildParsePrompt,
  normalizeParseResult,
  parseText,
} from "@/lib/llm/parseText.js";
import {
  buildAnswersSummary,
  buildExplainPrompt,
  streamExplanation,
  supportedTags,
  supportedTexts,
  templateReason,
  tidyExplanation,
} from "@/lib/llm/explain.js";
import { chatStream, checkHealth, ollamaConfig } from "@/lib/llm/ollama.js";

const zeros = Object.fromEntries(TAGS.map((t) => [t, 0]));
const enoshima = spots.find((s) => s.id === "enoshima");
const readAll = async (stream) => new Response(stream).text();

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("自由記述の解析", () => {
  it("JSON スキーマに 8 タグすべてと budget が必須で入っている", () => {
    expect(PARSE_SCHEMA.properties.scores.required).toEqual(TAGS);
    expect(PARSE_SCHEMA.required).toEqual(["budget", "scores"]);
  });

  it("プロンプトに「書かれていないことは 0」と質問・回答が入る", () => {
    const { system, user } = buildParsePrompt("海は好き？", "海鮮が食べたい");
    expect(system).toContain("書かれていないことは必ず 0");
    expect(user).toContain("海は好き？");
    expect(user).toContain("海鮮が食べたい");
  });

  it("LLM の結果を -2〜2 の整数にそろえ、budget none は null にする", () => {
    const r = normalizeParseResult({
      scores: { ...zeros, sea: 5, food: 1.4, active: -3 },
      budget: "none",
    });
    expect(r.scores.sea).toBe(2);
    expect(r.scores.food).toBe(1);
    expect(r.scores.active).toBe(-2);
    expect(r.budget).toBeNull();
  });

  it("LLM が正しく答えれば source=llm", async () => {
    const chatJson = vi.fn().mockResolvedValue({ scores: { ...zeros, sea: 2 }, budget: "low" });
    const r = await parseText("q", "海", { chatJson });
    expect(r).toEqual({ scores: { ...zeros, sea: 2 }, budget: 1, source: "llm" });
    expect(chatJson).toHaveBeenCalledWith(expect.objectContaining({ schema: PARSE_SCHEMA }));
  });

  it("LLM が壊れた JSON を返したらキーワード辞書で代替", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const chatJson = vi.fn().mockResolvedValue({ scores: { sea: "たくさん" } });
    const r = await parseText("q", "雨でも大丈夫なところ", { chatJson });
    expect(r.source).toBe("keywords");
    expect(r.scores.indoor).toBe(2);
  });

  it("LLM がタイムアウトしたらキーワード辞書で代替", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const chatJson = vi.fn().mockRejectedValue(new DOMException("timeout", "TimeoutError"));
    const r = await parseText("q", "あまり歩きたくない", { chatJson });
    expect(r.source).toBe("keywords");
    expect(r.scores.active).toBe(-2);
  });
});

describe("説明文", () => {
  it("回答の要約は好みの上位タグと自由記述", () => {
    const pref = { ...zeros, sea: 4, food: 2, history: -2 };
    const s = buildAnswersSummary(pref, [{ text: "" }, { text: " 海鮮！ " }]);
    expect(s).toEqual({ topTags: ["sea", "food"], texts: ["海鮮！"] });
  });

  it("プロンプトには facts だけを事実情報として渡し、営業時間・料金を禁止する", () => {
    const { system, user } = buildExplainPrompt(enoshima, { topTags: ["sea"], texts: [] }, ["sea"]);
    for (const f of enoshima.facts) expect(user).toContain(f);
    expect(system).toContain("書かれていない名物・料理");
    expect(system).toContain("営業時間・料金");
    expect(user).toContain("利用者の希望: 海を感じたい");
  });

  it("facts で裏付けられない希望は渡さない（江の島の facts には食べ物の記述がない）", () => {
    const chinatown = spots.find((s) => s.id === "chinatown");
    expect(supportedTags(enoshima, ["sea", "food"])).toEqual(["sea"]);
    expect(supportedTags(chinatown, ["food"])).toEqual(["food"]);
  });

  it("facts で裏付けられない話題を含む自由記述は渡さない", () => {
    expect(
      supportedTexts(enoshima, ["海鮮が食べたいけど、あまり歩きたくない", "海が見たい"]),
    ).toEqual(["海が見たい"]);
    const { user } = buildExplainPrompt(
      enoshima,
      { topTags: ["sea", "food"], texts: ["海鮮が食べたい"] },
      ["sea", "food"],
    );
    expect(user).not.toContain("おいしいもの");
    expect(user).not.toContain("海鮮");
  });

  it("説明文は改行・マークダウンを除き、3 文で打ち切って元の生成も止める", async () => {
    let closed = false;
    async function* source() {
      try {
        yield "\n 一文目です。**二**文目";
        yield "です。\n三文目です。四文目";
        yield "です。";
      } finally {
        closed = true;
      }
    }
    let out = "";
    for await (const chunk of tidyExplanation(source())) out += chunk;
    expect(out).toBe("一文目です。二文目です。三文目です。");
    expect(closed).toBe(true);
  });

  it("テンプレート文はハッシュタグ付き", () => {
    expect(templateReason(enoshima, ["sea", "food"])).toContain(
      "#海 #グルメ が好きなあなたにぴったりです",
    );
  });

  it("LLM の断片をそのままストリーミングする", async () => {
    async function* chatStream() {
      yield "江の島は";
      yield "**海**が好きなあなたに";
      yield "ぴったりです。";
    }
    const r = await streamExplanation(enoshima, { topTags: ["sea"], texts: [] }, ["sea"], {
      chatStream,
    });
    expect(r.source).toBe("llm");
    expect(await readAll(r.stream)).toBe("江の島は海が好きなあなたにぴったりです。");
  });

  it("利用者が画面を離れて中断されたときは、失敗として記録しない", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const controller = new AbortController();
    controller.abort();
    async function* chatStream() {
      throw new DOMException("aborted", "AbortError");
    }
    const r = await streamExplanation(enoshima, { topTags: [], texts: [] }, [], {
      chatStream,
      signal: controller.signal,
    });
    expect(r.source).toBe("template");
    expect(warn).not.toHaveBeenCalled();
  });

  it("最初の断片が来なければテンプレート文", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    async function* chatStream() {
      throw new Error("ECONNREFUSED");
    }
    const r = await streamExplanation(enoshima, { topTags: [], texts: [] }, ["sea"], {
      chatStream,
    });
    expect(r.source).toBe("template");
    expect(await readAll(r.stream)).toBe(templateReason(enoshima, ["sea"]));
  });

  it("途中で失敗したら、そこまでの文章で終える", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    async function* chatStream() {
      yield "途中まで";
      throw new Error("切断");
    }
    const r = await streamExplanation(enoshima, { topTags: [], texts: [] }, [], { chatStream });
    expect(await readAll(r.stream)).toBe("途中まで");
  });
});

describe("Ollama のストリーミング", () => {
  /** NDJSON の断片を delays[i] ミリ秒ごとに返す偽の Ollama 応答 */
  function slowOllama(parts, delays, onAbort) {
    return vi.fn(async (_url, { signal }) => {
      signal.addEventListener("abort", () => onAbort?.());
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        async pull(controller) {
          const i = body.index ?? 0;
          body.index = i + 1;
          if (i >= parts.length) return controller.close();
          await new Promise((r) => setTimeout(r, delays[i]));
          if (signal.aborted) return controller.error(signal.reason);
          const done = i === parts.length - 1;
          controller.enqueue(
            encoder.encode(JSON.stringify({ message: { content: parts[i] }, done }) + "\n"),
          );
        },
      });
      return new Response(body);
    });
  }
  const config = { ...ollamaConfig({}), timeoutMs: 100 };
  const collect = async (gen) => {
    let s = "";
    for await (const c of gen) s += c;
    return s;
  };

  it("タイムアウトは最初の断片までにかかり、生成全体が長くても途中で切れない", async () => {
    // 1 断片 60ms × 5 = 300ms（timeoutMs 100ms より長い）
    vi.stubGlobal("fetch", slowOllama(["あ", "い", "う", "え", "お"], [60, 60, 60, 60, 60]));
    expect(await collect(chatStream({ system: "s", user: "u" }, config))).toBe("あいうえお");
  });

  it("最初の断片が timeoutMs 以内に来なければ TimeoutError", async () => {
    vi.stubGlobal("fetch", slowOllama(["あ"], [300]));
    await expect(collect(chatStream({ system: "s", user: "u" }, config))).rejects.toMatchObject({
      name: "TimeoutError",
    });
  });

  it("途中で読むのをやめたら Ollama への接続を切る", async () => {
    let aborted = false;
    vi.stubGlobal(
      "fetch",
      slowOllama(["あ", "い", "う"], [10, 10, 10], () => (aborted = true)),
    );
    for await (const chunk of chatStream({ system: "s", user: "u" }, config)) {
      expect(chunk).toBe("あ");
      break;
    }
    expect(aborted).toBe(true);
  });
});

describe("Ollama の状態確認", () => {
  const config = ollamaConfig({ OLLAMA_MODEL: "gemma3:4b" });

  it("モデルがあれば ollama=true", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ models: [{ name: "gemma3:4b" }] })),
    );
    expect(await checkHealth(config)).toEqual({ ollama: true, model: "gemma3:4b" });
  });

  it("モデルがなければ ollama=false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ models: [{ name: "qwen2.5:7b" }] })),
    );
    expect(await checkHealth(config)).toEqual({ ollama: false, model: null });
  });

  it("接続できなければ ollama=false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    expect(await checkHealth(config)).toEqual({ ollama: false, model: null });
  });
});
