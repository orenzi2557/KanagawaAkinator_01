// 結果画面に出す内容を回答から計算する（React に依存しない）。

import {
  findNearby,
  matchPercents,
  matchReasons,
  preferenceVector,
  rankSpots,
} from "./engine/index.js";
import { buildAnswersSummary } from "./llm/explain.js";

const CANDIDATE_COUNT = 3;

export function buildResult(spots, questions, answers, selectedSpotId = null) {
  const ranked = rankSpots(spots, questions, answers);
  const percents = matchPercents(ranked);
  const preference = preferenceVector(questions, answers);
  const scoresById = new Map(ranked.map((r) => [r.spot.id, r.score]));

  const candidates = ranked.slice(0, CANDIDATE_COUNT).map((r, i) => ({
    rank: i + 1,
    spot: r.spot,
    score: r.score,
    percent: percents.get(r.spot.id),
    reasons: matchReasons(r.spot, preference),
  }));

  // 2位・3位をクリックしたときは、その候補を主役にする（候補以外の ID は無視）
  const main = candidates.find((c) => c.spot.id === selectedSpotId) ?? candidates[0];
  const others = candidates.filter((c) => c !== main);
  const nearby = findNearby(main.spot, spots, scoresById);

  return {
    main,
    others,
    nearby,
    summary: buildAnswersSummary(preference, answers),
  };
}
