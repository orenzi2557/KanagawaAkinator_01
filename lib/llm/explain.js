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

/**
 * 説明文生成のプロンプト。facts だけを事実情報として渡す。
 * 好みは「このスポットと合っているタグ（reasonTags）」だけを渡し、合わない好みから話を作らせない。
 */
export function buildExplainPrompt(spot, summary, reasonTags = []) {
  const matched =
    reasonTags.length > 0 ? reasonTags.map((t) => TAG_LABELS[t] ?? t).join("・") : "特になし";
  const texts =
    summary.texts.length > 0 ? summary.texts.map((t) => `- ${t}`).join("\n") : "- （なし）";
  const facts = spot.facts.map((f) => `- ${f}`).join("\n");

  const system = [
    "あなたは神奈川県の観光案内係です。",
    "観光地の事実情報をもとに、その観光地が利用者に合う理由を日本語で2〜3文で書きます。",
    "守ること:",
    "- 事実情報に書かれている内容だけを根拠にする。事実情報にない名物・料理・お店・施設・体験は書かない。",
    "- 利用者の希望のうち、事実情報と関係がないものには触れない。",
    "- 営業時間・料金・アクセス・混雑状況は書かない。",
    "- 見出し・箇条書き・絵文字は使わず、です・ます調の文章だけを出力する。",
  ].join("\n");

  const user = [
    `観光地: ${spot.name}（${spot.area}）`,
    `事実情報:\n${facts}`,
    `利用者の好みとこの観光地が合っている点: ${matched}`,
    `利用者の自由記述（参考）:\n${texts}`,
    "事実情報だけを使って、この観光地が利用者に合う理由を2〜3文で書いてください。",
  ].join("\n\n");

  return { system, user };
}

const cleanChunk = (s) => s.replace(/\*\*|__|`/g, "");

/**
 * 説明文をストリーミングで作る。最初の断片が来なければテンプレート文にする。
 * @param {(req: object) => AsyncIterable<string>} chatStream LLM 呼び出し（テストではモックを渡す）
 * @returns {Promise<{ source: "llm"|"template", stream: ReadableStream<Uint8Array> }>}
 */
export async function streamExplanation(
  spot,
  summary,
  reasonTags,
  { chatStream, enabled = true, signal },
) {
  const encoder = new TextEncoder();
  const templateStream = () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(templateReason(spot, reasonTags)));
        controller.close();
      },
    });

  if (!enabled) return { source: "template", stream: templateStream() };

  let iterator;
  let first;
  try {
    iterator = chatStream({ ...buildExplainPrompt(spot, summary, reasonTags), signal })[
      Symbol.asyncIterator
    ]();
    first = await iterator.next();
    if (first.done) throw new Error("空の応答");
  } catch (error) {
    console.warn("[explain] LLM の生成に失敗したためテンプレート文を使います:", error.message);
    return { source: "template", stream: templateStream() };
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(cleanChunk(first.value)));
    },
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(cleanChunk(value)));
      } catch (error) {
        // 途中で失敗したら、そこまでの文章で終える
        console.warn("[explain] ストリーミングが途中で終了しました:", error.message);
        controller.close();
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });
  return { source: "llm", stream };
}
