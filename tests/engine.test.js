import { describe, it, expect } from "vitest";
import {
  BUDGET_PENALTY,
  LEAD_THRESHOLD,
  MAX_QUESTIONS,
  TOP_K,
  isFinished,
  matchPercents,
  matchReasons,
  preferenceVector,
  rankDeepCandidates,
  rankSpots,
  selectNextQuestion,
  simulateUser,
  userBudget,
  variance,
} from "@/lib/engine";
import { answer, sampleQuestions as Q, sampleSpots as S } from "./fixtures/sample.js";

const scoreOf = (ranked, id) => ranked.find((r) => r.spot.id === id).score;

describe("スコア計算", () => {
  it("回答がなければ全員 0 点で定義順", () => {
    const ranked = rankSpots(S, Q, []);
    expect(ranked.map((r) => r.score)).toEqual([0, 0, 0, 0, 0, 0]);
    expect(ranked.map((r) => r.spot.id)).toEqual(S.map((s) => s.id));
  });

  it("deep 回答は weight × タグ値", () => {
    const ranked = rankSpots(S, Q, [answer("q_sea", "yes")]);
    expect(scoreOf(ranked, "beach")).toBe(2 * 3);
    expect(scoreOf(ranked, "lake")).toBe(0);
    expect(ranked[0].spot.id).toBe("beach");
  });

  it("「いいえ」は −2 倍、「どちらでもない」は 0", () => {
    const ranked = rankSpots(S, Q, [answer("q_history", "no"), answer("q_sea", "neutral")]);
    expect(scoreOf(ranked, "temple")).toBe(-2 * 3);
    expect(scoreOf(ranked, "beach")).toBe(0);
  });

  it("required 回答は effect とタグ値の内積", () => {
    const ranked = rankSpots(S, Q, [answer("r_companion", 3)]); // 家族: family 2, indoor 1
    expect(scoreOf(ranked, "park")).toBe(2 * 3 + 1 * 1);
    expect(scoreOf(ranked, "onsen")).toBe(2 * 1 + 1 * 2);
  });

  it("自由記述の点数を TEXT_WEIGHT 倍で加算する（自由記述だけの回答も可）", () => {
    const ranked = rankSpots(S, Q, [
      answer("q_sea", null, { text: "温泉", textScores: { relax: 2, food: -1 } }),
    ]);
    expect(scoreOf(ranked, "onsen")).toBe(2 * 3 - 1 * 2);
  });

  it("予算オーバーは 1 段階ごとに減点", () => {
    const answers = [answer("r_budget", 0)]; // 安く = 1
    const ranked = rankSpots(S, Q, answers);
    expect(userBudget(Q, answers)).toBe(1);
    expect(scoreOf(ranked, "temple")).toBe(0);
    expect(scoreOf(ranked, "town")).toBe(-BUDGET_PENALTY);
    expect(scoreOf(ranked, "park")).toBe(-2 * BUDGET_PENALTY);
  });

  it("自由記述の予算は後から上書きする", () => {
    const answers = [answer("r_budget", 0), answer("q_food", null, { textBudget: 3 })];
    expect(userBudget(Q, answers)).toBe(3);
  });

  it("好みベクトルは全回答の合計", () => {
    const v = preferenceVector(Q, [
      answer("r_companion", 0),
      answer("q_history", "probably", { textScores: { history: 2 } }),
    ]);
    expect(v.history).toBe(1 + 1 + 2);
    expect(v.relax).toBe(1);
  });
});

describe("マッチ度とマッチ理由", () => {
  it("min-max 正規化で 0〜100", () => {
    const ranked = rankSpots(S, Q, [answer("q_sea", "yes")]);
    const p = matchPercents(ranked);
    expect(p.get("beach")).toBe(100);
    expect(p.get("temple")).toBe(0);
  });

  it("全員同点なら 100", () => {
    const p = matchPercents(rankSpots(S, Q, []));
    expect([...p.values()].every((v) => v === 100)).toBe(true);
  });

  it("好みが正でタグ値 2 以上のタグを、寄与の大きい順に返す", () => {
    const pref = preferenceVector(Q, [answer("q_sea", "yes"), answer("q_active", "probably")]);
    expect(matchReasons(S[2], pref)).toEqual(["sea", "active"]);
    expect(matchReasons(S[0], pref)).toEqual([]);
  });
});

