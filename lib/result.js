// 結果画面に出す内容を回答から計算する（React に依存しない）。

import {
  findNearby,
  matchPercents,
  matchReasons,
  preferenceVector,
  rankSpots,
  recommendArea,
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
  // おすすめエリア: 主役と同じエリアのスポット（近くのスポット・ほかの候補に出したものは除く）
  const area = recommendArea(main.spot, ranked, [
    ...nearby.map((n) => n.spot.id),
    ...others.map((c) => c.spot.id),
  ]);
  if (area) {
    area.spots = area.spots.map((r) => ({
      spot: r.spot,
      percent: percents.get(r.spot.id),
      reasons: matchReasons(r.spot, preference),
    }));
  }

  return {
    main,
    others,
    nearby,
    area,
    summary: buildAnswersSummary(preference, answers),
  };
}
