// スコア計算（要件 6.1）。React に依存しない純粋関数。
//
// answer の形:
// {
//   questionId: string,
//   choice: string | number | null,  // deep は "yes" など、required は options の添字
//   text: string,                     // 自由記述（空文字可）
//   textScores: { [tag]: number } | null, // 自由記述の解析結果（-2〜2）
//   textBudget: 1 | 2 | 3 | null,     // 自由記述から読み取った予算
// }

import { ANSWER_WEIGHTS, BUDGET_PENALTY, MAX_REASON_TAGS, TAGS, TEXT_WEIGHT } from "./constants.js";

export function indexQuestions(questions) {
  return new Map(questions.map((q) => [q.id, q]));
}

function emptyVector() {
  return Object.fromEntries(TAGS.map((t) => [t, 0]));
}

/** 選択肢（4択・必須質問の選択肢）だけから作るタグの好みベクトル */
function choiceVector(question, choice) {
  const v = emptyVector();
  if (choice === null || choice === undefined || !question) return v;
  if (question.tier === "deep") {
    const w = ANSWER_WEIGHTS[choice] ?? 0;
    v[question.tag] += w;
  } else {
    const option = question.options?.[choice];
    for (const [tag, value] of Object.entries(option?.effect ?? {})) {
      if (tag in v) v[tag] += value;
    }
  }
  return v;
}

/** 自由記述の累積点数（TEXT_WEIGHT をかける前） */
export function textScoreTotals(answers) {
  const v = emptyVector();
  for (const a of answers) {
    for (const [tag, value] of Object.entries(a.textScores ?? {})) {
      if (tag in v) v[tag] += value;
    }
  }
  return v;
}

/**
 * 回答全体から作るタグの好みベクトル。
 * score(spot) の予算以外の部分は、このベクトルと spot.tags の内積になる。
 */
export function preferenceVector(questions, answers) {
  const byId = questions instanceof Map ? questions : indexQuestions(questions);
  const v = emptyVector();
  for (const a of answers) {
    const cv = choiceVector(byId.get(a.questionId), a.choice);
    for (const t of TAGS) v[t] += cv[t];
  }
  const text = textScoreTotals(answers);
  for (const t of TAGS) v[t] += text[t] * TEXT_WEIGHT;
  return v;
}

/** 利用者の予算（1〜3）。後の回答が前の回答を上書きする。未回答なら null */
export function userBudget(questions, answers) {
  const byId = questions instanceof Map ? questions : indexQuestions(questions);
  let budget = null;
  for (const a of answers) {
    const q = byId.get(a.questionId);
    if (q?.tier === "required" && a.choice !== null && a.choice !== undefined) {
      const optionBudget = q.options?.[a.choice]?.budget;
      if (optionBudget !== undefined) budget = optionBudget;
    }
    if (a.textBudget) budget = a.textBudget;
  }
  return budget;
}

export function scoreSpot(spot, preference, budget) {
  let score = 0;
  for (const t of TAGS) score += preference[t] * (spot.tags[t] ?? 0);
  if (budget) score -= BUDGET_PENALTY * Math.max(0, spot.budget - budget);
  return score;
}

/**
 * 全スポットのスコアを計算し、高い順に並べて返す。
 * 同点のときは spots の定義順。
 * @returns {{ spot: object, score: number }[]}
 */
export function rankSpots(spots, questions, answers) {
  const preference = preferenceVector(questions, answers);
  const budget = userBudget(questions, answers);
  return spots
    .map((spot, index) => ({ spot, score: scoreSpot(spot, preference, budget), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ spot, score }) => ({ spot, score }));
}

/** min-max 正規化したマッチ度（0〜100 の整数）。全員同点なら 100 */
export function matchPercents(ranked) {
  const scores = ranked.map((r) => r.score);
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  return new Map(
    ranked.map((r) => [
      r.spot.id,
      max === min ? 100 : Math.round(((r.score - min) / (max - min)) * 100),
    ]),
  );
}

/**
 * マッチ理由のタグ。好みが正で、スポットのタグ値が 2 以上のものを
 * 「好み × タグ値」の大きい順に最大 MAX_REASON_TAGS 件。
 */
export function matchReasons(spot, preference) {
  return TAGS.filter((t) => preference[t] > 0 && spot.tags[t] >= 2)
    .sort((a, b) => preference[b] * spot.tags[b] - preference[a] * spot.tags[a])
    .slice(0, MAX_REASON_TAGS);
}
