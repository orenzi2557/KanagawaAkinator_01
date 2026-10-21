// 自由記述の解析（要件 7.2）。LLM でタグ点数に変換し、失敗したらキーワード辞書で代替する。

import { z } from "zod";
import { TAGS } from "../engine/constants.js";
import { parseTextByKeywords } from "./keywords.js";

const TAG_DESCRIPTIONS = {
  history: "歴史・寺社",
  nature: "自然・景色（山・湖・森）",
  sea: "海",
  food: "グルメ・食べ歩き",
  active: "体を動かす・アクティブ（たくさん歩く、遊ぶ）",
  relax: "癒やし・のんびり",
  indoor: "屋内・雨でもOK",
  family: "子ども連れ向き",
};

/** 予算の選択肢（LLM には文字列で答えさせ、数値に直す） */
const BUDGET_VALUES = { none: null, low: 1, medium: 2, high: 3 };

/** Ollama の format に渡す JSON スキーマ */
export const PARSE_SCHEMA = {
  type: "object",
  properties: {
    scores: {
      type: "object",
      properties: Object.fromEntries(
        TAGS.map((t) => [t, { type: "integer", minimum: -2, maximum: 2 }]),
      ),
      required: TAGS,
    },
    budget: { type: "string", enum: Object.keys(BUDGET_VALUES) },
  },
  required: ["budget", "scores"],
};

export function buildParsePrompt(question, text) {
  const tagList = TAGS.map((t) => `- ${t}: ${TAG_DESCRIPTIONS[t]}`).join("\n");
  const system = [
    "あなたは旅行の希望を読み取るアシスタントです。",
    "利用者の文章から、次の8つの観点それぞれについて、行きたい気持ちを -2〜2 の整数で評価します。",
    tagList,
    "評価の基準: 2 = はっきり望んでいる、1 = 少し望んでいる、0 = 書かれていない・どちらでもない、-1 = あまり望んでいない、-2 = はっきり避けたい。",
    "文章から読み取れることだけを評価し、書かれていないことは必ず 0 にしてください。",
    'budget は予算の希望です。お金・値段・予算について書かれていなければ必ず "none" にしてください。',
    '書かれている場合だけ: "low" = 安く済ませたい、"medium" = ふつう、"high" = 贅沢してもいい。',
    '例: 「子どもと水族館に行きたい」→ family 2、indoor 2、ほかのタグは 0、budget "none"',
    "JSON だけを出力してください。",
  ].join("\n");
  const user = `質問: ${question}\n回答: ${text}`;
  return { system, user };
}

const resultSchema = z.object({
  scores: z.object(Object.fromEntries(TAGS.map((t) => [t, z.number()]))),
  budget: z.enum(Object.keys(BUDGET_VALUES)),
});

/** LLM の出力を検証し、-2〜2 の整数と budget(1|2|3|null) に直す。不正なら例外 */
export function normalizeParseResult(raw) {
  const parsed = resultSchema.parse(raw);
  const scores = Object.fromEntries(
    TAGS.map((t) => [t, Math.max(-2, Math.min(2, Math.round(parsed.scores[t])))]),
  );
  return { scores, budget: BUDGET_VALUES[parsed.budget] };
}

/**
 * @param {(req: object) => Promise<unknown>} chatJson LLM 呼び出し（テストではモックを渡す）
 * @returns {Promise<{ scores: object, budget: 1|2|3|null, source: "llm"|"keywords" }>}
 */
export async function parseText(question, text, { chatJson, enabled = true }) {
  if (enabled) {
    try {
      const raw = await chatJson({ ...buildParsePrompt(question, text), schema: PARSE_SCHEMA });
      return { ...normalizeParseResult(raw), source: "llm" };
    } catch (error) {
      console.warn("[parse-text] LLM の解析に失敗したためキーワード辞書を使います:", error.message);
    }
  }
  return { ...parseTextByKeywords(text), source: "keywords" };
}
