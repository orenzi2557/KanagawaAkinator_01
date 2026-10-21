// LLM のベンチマーク: npm run bench:llm -- [--models gemma3:4b,qwen2.5:7b]
// 自由記述の解析 10 件と説明文 3 件について、所要時間と JSON の成功率・読み取りの正しさを測り、
// docs/llm-benchmark.md に書き出す。キーワード辞書（フォールバック）の結果も比較用に載せる。

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { TAGS, TAG_LABELS } from "../lib/engine/constants.js";
import { chatJson, chatStream, ollamaConfig, unloadModel } from "../lib/llm/ollama.js";
import { PARSE_SCHEMA, buildParsePrompt, normalizeParseResult } from "../lib/llm/parseText.js";
import { buildExplainPrompt } from "../lib/llm/explain.js";
import { parseTextByKeywords } from "../lib/llm/keywords.js";

const root = path.join(import.meta.dirname, "..");
const spots = JSON.parse(fs.readFileSync(path.join(root, "data", "spots.json"), "utf8"));

const args = process.argv.slice(2);
const modelsIndex = args.indexOf("--models");
const base = ollamaConfig();
const models =
  modelsIndex >= 0 ? args[modelsIndex + 1].split(",") : [...new Set([base.model, "qwen2.5:7b"])];

/** 解析のテストケース。expect はタグの符号（+1 / -1）、budget は期待する予算 */
const PARSE_CASES = [
  { text: "海が見えるところでのんびりしたい", expect: { sea: 1, relax: 1 } },
  { text: "子どもと水族館に行きたい", expect: { family: 1, indoor: 1 } },
  { text: "歴史のあるお寺や神社をめぐりたい", expect: { history: 1 } },
  { text: "あまり歩きたくない", expect: { active: -1 } },
  { text: "雨が降りそうなので屋内がいい", expect: { indoor: 1 } },
  { text: "おいしい中華を食べ歩きしたい", expect: { food: 1 } },
  { text: "山や湖の景色を見たい", expect: { nature: 1 } },
  { text: "アスレチックで思いきり体を動かしたい", expect: { active: 1 } },
  { text: "温泉でゆっくりしたい。予算は気にしない", expect: { relax: 1 }, budget: 3 },
  { text: "なるべくお金をかけずに海で遊びたい", expect: { sea: 1 }, budget: 1 },
];
const PARSE_QUESTION = "どんなふうに過ごしたい？";

const EXPLAIN_CASES = [
  { spotId: "enoshima", tags: ["sea", "food"], texts: ["海鮮が食べたいけど、あまり歩きたくない"] },
  { spotId: "kotokuin", tags: ["history", "relax"], texts: [] },
  { spotId: "cupnoodle", tags: ["indoor", "family"], texts: ["雨でも子どもが楽しめるところ"] },
];

function judge(c, result) {
  const signOk = Object.entries(c.expect).every(
    ([t, sign]) => Math.sign(result.scores[t]) === sign,
  );
  const budgetOk = c.budget === undefined || result.budget === c.budget;
  const extra = TAGS.filter((t) => !(t in c.expect) && result.scores[t] !== 0).length;
  return { correct: signOk && budgetOk, extra };
}

const seconds = (ms) => (ms / 1000).toFixed(1);
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const describeScores = (r) =>
  TAGS.filter((t) => r.scores[t] !== 0)
    .map((t) => `${TAG_LABELS[t]}${r.scores[t] > 0 ? "+" : ""}${r.scores[t]}`)
    .join(" ") + (r.budget ? ` 予算${r.budget}` : "");

async function benchModel(model) {
  const config = { ...base, model, timeoutMs: Math.max(base.timeoutMs, 120000) };
  console.log(`\n=== ${model} ===`);

  // 読み込み時間（初回だけかかる）
  let started = Date.now();
  await chatJson({ ...buildParsePrompt("q", "テスト"), schema: PARSE_SCHEMA }, config).catch(
    () => {},
  );
  const loadMs = Date.now() - started;
  console.log(`読み込み＋初回: ${seconds(loadMs)}s`);

  const parse = [];
  for (const c of PARSE_CASES) {
    started = Date.now();
    let result = null;
    let error = null;
    try {
      result = normalizeParseResult(
        await chatJson(
          { ...buildParsePrompt(PARSE_QUESTION, c.text), schema: PARSE_SCHEMA },
          config,
        ),
      );
    } catch (e) {
      error = e.message;
    }
    const ms = Date.now() - started;
    const verdict = result ? judge(c, result) : { correct: false, extra: 0 };
    parse.push({ case: c, ms, result, error, ...verdict });
    console.log(
      `  解析 ${seconds(ms)}s ${verdict.correct ? "○" : "×"} ${result ? describeScores(result) : error} ← ${c.text}`,
    );
  }

  const explain = [];
  for (const c of EXPLAIN_CASES) {
    const spot = spots.find((s) => s.id === c.spotId);
    started = Date.now();
    let first = null;
    let text = "";
    try {
      const prompt = buildExplainPrompt(spot, { topTags: c.tags, texts: c.texts }, c.tags);
      for await (const chunk of chatStream(prompt, config)) {
        first ??= Date.now() - started;
        text += chunk;
      }
    } catch (e) {
      text = `（エラー: ${e.message}）`;
    }
    const ms = Date.now() - started;
    explain.push({ spot, firstMs: first, ms, text: text.trim() });
    console.log(`  説明 最初の文字 ${seconds(first ?? ms)}s / 全体 ${seconds(ms)}s ${spot.name}`);
  }

  await unloadModel(config);
  return { model, loadMs, parse, explain };
}

