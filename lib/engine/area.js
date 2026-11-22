// おすすめエリア: 主役のスポットと同じエリア（spot.region）の、スコアが高いスポット。

import { AREA_SPOT_COUNT, REGION_LABELS } from "./constants.js";

/**
 * @param {object} main 主役のスポット
 * @param {{ spot: object, score: number }[]} ranked rankSpots の結果（スコアの高い順）
 * @param {string[]} [excludeIds] 並べないスポット ID（近くのスポットなど、ほかの欄に出すもの）
 * @returns {{ region: string, label: string, spots: { spot: object, score: number }[] } | null}
 *   main に region がなければ null
 */
export function recommendArea(main, ranked, excludeIds = [], count = AREA_SPOT_COUNT) {
  if (!main?.region) return null;
  const excluded = new Set([main.id, ...excludeIds]);
  const spots = ranked
    .filter((r) => r.spot.region === main.region && !excluded.has(r.spot.id))
    .slice(0, count);
  return { region: main.region, label: REGION_LABELS[main.region] ?? main.region, spots };
}
