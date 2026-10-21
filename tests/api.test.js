// API ルートのテスト。Ollama が止まっている状態（fetch 失敗）をモックして、
// フォールバックで動くことと、不正な入力に 400 を返すことを確認する。

import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { GET as health } from "@/app/api/health/route.js";
import { POST as parseTextRoute } from "@/app/api/parse-text/route.js";
import { POST as explainRoute } from "@/app/api/explain/route.js";

const post = (body) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Ollama 停止時", () => {
  it("GET /api/health は ollama=false", async () => {
    const res = await health();
    expect(await res.json()).toEqual({ ollama: false, model: null });
  });

  it("POST /api/parse-text はキーワード辞書で返す", async () => {
    const res = await parseTextRoute(
      post({ question: "誰と行く？", text: "子どもと海に行きたい" }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.source).toBe("keywords");
    expect(data.scores.family).toBe(2);
    expect(data.scores.sea).toBe(2);
  });

  it("POST /api/explain はテンプレート文を返す", async () => {
    const res = await explainRoute(
      post({ spotId: "enoshima", answersSummary: { topTags: ["sea"], texts: [] } }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Explain-Source")).toBe("template");
    expect(await res.text()).toContain("#海 が好きなあなたにぴったりです");
  });
});

describe("入力のバリデーション", () => {
  it("parse-text: text が空なら 400", async () => {
    expect((await parseTextRoute(post({ question: "q", text: "  " }))).status).toBe(400);
  });

  it("parse-text: JSON でなければ 400", async () => {
    expect((await parseTextRoute(post("not json"))).status).toBe(400);
  });

  it("explain: 不明な spotId なら 400", async () => {
    const res = await explainRoute(
      post({ spotId: "unknown", answersSummary: { topTags: [], texts: [] } }),
    );
    expect(res.status).toBe(400);
  });

  it("explain: 不明なタグなら 400", async () => {
    const res = await explainRoute(
      post({ spotId: "enoshima", answersSummary: { topTags: ["shopping"], texts: [] } }),
    );
    expect(res.status).toBe(400);
  });
});
