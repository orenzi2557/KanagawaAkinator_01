// 終了判定（要件 6.3）

import { LEAD_THRESHOLD, MAX_QUESTIONS, MIN_DEEP_QUESTIONS } from "./constants.js";
import { indexQuestions, rankSpots } from "./score.js";
import { selectNextQuestion } from "./selectQuestion.js";

export function countDeepAnswers(questions, answers) {
  const byId = indexQuestions(questions);
  return answers.filter((a) => byId.get(a.questionId)?.tier === "deep").length;
}

/** 質問を終了してよいか */
export function isFinished(spots, questions, answers) {
  if (answers.length >= MAX_QUESTIONS) return true;
  if (selectNextQuestion(spots, questions, answers) === null) return true;
  if (countDeepAnswers(questions, answers) < MIN_DEEP_QUESTIONS) return false;
  const [first, second] = rankSpots(spots, questions, answers);
  return !second || first.score - second.score >= LEAD_THRESHOLD;
}
