// シミュレーションテスト（要件 11）: 18 件それぞれを正解とする仮想ユーザーで、
// 1 位になる割合が 15/18 以上、3 位以内が 18/18 であることを確認する。

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

describe("シミュレーション（18 件）", () => {
  it("1 位になる割合が 15/18 以上", () => {
    const top1 = results.filter((r) => r.rank === 1).length;
    expect(top1).toBeGreaterThanOrEqual(15);
  });

  it("3 位以内が 18/18", () => {
    const misses = results.filter((r) => r.rank > 3).map((r) => `${r.spot.id}: ${r.rank} 位`);
    expect(misses).toEqual([]);
  });

  it.each(results.map((r) => [r.spot.id, r]))("%s: 上限問数以内で終わる", (_id, r) => {
    expect(r.answers.length).toBeLessThanOrEqual(MAX_QUESTIONS);
    expect(r.answers.length).toBeGreaterThanOrEqual(3 + 4);
  });
});
