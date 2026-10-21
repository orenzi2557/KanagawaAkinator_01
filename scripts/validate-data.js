// データ検証: npm run validate:data
// 必須項目、タグ値の範囲、座標が神奈川県の範囲内か、ID の重複などを確認する。

import fs from "node:fs";
import path from "node:path";
import { validateDescriptions, validateQuestions, validateSpots } from "../lib/validateData.js";

const dataDir = path.join(import.meta.dirname, "..", "data");
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));

const spots = readJson("spots.json");
const questions = readJson("questions.json");

const results = [
  ["spots.json", validateSpots(spots)],
  ["questions.json", validateQuestions(questions)],
];
if (fs.existsSync(path.join(dataDir, "descriptions.json"))) {
  results.push(["descriptions.json", validateDescriptions(readJson("descriptions.json"), spots)]);
}

let errorCount = 0;
for (const [file, { errors, warnings }] of results) {
  console.log(`\n[${file}] エラー ${errors.length} 件 / 警告 ${warnings.length} 件`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  for (const w of warnings) console.log(`  ! ${w}`);
  errorCount += errors.length;
}

console.log(
  `\nスポット ${spots.length} 件、質問 ${questions.length} 問（必須 ${
    questions.filter((q) => q.tier === "required").length
  } / 踏み込み ${questions.filter((q) => q.tier === "deep").length}）`,
);
if (errorCount > 0) {
  console.log(`\n検証失敗: エラー ${errorCount} 件`);
  process.exit(1);
}
console.log("\n検証 OK");
