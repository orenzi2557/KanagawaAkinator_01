import { z } from "zod";
import { chatJson } from "@/lib/llm/ollama";
import { parseText } from "@/lib/llm/parseText";

export const runtime = "nodejs";

const bodySchema = z.object({
  question: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(500),
});

/** 自由記述をタグ点数に変換する。LLM が使えなければキーワード辞書で代替する */
export async function POST(request) {
  const body = await request.json().catch(() => null);
  const input = bodySchema.safeParse(body);
  if (!input.success) {
    return Response.json({ error: "入力が不正です", issues: input.error.issues }, { status: 400 });
  }
  const result = await parseText(input.data.question, input.data.text, {
    chatJson,
    signal: request.signal,
  });
  return Response.json(result);
}
