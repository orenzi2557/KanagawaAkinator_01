// 自由記述のキーワード辞書（LLM が使えないときのフォールバック、要件 7.2）。
// 長いキーワードから順に照合し、一度使った文字は短いキーワードに再利用しない
// （「歩きたくない」が「歩き」にも当たらないようにするため）。

import { TAGS } from "../engine/constants.js";

/** [キーワード, タグ点数] */
const TAG_RULES = [
  // 否定を含む表現（先に長い順で照合されるので、肯定のキーワードより優先される）
  ["歩きたくない", { active: -2 }],
  ["あまり歩かない", { active: -2 }],
  ["歩くのは苦手", { active: -2 }],
  ["疲れたくない", { active: -2, relax: 1 }],
  ["動きたくない", { active: -2, relax: 1 }],
  ["楽したい", { active: -1, relax: 1 }],
  ["人混みは苦手", { relax: 1 }],

  // 海
  ["海水浴", { sea: 2, active: 1 }],
  ["ビーチ", { sea: 2 }],
  ["砂浜", { sea: 2 }],
  ["海辺", { sea: 2 }],
  ["海岸", { sea: 2 }],
  ["夕日", { sea: 1, nature: 1 }],
  ["灯台", { sea: 1, nature: 1 }],
  ["波", { sea: 2 }],
  ["海", { sea: 2 }],
  ["島", { sea: 1 }],

  // グルメ（「海鮮」は「海」より長いので先に当たる）
  ["食べ歩き", { food: 2, active: 1 }],
  ["グルメ", { food: 2 }],
  ["おいしい", { food: 2 }],
  ["美味しい", { food: 2 }],
  ["海鮮", { food: 2, sea: 1 }],
  ["しらす", { food: 2, sea: 1 }],
  ["中華", { food: 2 }],
  ["ラーメン", { food: 2 }],
  ["スイーツ", { food: 2 }],
  ["ランチ", { food: 1 }],
  ["ご飯", { food: 1 }],
  ["食べ", { food: 2 }],
  ["飲み", { food: 1 }],

  // 歴史
  ["歴史", { history: 2 }],
  ["神社", { history: 2 }],
  ["お寺", { history: 2 }],
  ["寺", { history: 2 }],
  ["大仏", { history: 2 }],
  ["仏像", { history: 2 }],
  ["史跡", { history: 2 }],
  ["御朱印", { history: 2 }],
  ["古都", { history: 2 }],
  ["レトロ", { history: 1 }],

  // 自然
  ["自然", { nature: 2 }],
  ["絶景", { nature: 2 }],
  ["景色", { nature: 1 }],
  ["富士山", { nature: 2 }],
  ["紅葉", { nature: 2 }],
  ["アジサイ", { nature: 1, history: 1 }],
  ["あじさい", { nature: 1, history: 1 }],
  ["湖", { nature: 2 }],
  ["山", { nature: 2 }],
  ["森", { nature: 2 }],
  ["緑", { nature: 1 }],
  ["花", { nature: 1 }],

  // アクティブ
  ["アスレチック", { active: 2, family: 1 }],
  ["アトラクション", { active: 2, family: 1 }],
  ["絶叫", { active: 2 }],
  ["体を動か", { active: 2 }],
  ["ハイキング", { active: 2, nature: 1 }],
  ["運動", { active: 2 }],
  ["たくさん歩", { active: 2 }],
  ["歩きたい", { active: 1 }],
  ["遊びたい", { active: 1 }],
  ["キャンプ", { active: 1, nature: 2 }],

  // のんびり
  ["のんびり", { relax: 2 }],
  ["ゆっくり", { relax: 2 }],
  ["癒やされ", { relax: 2 }],
  ["癒され", { relax: 2 }],
  ["癒やし", { relax: 2 }],
  ["癒し", { relax: 2 }],
  ["リラックス", { relax: 2 }],
  ["温泉", { relax: 2 }],
  ["静か", { relax: 1 }],
  ["休み", { relax: 1 }],

  // 屋内
  ["雨", { indoor: 2 }],
  ["屋内", { indoor: 2 }],
  ["室内", { indoor: 2 }],
  ["博物館", { indoor: 2 }],
  ["ミュージアム", { indoor: 2 }],
  ["水族館", { indoor: 2, family: 1, sea: 1 }],
  ["買い物", { indoor: 1, food: 1 }],
  ["ショッピング", { indoor: 1 }],

  // 家族
  ["子ども", { family: 2 }],
  ["子供", { family: 2 }],
  ["こども", { family: 2 }],
  ["キッズ", { family: 2 }],
  ["家族", { family: 2 }],
  ["赤ちゃん", { family: 2, indoor: 1 }],
];

/** [キーワード, 予算] */
const BUDGET_RULES = [
  ["お金をかけたくない", 1],
  ["お金をかけず", 1],
  ["安く", 1],
  ["安い", 1],
  ["節約", 1],
  ["無料", 1],
  ["タダ", 1],
  ["贅沢", 3],
  ["ぜいたく", 3],
  ["奮発", 3],
  ["ご褒美", 3],
  ["高くても", 3],
];

/** キーワードの直後（句読点や「けど」まで、8 文字以内）にあると点数を反転させる語 */
const NEGATION =
  /^(?:(?!けど|けれど|でも|だけど)[^、。，．,.!！?？\n]){0,8}?(嫌|苦手|いや|イヤ|興味(が)?ない|じゃない|ではない|以外|たくない|しない|ない)/;

const clamp = (v) => Math.max(-2, Math.min(2, v));

function findAll(text, keyword, used) {
  const hits = [];
  let i = text.indexOf(keyword);
  while (i !== -1) {
    let free = true;
    for (let k = i; k < i + keyword.length; k++) if (used[k]) free = false;
    if (free) {
      for (let k = i; k < i + keyword.length; k++) used[k] = true;
      hits.push(i);
    }
    i = text.indexOf(keyword, i + 1);
  }
  return hits;
}

const byLengthDesc = (rules) => [...rules].sort((a, b) => b[0].length - a[0].length);
const SORTED_TAG_RULES = byLengthDesc(TAG_RULES);
const SORTED_BUDGET_RULES = byLengthDesc(BUDGET_RULES);

/**
 * キーワード辞書で自由記述をタグ点数に変換する。
 * @returns {{ scores: Record<string, number>, budget: 1|2|3|null }}
 */
export function parseTextByKeywords(text) {
  const scores = Object.fromEntries(TAGS.map((t) => [t, 0]));
  const source = String(text ?? "");
  const used = new Array(source.length).fill(false);

  for (const [keyword, effect] of SORTED_TAG_RULES) {
    for (const index of findAll(source, keyword, used)) {
      const after = source.slice(index + keyword.length);
      // 否定形のルール（値が負）はそのまま使い、肯定のキーワードは直後の否定で反転する
      const isNegativeRule = Object.values(effect).some((v) => v < 0);
      const sign = !isNegativeRule && NEGATION.test(after) ? -1 : 1;
      for (const [tag, value] of Object.entries(effect)) scores[tag] += sign * value;
    }
  }

  let budget = null;
  const budgetUsed = new Array(source.length).fill(false);
  for (const [keyword, value] of SORTED_BUDGET_RULES) {
    if (findAll(source, keyword, budgetUsed).length > 0) budget = budget ?? value;
  }

  for (const t of TAGS) scores[t] = clamp(scores[t]);
  return { scores, budget };
}
