import { describe, it, expect } from "vitest";
import { parseTextByKeywords } from "@/lib/llm/keywords.js";

describe("キーワード辞書", () => {
  it("要件の例: 海・ビーチ → sea +2、歩きたくない → active −2、雨 → indoor +2", () => {
    expect(parseTextByKeywords("ビーチに行きたい").scores.sea).toBe(2);
    expect(parseTextByKeywords("海").scores.sea).toBe(2);
    expect(parseTextByKeywords("あまり歩きたくない").scores.active).toBe(-2);
    expect(parseTextByKeywords("雨").scores.indoor).toBe(2);
  });

  it("プレースホルダの例文を読み取れる", () => {
    const { scores } = parseTextByKeywords("海鮮が食べたいけど、あまり歩きたくない");
    expect(scores.food).toBe(2);
    expect(scores.active).toBe(-2);
    expect(scores.sea).toBe(1);
  });

  it("言及がないタグは 0", () => {
    const { scores, budget } = parseTextByKeywords("特になし");
    expect(Object.values(scores).every((v) => v === 0)).toBe(true);
    expect(budget).toBeNull();
  });

  it("直後の否定で反転する", () => {
    expect(parseTextByKeywords("海は苦手").scores.sea).toBe(-2);
    expect(parseTextByKeywords("お寺には興味がない").scores.history).toBe(-2);
  });

  it("「けど」の先の否定は前のキーワードに効かない", () => {
    const { scores } = parseTextByKeywords("温泉に入りたいけど歩きたくない");
    expect(scores.relax).toBe(2);
    expect(scores.active).toBe(-2);
  });

  it("点数は −2〜2 に収める", () => {
    const { scores } = parseTextByKeywords("海、海、ビーチ、砂浜、波");
    expect(scores.sea).toBe(2);
  });

  it("予算を読み取る", () => {
    expect(parseTextByKeywords("なるべく安く済ませたい").budget).toBe(1);
    expect(parseTextByKeywords("たまには贅沢したい").budget).toBe(3);
  });

  it("空や null でも落ちない", () => {
    expect(parseTextByKeywords("").budget).toBeNull();
    expect(parseTextByKeywords(null).scores.sea).toBe(0);
  });
});
