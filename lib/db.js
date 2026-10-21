// SQLite（better-sqlite3）。フィードバックと回答ログを保存する（要件 8.1）。サーバー専用。

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  spot_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  want_to_go INTEGER NOT NULL,
  comment TEXT,
  answers_json TEXT NOT NULL
);
`;

/** DB を開き、テーブルがなければ作る。":memory:" も使える（テスト用） */
export function openDb(dbPath) {
  if (dbPath !== ":memory:") fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(SCHEMA);
  return db;
}

let shared = null;

/** アプリ全体で使う DB（DATABASE_PATH、既定は ./data/app.db） */
export function getDb() {
  shared ??= openDb(process.env.DATABASE_PATH || "./data/app.db");
  return shared;
}

/** 共有の DB を閉じる（テストの後片付け用） */
export function closeDb() {
  shared?.close();
  shared = null;
}

/** @returns {number} 追加した行の id */
export function saveFeedback(db, { spotId, rating, wantToGo, comment, answers }) {
  const info = db
    .prepare(
      `INSERT INTO feedback (spot_id, rating, want_to_go, comment, answers_json)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(spotId, rating, wantToGo ? 1 : 0, comment || null, JSON.stringify(answers));
  return Number(info.lastInsertRowid);
}

/** 集計（発表資料用）: 件数・平均満足度・行きたい率、スポット別 */
export function summarizeFeedback(db) {
  const total = db
    .prepare(
      `SELECT COUNT(*) AS count, AVG(rating) AS avgRating, AVG(want_to_go) AS wantRate FROM feedback`,
    )
    .get();
  const bySpot = db
    .prepare(
      `SELECT spot_id AS spotId, COUNT(*) AS count, AVG(rating) AS avgRating, AVG(want_to_go) AS wantRate
       FROM feedback GROUP BY spot_id ORDER BY count DESC, spot_id`,
    )
    .all();
  const comments = db
    .prepare(
      `SELECT created_at AS createdAt, spot_id AS spotId, rating, comment
       FROM feedback WHERE comment IS NOT NULL ORDER BY id`,
    )
    .all();
  return { total, bySpot, comments };
}
