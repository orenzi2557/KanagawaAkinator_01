// ブラウザ側の説明文ストアのテスト（StrictMode の二重実行で二重リクエストにならないこと）。

import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import spots from "@/data/spots.json";
import {
  explainKey,
  getExplainSnapshot,
  resetExplainStore,
  subscribeExplain,
} from "@/lib/explainClient.js";

const spot = spots.find((s) => s.id === "enoshima");
const summary = { topTags: ["sea"], texts: [] };
const request = { spot, summary, reasonTags: ["sea"] };
const key = explainKey(spot.id, summary, ["sea"]);
const flush = () => new Promise((r) => setTimeout(r, 20));

let signals;
beforeEach(() => {
  signals = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, { signal }) => {
      signals.push(signal);
      return new Response("海を感じたいあなたに、江の島はぴったりです。", {
        headers: { "X-Explain-Source": "llm" },
      });
    }),
  );
});

afterEach(() => {
  resetExplainStore();
  vi.unstubAllGlobals();
});

describe("説明文ストア", () => {
  it("購読→解除→すぐ再購読（StrictMode）でもリクエストは 1 回で、中断しない", async () => {
    const unsubscribe = subscribeExplain(key, request, () => {});
    unsubscribe();
    const unsubscribe2 = subscribeExplain(key, request, () => {});
    await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(signals[0].aborted).toBe(false);
    expect(getExplainSnapshot(key)).toMatchObject({ status: "done", source: "llm" });
    unsubscribe2();
  });

  it("完了した説明は覚えておき、同じ候補に戻ったときは再リクエストしない", async () => {
    subscribeExplain(key, request, () => {})();
    await flush();
    subscribeExplain(key, request, () => {})();
    await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("生成中に画面から消えたら（猶予のあとで）中断する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, { signal }) => {
        signals.push(signal);
        return new Promise(() => {}); // 返事が来ない
      }),
    );
    const unsubscribe = subscribeExplain(key, request, () => {});
    unsubscribe();
    expect(signals[0].aborted).toBe(false);
    await new Promise((r) => setTimeout(r, 400));
    expect(signals[0].aborted).toBe(true);
    expect(getExplainSnapshot(key).status).toBe("waiting");
  });

  it("失敗したらテンプレート文を出し、次に表示したときはもう一度試す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    const unsubscribe = subscribeExplain(key, request, () => {});
    await flush();
    expect(getExplainSnapshot(key)).toMatchObject({ status: "done", source: "template" });
    expect(getExplainSnapshot(key).text).toContain("#海 が好きなあなたにぴったりです");
    unsubscribe();
    subscribeExplain(key, request, () => {});
    await flush();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
