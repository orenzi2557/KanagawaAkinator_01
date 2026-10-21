"use client";

import { ANSWER_OPTIONS } from "@/lib/engine/constants";
import { AnswerButtons } from "./AnswerButtons";
import { FreeTextInput } from "./FreeTextInput";

/** 質問の選択肢（必須質問は専用の選択肢、踏み込んだ質問は共通の4択） */
export function optionsFor(question) {
  if (question.tier === "required") {
    return question.options.map((o, i) => ({ value: i, label: o.label }));
  }
  return ANSWER_OPTIONS.map(({ value, label }) => ({ value, label }));
}

export function QuestionCard({ question, draft, onChoice, onText, disabled }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <h1 className="mb-5 text-xl font-bold leading-relaxed sm:text-2xl">{question.text}</h1>
      <AnswerButtons
        options={optionsFor(question)}
        selected={draft.choice}
        onSelect={onChoice}
        disabled={disabled}
      />
      <div className="mt-5">
        <FreeTextInput value={draft.text} onChange={onText} disabled={disabled} />
      </div>
    </section>
  );
}
