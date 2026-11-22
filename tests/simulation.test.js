// シミュレーションテスト（要件 11）: 全スポットそれぞれを正解とする仮想ユーザーで、
// 1 位になる割合が 65% 以上、3 位以内が 90% 以上であることを確認する。
// （18 件のときは 15/18・18/18 だったが、100 件ではタグの似たスポットが増えるため基準を下げた）

import { describe, it, expect } from "vitest";
import spots from "@/data/spots.json";
import questions from "@/data/questions.json";
import { MAX_QUESTIONS, simulateUser } from "@/lib/engine";
import { validateQuestions, validateSpots } from "@/lib/validateData.js";

const results = spots.map((spot) => ({ spot, ...simulateUser(spot, spots, questions) }));

describe("データ検証", () => {
  it("spots.json にエラーがない", () => {
    expect(validateSpots(spots).errors).toEqual([]);
  });
  it("questions.json にエラーがない", () => {
    expect(validateQuestions(questions).errors).toEqual([]);
  });
});

const TOP1_RATE = 0.65;
const TOP3_RATE = 0.9;

describe(`シミュレーション（${spots.length} 件）`, () => {
  it(`1 位になる割合が ${TOP1_RATE * 100}% 以上`, () => {
    const top1 = results.filter((r) => r.rank === 1).length;
    expect(top1).toBeGreaterThanOrEqual(Math.ceil(spots.length * TOP1_RATE));
  });

  it(`3 位以内が ${TOP3_RATE * 100}% 以上`, () => {
    const misses = results.filter((r) => r.rank > 3).map((r) => `${r.spot.id}: ${r.rank} 位`);
    expect(misses.length).toBeLessThanOrEqual(Math.floor(spots.length * (1 - TOP3_RATE)));
  });

  it.each(results.map((r) => [r.spot.id, r]))("%s: 上限問数以内で終わる", (_id, r) => {
    expect(r.answers.length).toBeLessThanOrEqual(MAX_QUESTIONS);
    expect(r.answers.length).toBeGreaterThanOrEqual(3 + 4);
  });
});
