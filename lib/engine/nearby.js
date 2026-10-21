// 近くのスポット（要件 6.4）

import { NEARBY_COUNT } from "./constants.js";

const EARTH_RADIUS_KM = 6371;

const toRad = (deg) => (deg * Math.PI) / 180;

/** ハバーサイン公式による 2 点間の距離（km） */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * target から近い順に count 件。同じ距離ならスコアが高い方を優先する。
 * @param {Map<string, number>} [scoresById] スポット ID → スコア
 * @returns {{ spot: object, distanceKm: number }[]}
 */
export function findNearby(target, spots, scoresById = new Map(), count = NEARBY_COUNT) {
  return spots
    .filter((s) => s.id !== target.id)
    .map((spot) => ({
      spot,
      distanceKm: haversineKm(target.lat, target.lng, spot.lat, spot.lng),
    }))
    .sort(
      (a, b) =>
        a.distanceKm - b.distanceKm ||
        (scoresById.get(b.spot.id) ?? 0) - (scoresById.get(a.spot.id) ?? 0),
    )
    .slice(0, count);
}
