import { afterAll, beforeAll, describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeDb, openDb, saveFeedback, summarizeFeedback } from "@/lib/db.js";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "akinator-test-"));
const answers = [{ questionId: "r_companion", choice: 0, text: "海が見たい" }];

beforeAll(() => {
  process.env.DATABASE_PATH = path.join(tmpDir, "nested", "app.db");
});

afterAll(() => {
  closeDb();
  delete process.env.DATABASE_PATH;
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("SQLite", () => {
  it("テーブルを作り、フィードバックを保存して集計できる", () => {
    const db = openDb(":memory:");
    saveFeedback(db, { spotId: "enoshima", rating: 5, wantToGo: true, comment: "最高", answers });
    saveFeedback(db, { spotId: "enoshima", rating: 3, wantToGo: false, comment: "", answers });
    const row = db.prepare("SELECT * FROM feedback WHERE id = 1").get();
    expect(row.spot_id).toBe("enoshima");
    expect(row.want_to_go).toBe(1);
    expect(JSON.parse(row.answers_json)).toEqual(answers);
    expect(row.created_at).toMatch(/^\d{4}-\d{2}-\d{2} /);

    const { total, bySpot, comments } = summarizeFeedback(db);
    expect(total.count).toBe(2);
    expect(total.avgRating).toBe(4);
    expect(total.wantRate).toBe(0.5);
    expect(bySpot).toHaveLength(1);
    expect(comments.map((c) => c.comment)).toEqual(["最高"]);
  });

  it("rating が範囲外なら DB の CHECK 制約で弾かれる", () => {
    const db = openDb(":memory:");
    expect(() =>
      saveFeedback(db, { spotId: "enoshima", rating: 6, wantToGo: true, answers }),
    ).toThrow();
  });
});

describe("POST /api/feedback", () => {
  const post = (body) =>
    new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  it("保存して { ok: true } を返す（DB とテーブルは自動で作られる）", async () => {
    const { POST } = await import("@/app/api/feedback/route.js");
    const res = await POST(
      post({ spotId: "kotokuin", rating: 4, wantToGo: true, comment: "よかった", answers }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const db = openDb(process.env.DATABASE_PATH);
    expect(db.prepare("SELECT COUNT(*) AS n FROM feedback").get().n).toBe(1);
    db.close();
  });

  it.each([
    ["不明なスポット", { spotId: "unknown", rating: 4, wantToGo: true, answers }],
    ["rating が 0", { spotId: "kotokuin", rating: 0, wantToGo: true, answers }],
    ["wantToGo がない", { spotId: "kotokuin", rating: 4, answers }],
    ["answers が配列でない", { spotId: "kotokuin", rating: 4, wantToGo: true, answers: "x" }],
  ])("%s なら 400", async (_name, body) => {
    const { POST } = await import("@/app/api/feedback/route.js");
    expect((await POST(post(body))).status).toBe(400);
  });
});
