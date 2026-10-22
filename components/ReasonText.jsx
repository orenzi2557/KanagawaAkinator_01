"use client";

// 「あなたに合う理由」。AI機能オンなら /api/explain からストリーミングで受け取り、
// オフ・失敗時はテンプレート文を表示する。
// AI の状態確認（/api/health）が終わるまでは判断を保留する
// （結果画面を再読み込みしたときに、確認前の「オフ」のまま固まらないようにするため）。

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { templateReason } from "@/lib/llm/explain";
import {
  IDLE_SNAPSHOT,
  explainKey,
  getExplainSnapshot,
  subscribeExplain,
} from "@/lib/explainClient";

function Waiting({ label }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted" role="status">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      {label}
    </p>
  );
}

function StreamedReason({ spot, reasons, summary }) {
  const key = useMemo(() => explainKey(spot.id, summary, reasons), [spot.id, summary, reasons]);
  const subscribe = useCallback(
    (listener) => subscribeExplain(key, { spot, summary, reasonTags: reasons }, listener),
    // key が同じなら同じ説明なので、購読し直さない
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    () => getExplainSnapshot(key),
    () => IDLE_SNAPSHOT,
  );

  if (snapshot.status === "waiting") return <Waiting label="AIが説明文を書いています…" />;
  return (
    <p className={snapshot.status === "streaming" ? "typing-caret" : undefined}>{snapshot.text}</p>
  );
}

export function ReasonText({ spot, reasons, summary, aiChecked, aiEnabled }) {
  if (!aiChecked) return <Waiting label="AIの準備を確認しています…" />;
  if (!aiEnabled) return <p>{templateReason(spot, reasons)}</p>;
  return <StreamedReason spot={spot} reasons={reasons} summary={summary} />;
}
