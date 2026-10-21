// サーバー起動時に 1 回だけ呼ばれる。SQLite のテーブルがなければ作っておく（要件 8.1）。
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getDb } = await import("./lib/db.js");
    getDb();
  }
}
