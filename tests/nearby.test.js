import { describe, it, expect } from "vitest";
import { findNearby, haversineKm } from "@/lib/engine";
import { sampleSpots as S } from "./fixtures/sample.js";

describe("ハバーサイン距離", () => {
  it("同じ点は 0", () => {
    expect(haversineKm(35, 139, 35, 139)).toBe(0);
  });

  it("経線方向に緯度 1 度は約 111.19 km", () => {
    expect(haversineKm(35, 139, 36, 139)).toBeCloseTo(111.19, 1);
  });

  it("赤道上で経度 90 度は地球一周の 1/4", () => {
    expect(haversineKm(0, 0, 0, 90)).toBeCloseTo((2 * Math.PI * 6371) / 4, 6);
  });

  it("対称", () => {
    expect(haversineKm(35.3, 139.5, 35.6, 139.2)).toBeCloseTo(
      haversineKm(35.6, 139.2, 35.3, 139.5),
    );
  });
});

describe("近くのスポット", () => {
  it("自分を除き近い順に 2 件", () => {
    const near = findNearby(S[0], S);
    expect(near).toHaveLength(2);
    expect(near.map((n) => n.spot.id)).toEqual(["beach", "town"]);
    expect(near[0].distanceKm).toBeLessThan(near[1].distanceKm);
  });

  it("同じ距離ならスコアが高い方", () => {
    const center = { id: "c", lat: 35, lng: 139 };
    const a = { id: "a", lat: 35.1, lng: 139 };
    const b = { id: "b", lat: 34.9, lng: 139 };
    const pick = (scores) => findNearby(center, [center, a, b], new Map(scores), 1)[0].spot.id;
    expect(
      pick([
        ["a", 1],
        ["b", 5],
      ]),
    ).toBe("b");
    expect(
      pick([
        ["a", 5],
        ["b", 1],
      ]),
    ).toBe("a");
  });
});
