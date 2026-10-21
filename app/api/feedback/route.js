import { z } from "zod";
import { getDb, saveFeedback } from "@/lib/db";
import { spotById } from "@/lib/data";

export const runtime = "nodejs";

const answerSchema = z
  .object({
    questionId: z.string().max(50),
    choice: z.union([z.string().max(20), z.number().int(), z.null()]),
    text: z.string().max(500).optional(),
  })
  .passthrough();

const feedbackSchema = z.object({
  spotId: z.string().refine((id) => spotById.has(id), "不明な spotId です"),
  rating: z.number().int().min(1).max(5),
  wantToGo: z.boolean(),
  comment: z.string().max(1000).optional().nullable(),
  answers: z.array(answerSchema).max(20),
});

/** フィードバックを保存する */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const input = feedbackSchema.safeParse(body);
  if (!input.success) {
    return Response.json({ error: "入力が不正です", issues: input.error.issues }, { status: 400 });
  }
  saveFeedback(getDb(), input.data);
  return Response.json({ ok: true });
}
