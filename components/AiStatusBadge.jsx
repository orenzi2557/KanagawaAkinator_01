"use client";

import { useQuiz } from "./QuizProvider";

export function AiStatusBadge() {
  const { ai } = useQuiz();
  if (!ai.checked) return <span className="text-xs text-muted">AI 確認中…</span>;
  return ai.ollama ? (
    <span
      className="rounded-full bg-primary-soft px-2.5 py-1 text-xs text-primary-strong"
      title={`Ollama: ${ai.model}`}
    >
      AI機能オン
    </span>
  ) : (
    <span
      className="rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent"
      title="Ollama に接続できないため、キーワード辞書とテンプレート文で動いています"
    >
      AI機能オフ
    </span>
  );
}