function keywordBaseline() {
  return PARSE_CASES.map((c) => {
    const result = parseTextByKeywords(c.text);
    return { case: c, result, ...judge(c, result) };
  });
}

async function ollamaVersion() {
  try {
    const res = await fetch(`${base.baseUrl}/api/version`);
    return (await res.json()).version;
  } catch {
    return "不明";
  }
}

function toMarkdown(results, keywords, version) {
  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const cpu = os.cpus()[0]?.model.trim() ?? "不明";
  const lines = [
    "# LLM ベンチマーク",
    "",
    "> `npm run bench:llm` で自動生成しています。手で編集した内容は次回の実行で上書きされます。",
    "",
    `- 実行日時: ${now}`,
    `- 環境: ${cpu}（${os.cpus().length} スレッド）、RAM ${Math.round(os.totalmem() / 1024 ** 3)} GB、GPU なし`,
    `- Ollama: ${version}`,
    `- 解析: ${PARSE_CASES.length} 件（Ollama の format に JSON スキーマを指定、temperature 0）`,
    `- 説明文: ${EXPLAIN_CASES.length} 件（ストリーミング、num_predict 220）`,
    "",
    "## まとめ",
    "",
    "| モデル | 読み込み＋初回 | 解析 平均 | 解析 最大 | JSON 成功率 | 読み取りの正解 | 余計なタグ（合計） | 説明 最初の文字 平均 | 説明 全体 平均 |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  for (const r of results) {
    const ok = r.parse.filter((p) => p.result).length;
    const correct = r.parse.filter((p) => p.correct).length;
    const extra = r.parse.reduce((s, p) => s + p.extra, 0);
    const times = r.parse.map((p) => p.ms);
    lines.push(
      `| ${r.model} | ${seconds(r.loadMs)}s | ${seconds(avg(times))}s | ${seconds(Math.max(...times))}s | ` +
        `${ok}/${r.parse.length} | ${correct}/${r.parse.length} | ${extra} | ` +
        `${seconds(avg(r.explain.map((e) => e.firstMs ?? e.ms)))}s | ${seconds(avg(r.explain.map((e) => e.ms)))}s |`,
    );
  }
  const kwCorrect = keywords.filter((k) => k.correct).length;
  const kwExtra = keywords.reduce((s, k) => s + k.extra, 0);
  lines.push(
    `| （参考）キーワード辞書 | - | 0.0s | 0.0s | - | ${kwCorrect}/${keywords.length} | ${kwExtra} | - | - |`,
    "",
    "- 読み取りの正解: 期待したタグの符号（＋／−）と予算がすべて合っていれば正解",
    "- 余計なタグ: 文章に書かれていないのに 0 以外になったタグの数（少ないほどよい）",
    "- 目標（要件 9）: 解析は 15 秒以内、説明文は最初の文字が 10 秒以内",
    "",
    "## 解析の詳細",
    "",
    `| 文章 | 期待 | ${results.map((r) => r.model).join(" | ")} | キーワード辞書 |`,
    `|---|---|${results.map(() => "---|").join("")}---|`,
  );
  PARSE_CASES.forEach((c, i) => {
    const expect =
      Object.entries(c.expect)
        .map(([t, s]) => `${TAG_LABELS[t]}${s > 0 ? "+" : "−"}`)
        .join(" ") + (c.budget ? ` 予算${c.budget}` : "");
    const cells = results.map((r) => {
      const p = r.parse[i];
      return p.result
        ? `${p.correct ? "○" : "×"} ${describeScores(p.result)}（${seconds(p.ms)}s）`
        : `JSON 失敗`;
    });
    const k = keywords[i];
    lines.push(
      `| ${c.text} | ${expect} | ${cells.join(" | ")} | ${k.correct ? "○" : "×"} ${describeScores(k.result)} |`,
    );
  });
  lines.push("", "## 説明文の出力（facts 以外のことを書いていないか、人が確認する）", "");
  for (const r of results) {
    lines.push(`### ${r.model}`, "");
    for (const e of r.explain) {
      lines.push(
        `- **${e.spot.name}**（最初の文字 ${seconds(e.firstMs ?? e.ms)}s / 全体 ${seconds(e.ms)}s）`,
        `  > ${e.text.replace(/\n+/g, " ")}`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

const version = await ollamaVersion();
const results = [];
for (const model of models) results.push(await benchModel(model));
const keywords = keywordBaseline();
const outPath = path.join(root, "docs", "llm-benchmark.md");
fs.writeFileSync(outPath, toMarkdown(results, keywords, version) + "\n");
console.log(`\n${outPath} に書き出しました`);
