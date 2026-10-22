// 「あなたに合う理由」の生成（要件 7.3）。
// このファイルはブラウザからも使うので、サーバー専用の処理（Ollama 呼び出し）は ollama.js に置く。

import { TAGS, TAG_LABELS } from "../engine/constants.js";
import { describeError } from "./errors.js";
import { parseTextByKeywords } from "./keywords.js";

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

/** タグ → 利用者の希望の言い方 */
const WISHES = {
  history: "歴史を感じたい",
  nature: "自然の景色を楽しみたい",
  sea: "海を感じたい",
  food: "おいしいものを食べたい",
  active: "体を動かして遊びたい",
  relax: "のんびり過ごしたい",
  indoor: "雨でも楽しめる場所がいい",
  family: "家族で楽しみたい",
};

/**
 * facts の中にこの語があれば、そのタグの希望を facts で裏付けられるとみなす。
 * 3〜4B のモデルは、facts に根拠のない希望（例: 食べ物の記述がない江の島で「おいしいもの」）を
 * 渡すと、ないお店や料理を作り話で書いてしまうため、渡す前にコードで絞り込む。
 */
const FACT_WORDS = {
  history: [
    "歴史",
    "時代",
    "史跡",
    "創建",
    "開湯",
    "寺",
    "神社",
    "幕府",
    "国宝",
    "明治",
    "大正",
    "江戸",
    "万葉",
    "年",
  ],
  nature: [
    "自然",
    "湖",
    "山",
    "火山",
    "谷",
    "森",
    "景勝",
    "景色",
    "百景",
    "富士山",
    "名所",
    "カルデラ",
    "噴気",
  ],
  sea: ["海", "湾", "浜", "島", "灯台", "磯"],
  food: ["料理", "飲食", "食", "店", "中華", "グルメ", "ラーメン", "名物"],
  active: [
    "アスレチック",
    "アトラクション",
    "遊園地",
    "遊覧船",
    "キャンプ",
    "磯釣り",
    "磯遊び",
    "乗り物",
  ],
  relax: ["温泉", "湯", "旅館", "癒", "のんびり"],
  indoor: ["博物館", "水族館", "展示", "館", "倉庫", "ホール", "施設"],
  family: [
    "遊園地",
    "水族館",
    "博物館",
    "テーマパーク",
    "海水浴",
    "ふれあい",
    "レジャー",
    "公園",
    "ツリー",
  ],
};

/** facts で裏付けられるタグだけを残す */
export function supportedTags(spot, tags) {
  const facts = spot.facts.join(" ");
  return tags.filter((t) => FACT_WORDS[t]?.some((w) => facts.includes(w)));
}

/** 自由記述のうち、書かれている話題がすべて facts で裏付けられるものだけを残す */
export function supportedTexts(spot, texts) {
  return texts.filter((text) => {
    const { scores } = parseTextByKeywords(text);
    const mentioned = TAGS.filter((t) => scores[t] > 0);
    return mentioned.length > 0 && supportedTags(spot, mentioned).length === mentioned.length;
  });
}

const EXPLAIN_SYSTEM = [
  "あなたは神奈川県の観光案内係です。診断の結果おすすめした観光地について、「あなたに合う理由」を2文で書きます。",
  "1文目で利用者の希望に触れ、2文目で事実情報から1〜2個を選んで理由を述べます。全体で80〜110字、です・ます調、改行なし。",
  "使ってよい事実は「事実情報」に書かれていることだけです。書かれていない名物・料理・お店・展示・体験は書きません。",
  "事実情報に関係する記述がない希望には触れません。営業時間・料金・アクセス・混雑状況は書きません。",
  "",
  "【例】",
  "観光地: 青葉城跡（架空）",
  "事実情報:",
  "- 戦国時代に築かれた山城の跡",
  "- 本丸跡から相模湾を一望できる",
  "利用者の希望: 歴史を感じたい、おいしいものを食べたい",
  "利用者が書いたこと: 「海鮮が食べたい」",
  "出力: 歴史を感じたいあなたに、青葉城跡はぴったりです。戦国時代に築かれた山城の跡を歩き、本丸跡から相模湾を一望すれば、昔の人が見た景色に思いをはせることができます。",
  "（事実情報に食べ物の話がないので、「おいしいもの」「海鮮」には触れていません）",
].join("\n");

/**
 * 説明文生成のプロンプト。facts だけを事実情報として渡す。
 * 希望（reasonTags）と自由記述は、facts で裏付けられるものだけを渡す。
 */
export function buildExplainPrompt(spot, summary, reasonTags = []) {
  const wishes = supportedTags(spot, reasonTags).map((t) => WISHES[t]);
  const texts = supportedTexts(spot, summary.texts);

  const user = [
    `観光地: ${spot.name}（${spot.area}）`,
    `事実情報:\n${spot.facts.map((f) => `- ${f}`).join("\n")}`,
    `利用者の希望: ${wishes.length > 0 ? wishes.join("、") : "特になし"}`,
    `利用者が書いたこと: ${texts.length > 0 ? texts.map((t) => `「${t}」`).join(" ") : "なし"}`,
    "出力:",
  ].join("\n\n");

  return { system: EXPLAIN_SYSTEM, user };
}

/** 説明文生成の LLM オプション（作り話を減らすため温度は低め） */
export const EXPLAIN_OPTIONS = { temperature: 0.2, numPredict: 200 };

/** 長くなりすぎないよう、この文数で打ち切る */
const MAX_SENTENCES = 3;
const SENTENCE_END = /[。！？]/;

/** マークダウン記号と改行を取り除き、MAX_SENTENCES 文で打ち切る */
export async function* tidyExplanation(chunks, maxSentences = MAX_SENTENCES) {
  let sentences = 0;
  let started = false;
  for await (const chunk of chunks) {
    let out = "";
    for (const ch of chunk.replace(/\*\*|__|`|\r?\n/g, "")) {
      if (!started && /\s/.test(ch)) continue;
      started = true;
      out += ch;
      if (SENTENCE_END.test(ch) && ++sentences >= maxSentences) {
        yield out;
        return; // 呼び出し元の for await を抜けると、Ollama への接続も切れる
      }
    }
    if (out) yield out;
  }
}

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
    const prompt = buildExplainPrompt(spot, summary, reasonTags);
    iterator = tidyExplanation(chatStream({ ...prompt, ...EXPLAIN_OPTIONS, signal }))[
      Symbol.asyncIterator
    ]();
    first = await iterator.next();
    if (first.done) throw new Error("空の応答");
  } catch (error) {
    // 利用者が画面を離れて接続が切れた場合は失敗ではないので記録しない
    if (!signal?.aborted) {
      console.warn(
        "[explain] LLM の生成に失敗したためテンプレート文を使います:",
        describeError(error),
      );
    }
    return { source: "template", stream: templateStream() };
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(first.value));
    },
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(value));
      } catch (error) {
        // 途中で失敗したら、そこまでの文章で終える
        if (!signal?.aborted) {
          console.warn("[explain] ストリーミングが途中で終了しました:", describeError(error));
        }
        controller.close();
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });
  return { source: "llm", stream };
}
