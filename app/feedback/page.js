"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuiz, usePhaseRedirect } from "@/components/QuizProvider";
import { StarRating } from "@/components/StarRating";
import { questions, spots } from "@/lib/data";
import { buildResult } from "@/lib/result";

export default function FeedbackPage() {
  const ready = usePhaseRedirect();
  const router = useRouter();
  const { state, dispatch } = useQuiz();
  const [rating, setRating] = useState(0);
  const [wantToGo, setWantToGo] = useState(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  if (!ready) return null;

  const { main } = buildResult(spots, questions, state.answers, state.selectedSpotId);
  const canSend = rating > 0 && wantToGo !== null && !sending;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: main.spot.id,
          rating,
          wantToGo,
          comment: comment.trim(),
          answers: state.answers,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      dispatch({ type: "FEEDBACK_SENT" });
    } catch {
      setError("送信できませんでした。時間をおいてもう一度お試しください。");
    } finally {
      setSending(false);
    }
  };

  const restart = () => {
    dispatch({ type: "START" });
    router.push("/quiz");
  };

  if (state.feedbackSent) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <p className="mb-3 text-5xl" aria-hidden>
          🌊
        </p>
        <h1 className="text-2xl font-bold text-primary-strong">ありがとうございました</h1>
        <p className="mt-3 text-muted">いただいた感想は、アプリの改善に使わせていただきます。</p>
        <button
          type="button"
          onClick={restart}
          className="mt-8 rounded-full bg-primary px-8 py-3 font-bold text-white shadow transition hover:bg-primary-strong"
        >
          もう一度診断する
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">フィードバック</h1>
        <p className="mt-1 text-sm text-muted">
          提案した「<span className="font-medium text-foreground">{main.spot.name}</span>
          」について教えてください。
        </p>
      </div>

      <section className="space-y-6 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="mb-2 font-bold">満足度</h2>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <div>
          <h2 className="mb-2 font-bold">行きたいと思った？</h2>
          <div className="flex gap-2" role="radiogroup">
            {[
              [true, "はい"],
              [false, "いいえ"],
            ].map(([value, label]) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={wantToGo === value}
                onClick={() => setWantToGo(value)}
                className={`rounded-xl border-2 px-6 py-2 font-medium transition ${
                  wantToGo === value
                    ? "border-primary bg-primary-soft text-primary-strong"
                    : "border-line hover:border-primary/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block font-bold">
            コメント <span className="text-sm font-normal text-muted">（任意）</span>
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="例: 質問がわかりやすかった／別の場所がよかった"
            className="w-full resize-none rounded-xl border-2 border-line px-3 py-2 outline-none focus:border-primary"
          />
        </label>
      </section>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK_TO_RESULT" })}
          className="text-sm text-muted underline"
        >
          結果に戻る
        </button>
        <button
          type="button"
          onClick={send}
          disabled={!canSend}
          className="rounded-full bg-primary px-8 py-3 font-bold text-white shadow transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none"
        >
          {sending ? "送信中…" : "送信する"}
        </button>
      </div>
    </div>
  );
}