describe("次の質問の選択", () => {
  it("必須質問を定義順に出す", () => {
    expect(selectNextQuestion(S, Q, []).id).toBe("r_companion");
    expect(selectNextQuestion(S, Q, [answer("r_companion", 0)]).id).toBe("r_budget");
  });

  it("必須質問の後は上位 K 件の分散が最大の deep 質問", () => {
    const answers = [answer("r_companion", 1), answer("r_budget", 2)];
    const candidates = rankDeepCandidates(S, Q, answers);
    const top = rankSpots(S, Q, answers).slice(0, TOP_K);
    const sea = candidates.find((c) => c.question.id === "q_sea");
    expect(sea.variance).toBeCloseTo(variance(top.map((r) => r.spot.tags.sea)));
    const best = candidates.reduce((a, b) => (b.priority > a.priority ? b : a));
    expect(selectNextQuestion(S, Q, answers).id).toBe(best.question.id);
  });

  it("同点なら定義順（q_sea が q_sea2 より先）", () => {
    const answers = [answer("r_companion", 1), answer("r_budget", 2)];
    const c = rankDeepCandidates(S, Q, answers);
    const sea = c.find((x) => x.question.id === "q_sea");
    const sea2 = c.find((x) => x.question.id === "q_sea2");
    expect(sea.priority).toBe(sea2.priority);
    expect(c.indexOf(sea)).toBeLessThan(c.indexOf(sea2));
  });

  it("自由記述で強く表明されたタグは優先度を下げる", () => {
    const base = [answer("r_companion", 1), answer("r_budget", 2)];
    const withText = [base[0], answer("r_budget", 2, { text: "海がいい", textScores: { sea: 2 } })];
    const p0 = rankDeepCandidates(S, Q, base).find((c) => c.question.id === "q_sea");
    const p1 = rankDeepCandidates(S, Q, withText).find((c) => c.question.id === "q_sea");
    expect(p0.priority).toBe(p0.variance);
    expect(p1.priority).toBeLessThan(p1.variance);
  });

  it("聞いた質問は二度と出さない", () => {
    const answers = [answer("r_companion", 0), answer("r_budget", 0)];
    const seen = new Set(answers.map((a) => a.questionId));
    for (let i = 0; i < 9; i++) {
      const q = selectNextQuestion(S, Q, answers);
      expect(seen.has(q.id)).toBe(false);
      seen.add(q.id);
      answers.push(answer(q.id, "neutral"));
    }
    expect(selectNextQuestion(S, Q, answers)).toBeNull();
  });
});

describe("終了判定", () => {
  const base = [answer("r_companion", 1), answer("r_budget", 2)];

  it("deep 質問が最低問数未満なら差が大きくても続ける", () => {
    const answers = [
      ...base,
      answer("q_sea", "yes"),
      answer("q_sea2", "yes"),
      answer("q_history", "no"),
    ];
    const [a, b] = rankSpots(S, Q, answers);
    expect(a.score - b.score).toBeGreaterThanOrEqual(LEAD_THRESHOLD);
    expect(isFinished(S, Q, answers)).toBe(false);
  });

  it("deep 4 問以上で 1位と2位の差が閾値以上なら終了", () => {
    const answers = [
      ...base,
      answer("q_sea", "yes"),
      answer("q_sea2", "yes"),
      answer("q_history", "no"),
      answer("q_indoor", "no"),
    ];
    expect(isFinished(S, Q, answers)).toBe(true);
  });

  it("差が小さければ続ける", () => {
    const answers = [
      ...base,
      answer("q_nature", "neutral"),
      answer("q_food", "neutral"),
      answer("q_relax", "neutral"),
      answer("q_indoor", "neutral"),
    ];
    expect(isFinished(S, Q, answers)).toBe(false);
  });

  it("合計 MAX_QUESTIONS 問で終了", () => {
    const deep = Q.filter((q) => q.tier === "deep").slice(0, MAX_QUESTIONS - 2);
    const answers = [...base, ...deep.map((q) => answer(q.id, "neutral"))];
    expect(answers.length).toBe(MAX_QUESTIONS);
    expect(isFinished(S, Q, answers)).toBe(true);
    expect(isFinished(S, Q, answers.slice(0, -1))).toBe(false);
  });
});

describe("仮データでのシミュレーション", () => {
  it.each(S.map((s) => [s.id, s]))("%s を正解とする仮想ユーザーで 1 位になる", (_id, spot) => {
    const { rank, answers } = simulateUser(spot, S, Q);
    expect(rank).toBe(1);
    expect(answers.length).toBeLessThanOrEqual(MAX_QUESTIONS);
  });
});
