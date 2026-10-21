import { z } from "zod";
import { TAGS } from "@/lib/engine/constants";
import { chatStream } from "@/lib/llm/ollama";
import { streamExplanation } from "@/lib/llm/explain";
import { spotById } from "@/lib/data";

export const runtime = "nodejs";

const tagSchema = z.enum(TAGS);
const bodySchema = z.object({
  spotId: z.string().min(1),
  answersSummary: z.object({
    topTags: z.array(tagSchema).max(TAGS.length),
    texts: z.array(z.string().max(200)).max(5),
  }),
  reasonTags: z.array(tagSchema).max(TAGS.length).optional(),
});

/** 「あなたに合う理由」をストリーミングで返す。LLM が使えなければテンプレート文 */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const input = bodySchema.safeParse(body);
  if (!input.success) {
    return Response.json({ error: "入力が不正です", issues: input.error.issues }, { status: 400 });
  }
  const spot = spotById.get(input.data.spotId);
  if (!spot) return Response.json({ error: "不明な spotId です" }, { status: 400 });

  const { source, stream } = await streamExplanation(
    spot,
    input.data.answersSummary,
    input.data.reasonTags ?? input.data.answersSummary.topTags,
    { chatStream, signal: request.signal },
  );
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Explain-Source": source,
    },
  });
}
