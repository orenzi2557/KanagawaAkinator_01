// シミュレーション用の仮想ユーザー（要件 11）。
// 「正解」スポットのタグ値から理想の回答を作り、最後まで回答させる。

import { isFinished } from "./finish.js";
import { rankSpots } from "./score.js";
import { selectNextQuestion } from "./selectQuestion.js";

/** タグ値 → 共通4択 */
const VALUE_TO_CHOICE = { 3: "yes", 2: "probably", 1: "neutral", 0: "no" };

const dot = (effect, tags) =>
  Object.entries(effect ?? {}).reduce((s, [t, v]) => s + v * (tags[t] ?? 0), 0);

/** 仮想ユーザーがその質問に返す理想の回答 */
export function idealChoice(target, spots, question) {
  if (question.tier === "deep") return VALUE_TO_CHOICE[target.tags[question.tag] ?? 0];

  // 予算の質問は、正解スポットの budget と同じ選択肢を選ぶ
  const budgetIndex = question.options.findIndex((o) => o.budget === target.budget);
  if (budgetIndex >= 0) return budgetIndex;

  // それ以外は「正解スポットが他のスポットの平均よりどれだけ得をするか」が最大の選択肢
  const others = spots.filter((s) => s.id !== target.id);
  let best = 0;
  let bestMargin = -Infinity;
  question.options.forEach((o, i) => {
    const mean = others.reduce((s, sp) => s + dot(o.effect, sp.tags), 0) / others.length;
    const margin = dot(o.effect, target.tags) - mean;
    if (margin > bestMargin) {
      best = i;
      bestMargin = margin;
    }
  });
  return best;
}

/** 仮想ユーザーに最後まで回答させ、正解スポットの順位（1 始まり）を返す */
export function simulateUser(target, spots, questions) {
  const answers = [];
  while (!isFinished(spots, questions, answers)) {
    const q = selectNextQuestion(spots, questions, answers);
    answers.push({
      questionId: q.id,
      choice: idealChoice(target, spots, q),
      text: "",
      textScores: null,
      textBudget: null,
    });
  }
  const ranked = rankSpots(spots, questions, answers);
  const rank = ranked.findIndex((r) => r.spot.id === target.id) + 1;
  return { answers, ranked, rank };
}
