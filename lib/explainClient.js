// 「あなたに合う理由」をブラウザ側で取得・保持する小さなストア（useSyncExternalStore 用）。
//
// - 同じ内容の説明は 1 回だけ /api/explain に問い合わせる。開発モード（StrictMode）では
//   effect が「実行 → 片付け → 再実行」されるが、そのたびに中断・再送すると、中断した分の
//   処理が Ollama に残って本命のリクエストが待たされるため、進行中のリクエストを使い回す。
// - 画面から本当に消えたとき（候補の切り替え・ページ移動）だけ、少し待ってから中断する。
// - 完了した説明は覚えておき、同じ候補に戻ったときはすぐ表示する。

import { templateReason } from "./llm/explain.js";

/** 購読者がいなくなってから中断するまでの猶予（StrictMode の再購読を待つ） */
const ABORT_GRACE_MS = 300;

const IDLE = Object.freeze({ status: "waiting", text: "", source: null });

/** @type {Map<string, { snapshot: object, listeners: Set<Function>, controller: AbortController, abortTimer: any }>} */
const entries = new Map();

export function explainKey(spotId, summary, reasonTags) {
  return JSON.stringify([spotId, summary.topTags, summary.texts, reasonTags]);
}

function update(entry, patch) {
  entry.snapshot = { ...entry.snapshot, ...patch };
  for (const listener of entry.listeners) listener();
}

async function run(key, entry, { spot, summary, reasonTags }) {
  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId: spot.id, answersSummary: summary, reasonTags }),
      signal: entry.controller.signal,
    });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const source = res.headers.get("X-Explain-Source") ?? "llm";
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let text = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      text += value;
      update(entry, { status: "streaming", text, source });
    }
    update(entry, { status: "done", text: text || templateReason(spot, reasonTags), source });
  } catch {
    if (entry.controller.signal.aborted) return;
    update(entry, { status: "done", text: templateReason(spot, reasonTags), source: "template" });
    // 失敗した結果は覚えず、次に表示したときにもう一度試す
    if (entries.get(key) === entry && entry.listeners.size === 0) entries.delete(key);
    entry.failed = true;
  }
}

/**
 * 説明を購読する。初回の購読でリクエストを始める。
 * @returns {() => void} 購読解除
 */
export function subscribeExplain(key, request, listener) {
  let entry = entries.get(key);
  if (!entry) {
    entry = { snapshot: IDLE, listeners: new Set(), controller: new AbortController() };
    entries.set(key, entry);
    run(key, entry, request);
  }
  clearTimeout(entry.abortTimer);
  entry.listeners.add(listener);

  return () => {
    entry.listeners.delete(listener);
    if (entry.listeners.size > 0) return;
    if (entry.snapshot.status === "done") {
      if (entry.failed) entries.delete(key);
      return;
    }
    entry.abortTimer = setTimeout(() => {
      if (entry.listeners.size > 0) return;
      entry.controller.abort();
      entries.delete(key);
    }, ABORT_GRACE_MS);
  };
}

export function getExplainSnapshot(key) {
  return entries.get(key)?.snapshot ?? IDLE;
}

export const IDLE_SNAPSHOT = IDLE;

/** テスト用: 保持している説明をすべて消す */
export function resetExplainStore() {
  for (const entry of entries.values()) entry.controller.abort();
  entries.clear();
}
