// フィードバックの集計（発表資料用）: npm run feedback:summary

import fs from "node:fs";
import path from "node:path";
import { openDb, summarizeFeedback } from "../lib/db.js";

const root = path.join(import.meta.dirname, "..");
const dbPath = process.env.DATABASE_PATH || path.join(root, "data", "app.db");
if (!fs.existsSync(dbPath)) {
  console.log(`DB（${dbPath}）がまだありません。アプリでフィードバックを送ると作られます。`);
  process.exit(0);
}

const spots = JSON.parse(fs.readFileSync(path.join(root, "data", "spots.json"), "utf8"));
const nameOf = (id) => spots.find((s) => s.id === id)?.name ?? id;
const pct = (v) => `${Math.round((v ?? 0) * 100)}%`;
const num = (v) => (v ?? 0).toFixed(2);

const { total, bySpot, comments } = summarizeFeedback(openDb(dbPath));
console.log(`件数: ${total.count}`);
console.log(`平均満足度: ${num(total.avgRating)} / 5`);
console.log(`「行きたい」と答えた割合: ${pct(total.wantRate)}`);
console.log("\n| スポット | 件数 | 平均満足度 | 行きたい |\n|---|---|---|---|");
for (const s of bySpot) {
  console.log(`| ${nameOf(s.spotId)} | ${s.count} | ${num(s.avgRating)} | ${pct(s.wantRate)} |`);
}
if (comments.length > 0) {
  console.log("\nコメント:");
  for (const c of comments) console.log(`- [${nameOf(c.spotId)} ★${c.rating}] ${c.comment}`);
}
