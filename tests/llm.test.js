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
  templateReason,
} from "@/lib/llm/explain.js";
import { checkHealth, ollamaConfig } from "@/lib/llm/ollama.js";

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
    const { system, user } = buildExplainPrompt(enoshima, { topTags: ["sea", "food"], texts: [] }, [
      "sea",
    ]);
    for (const f of enoshima.facts) expect(user).toContain(f);
    expect(system).toContain("事実情報にない名物・料理");
    expect(user).toContain("合っている点: 海");
    expect(user).not.toContain("グルメ");
    expect(system).toContain("営業時間・料金");
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
