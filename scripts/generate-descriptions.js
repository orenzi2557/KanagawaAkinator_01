// 基本説明の事前生成: npm run generate:descriptions
//   既に説明がある ID はスキップする（人が直した文章を上書きしないため）。
//   --force       全件作り直す
//   --only a,b    指定した ID だけ作る（--force なしでも作り直す）
// 生成後は必ず人が読んで、facts にないことが書かれていないか確認・修正すること。

import fs from "node:fs";
import path from "node:path";
import { chatStream, checkHealth, ollamaConfig } from "../lib/llm/ollama.js";
import { buildDescriptionPrompt, cleanDescription } from "../lib/llm/describe.js";

const dataDir = path.join(import.meta.dirname, "..", "data");
const outPath = path.join(dataDir, "descriptions.json");
const spots = JSON.parse(fs.readFileSync(path.join(dataDir, "spots.json"), "utf8"));

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIndex = args.indexOf("--only");
const only = onlyIndex >= 0 ? new Set(args[onlyIndex + 1]?.split(",")) : null;

const config = ollamaConfig();
const health = await checkHealth(config);
if (!health.ollama) {
  console.error(`Ollama（${config.baseUrl}）にモデル ${config.model} が見つかりません。`);
  console.error("`ollama serve` と `ollama pull " + config.model + "` を確認してください。");
  process.exit(1);
}

const descriptions = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf8")) : {};
// 長めの文章を作るので、通常のタイムアウトより長く待つ
const genConfig = { ...config, timeoutMs: Math.max(config.timeoutMs, 120000) };

console.log(`モデル: ${config.model}`);
for (const spot of spots) {
  const target = only ? only.has(spot.id) : force || !descriptions[spot.id];
  if (!target) {
    console.log(`- ${spot.name}: スキップ（既存）`);
    continue;
  }
  const started = Date.now();
  let text = "";
  for await (const chunk of chatStream(
    { ...buildDescriptionPrompt(spot), numPredict: 300 },
    genConfig,
  )) {
    text += chunk;
  }
  descriptions[spot.id] = cleanDescription(text);
  console.log(
    `- ${spot.name}（${((Date.now() - started) / 1000).toFixed(1)}秒）\n  ${descriptions[spot.id]}`,
  );
  // 途中で止めても、それまでの結果が残るように毎回保存する
  const ordered = Object.fromEntries(
    spots.filter((s) => descriptions[s.id]).map((s) => [s.id, descriptions[s.id]]),
  );
  fs.writeFileSync(outPath, JSON.stringify(ordered, null, 2) + "\n");
}
console.log(`\n${outPath} に保存しました。内容を確認・修正してください。`);
