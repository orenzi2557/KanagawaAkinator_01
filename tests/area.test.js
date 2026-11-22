import { describe, it, expect } from "vitest";
import { recommendArea } from "@/lib/engine";
import { buildResult } from "@/lib/result";
import spots from "@/data/spots.json";
import questions from "@/data/questions.json";

const spot = (id, region) => ({ id, region });
const ranked = [
  { spot: spot("a", "hakone"), score: 10 },
  { spot: spot("b", "yokohama"), score: 9 },
  { spot: spot("c", "hakone"), score: 8 },
  { spot: spot("d", "hakone"), score: 7 },
  { spot: spot("e", "hakone"), score: 6 },
  { spot: spot("f", "hakone"), score: 5 },
];

describe("おすすめエリア", () => {
  it("主役と同じエリアのスポットをスコア順に 3 件（主役は除く）", () => {
    const area = recommendArea(ranked[0].spot, ranked);
    expect(area.region).toBe("hakone");
    expect(area.label).toBe("箱根");
    expect(area.spots.map((r) => r.spot.id)).toEqual(["c", "d", "e"]);
  });

  it("除外 ID（近くのスポットなど）は並べない", () => {
    const area = recommendArea(ranked[0].spot, ranked, ["c"]);
    expect(area.spots.map((r) => r.spot.id)).toEqual(["d", "e", "f"]);
  });

  it("region がなければ null", () => {
    expect(recommendArea({ id: "x" }, ranked)).toBeNull();
  });

  it("結果画面のデータに、近くのスポットと重ならないおすすめエリアが入る", () => {
    const result = buildResult(spots, questions, []);
    expect(result.area.region).toBe(result.main.spot.region);
    const nearbyIds = result.nearby.map((n) => n.spot.id);
    for (const a of result.area.spots) {
      expect(a.spot.region).toBe(result.main.spot.region);
      expect(nearbyIds).not.toContain(a.spot.id);
      expect(a.percent).toBeTypeOf("number");
    }
  });
});
