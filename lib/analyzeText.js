// 自由記述の解析（ブラウザ側）。
// /api/parse-text（LLM）を呼び、失敗・タイムアウト・AI機能オフのときはキーワード辞書で代替する。

import { parseTextByKeywords } from "./llm/keywords.js";

/** サーバー側の LLM_TIMEOUT_MS より少し長く待つ（サーバーのフォールバック結果を受け取るため） */
const CLIENT_TIMEOUT_MS = 35000;

/**
 * @returns {Promise<{ scores: Record<string, number>, budget: 1|2|3|null, source: "llm"|"keywords" }>}
 */
export async function analyzeText(question, text, { aiEnabled }) {
  if (!aiEnabled) return { ...parseTextByKeywords(text), source: "keywords" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch("/api/parse-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.text, text }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { scores: data.scores, budget: data.budget ?? null, source: data.source ?? "llm" };
  } catch {
    return { ...parseTextByKeywords(text), source: "keywords" };
  } finally {
    clearTimeout(timer);
  }
}
