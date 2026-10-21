// 「あなたに合う理由」の生成（要件 7.3）。
// このファイルはブラウザからも使うので、サーバー専用の処理（Ollama 呼び出し）は ollama.js に置く。

import { TAGS, TAG_LABELS } from "../engine/constants.js";

const MAX_TEXTS = 3;
const MAX_TEXT_LENGTH = 100;

/** 回答の要約: 好みの上位タグと自由記述 */
export function buildAnswersSummary(preference, answers) {
  const topTags = TAGS.filter((t) => preference[t] > 0)
    .sort((a, b) => preference[b] - preference[a])
    .slice(0, 3);
  const texts = answers
    .map((a) => (a.text ?? "").trim())
    .filter(Boolean)
    .slice(-MAX_TEXTS)
    .map((t) => t.slice(0, MAX_TEXT_LENGTH));
  return { topTags, texts };
}

const hashtags = (tags) => tags.map((t) => `#${TAG_LABELS[t] ?? t}`).join(" ");

/** LLM が使えないときのテンプレート文 */
export function templateReason(spot, reasonTags) {
  if (reasonTags.length > 0) {
    return `${hashtags(reasonTags)} が好きなあなたにぴったりです。${spot.summary}で、きっと満足できるはずです。`;
  }
  return `${spot.summary}。気分転換に立ち寄ってみてはいかがでしょう。`;
}

/** 説明文生成のプロンプト。facts だけを事実情報として渡す */
export function buildExplainPrompt(spot, summary) {
  const likes = summary.topTags.length > 0 ? hashtags(summary.topTags) : "特になし";
  const texts =
    summary.texts.length > 0 ? summary.texts.map((t) => `- ${t}`).join("\n") : "- （なし）";
  const facts = spot.facts.map((f) => `- ${f}`).join("\n");

  const system = [
    "あなたは神奈川県の観光案内係です。",
    "利用者の好みと観光地の事実情報をもとに、その観光地が利用者に合う理由を日本語で2〜3文で書きます。",
    "守ること:",
    "- 事実情報に書かれていないことは書かない。",
    "- 営業時間・料金・アクセス・混雑状況は書かない。",
    "- 見出し・箇条書き・絵文字は使わず、です・ます調の文章だけを出力する。",
  ].join("\n");

  const user = [
    `観光地: ${spot.name}（${spot.area}）`,
    `事実情報:\n${facts}`,
    `利用者の好み: ${likes}`,
    `利用者の自由記述:\n${texts}`,
    "この観光地が利用者に合う理由を2〜3文で書いてください。",
  ].join("\n\n");

  return { system, user };
}
