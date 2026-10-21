"use client";

import { useQuiz, usePhaseRedirect } from "@/components/QuizProvider";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { analyzeText } from "@/lib/analyzeText";
import { questions, spots } from "@/lib/data";
import { canSubmit, currentQuestion, progress } from "@/lib/state/quizReducer";

export default function QuizPage() {
  const ready = usePhaseRedirect();
  const { state, dispatch, ai } = useQuiz();
  const question = ready ? currentQuestion(spots, questions, state) : null;
  if (!question) return null;

  const { current, max } = progress(state);

  const submit = async () => {
    if (!canSubmit(state)) return;
    const text = state.draft.text.trim();
    let analysis = { scores: null, budget: null, source: null };
    if (text) {
      dispatch({ type: "ANALYZE_START" });
      analysis = await analyzeText(question, text, { aiEnabled: ai.ollama });
    }
    dispatch({
      type: "SUBMIT_ANSWER",
      answer: {
        questionId: question.id,
        choice: state.draft.choice,
        text,
        textScores: analysis.scores,
        textBudget: analysis.budget,
        textSource: analysis.source,
      },
    });
  };

  return (
    <div className="space-y-6">
      <ProgressBar current={current} max={max} />
      <QuestionCard
        key={question.id}
        question={question}
        draft={state.draft}
        onChoice={(choice) => dispatch({ type: "SET_CHOICE", choice })}
        onText={(text) => dispatch({ type: "SET_TEXT", text })}
        disabled={state.analyzing}
      />

      {state.analyzing && (
        <p className="flex items-center gap-2 text-sm text-primary-strong" role="status">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          AIが回答を読み取っています…
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "BACK" })}
          disabled={state.analyzing}
          className="rounded-full border-2 border-line px-6 py-3 font-medium text-muted transition hover:border-primary disabled:opacity-50"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit(state)}
          className="rounded-full bg-primary px-8 py-3 font-bold text-white shadow transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
