// 次の質問の選び方（要件 6.2）

import {
  ASKED_TAG_VARIANCE_FACTOR,
  STRONG_TEXT_THRESHOLD,
  STRONG_TEXT_VARIANCE_FACTOR,
  TOP_K,
} from "./constants.js";
import { indexQuestions, rankSpots, textScoreTotals } from "./score.js";

export function variance(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
}

/**
 * 各 deep 質問の優先度（分散に優先度を下げる係数をかけたもの）を返す。
 * @returns {{ question: object, variance: number, priority: number }[]} 定義順
 */
export function rankDeepCandidates(spots, questions, answers) {
  const byId = indexQuestions(questions);
  const asked = new Set(answers.map((a) => a.questionId));
  const askedTags = new Set(
    answers
      .map((a) => byId.get(a.questionId))
      .filter((q) => q?.tier === "deep")
      .map((q) => q.tag),
  );
  const top = rankSpots(spots, questions, answers).slice(0, TOP_K);
  const text = textScoreTotals(answers);

  return questions
    .filter((q) => q.tier === "deep" && !asked.has(q.id))
    .map((question) => {
      const v = variance(top.map((r) => r.spot.tags[question.tag] ?? 0));
      let priority = v;
      if (Math.abs(text[question.tag]) >= STRONG_TEXT_THRESHOLD) {
        priority *= STRONG_TEXT_VARIANCE_FACTOR;
      }
      if (askedTags.has(question.tag)) priority *= ASKED_TAG_VARIANCE_FACTOR;
      return { question, variance: v, priority };
    });
}

/**
 * 次に出す質問。必須質問を定義順に出し、その後は優先度が最大の deep 質問
 * （同点なら定義順）。出せる質問がなければ null。
 */
export function selectNextQuestion(spots, questions, answers) {
  const asked = new Set(answers.map((a) => a.questionId));
  const required = questions.find((q) => q.tier === "required" && !asked.has(q.id));
  if (required) return required;

  let best = null;
  for (const c of rankDeepCandidates(spots, questions, answers)) {
    if (!best || c.priority > best.priority) best = c;
  }
  return best?.question ?? null;
}
