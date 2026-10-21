// シミュレーション結果の表示: npm run simulate
// 各スポットを正解とする仮想ユーザーの順位・問数・上位3件を表で出す（発表資料用）。

import fs from "node:fs";
import path from "node:path";
import { simulateUser } from "../lib/engine/index.js";

const dataDir = path.join(import.meta.dirname, "..", "data");
const spots = JSON.parse(fs.readFileSync(path.join(dataDir, "spots.json"), "utf8"));
const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8"));

console.log("| 正解スポット | 順位 | 問数 | 上位3件（スコア） |");
console.log("|---|---|---|---|");
let top1 = 0;
let top3 = 0;
for (const spot of spots) {
  const { rank, answers, ranked } = simulateUser(spot, spots, questions);
  if (rank === 1) top1++;
  if (rank <= 3) top3++;
  const top = ranked
    .slice(0, 3)
    .map((r) => `${r.spot.name}(${r.score})`)
    .join(" / ");
  console.log(`| ${spot.name} | ${rank} | ${answers.length} | ${top} |`);
}
console.log(`\n1位: ${top1}/${spots.length}、3位以内: ${top3}/${spots.length}`);
