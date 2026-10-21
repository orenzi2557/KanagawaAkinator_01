"use client";

import { useRouter } from "next/navigation";
import { useQuiz } from "@/components/QuizProvider";
import { PHASES } from "@/lib/state/quizReducer";

export default function StartPage() {
  const router = useRouter();
  const { state, dispatch, hydrated } = useQuiz();
  const inProgress = hydrated && state.phase === PHASES.questioning && state.answers.length > 0;

  const start = () => {
    dispatch({ type: "START" });
    router.push("/quiz");
  };

  return (
    <div className="flex flex-col items-center py-6 text-center sm:py-12">
      <p className="mb-3 text-5xl" aria-hidden>
        🗾
      </p>
      <h1 className="text-3xl font-bold text-primary-strong sm:text-4xl">かながわアキネーター</h1>
      <p className="mt-5 max-w-md leading-relaxed text-muted">
        いくつかの質問に答えるだけで、あなたにぴったりの神奈川県の観光地を提案します。
        <br />
        4択で答えても、思ったことを自由に書いても大丈夫。近くのおすすめスポットもあわせて紹介します。
      </p>
      <p className="mt-4 text-sm text-muted">所要時間の目安: 約3〜5分（最大10問）</p>

      <button
        type="button"
        onClick={start}
        className="mt-8 rounded-full bg-primary px-10 py-4 text-lg font-bold text-white shadow transition hover:bg-primary-strong"
      >
        はじめる
      </button>
      {inProgress && (
        <button
          type="button"
          onClick={() => router.push("/quiz")}
          className="mt-4 text-sm text-primary underline"
        >
          前回の続きから（{state.answers.length}問回答済み）
        </button>
      )}
    </div>
  );
}
