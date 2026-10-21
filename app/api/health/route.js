import { checkHealth } from "@/lib/llm/ollama";

export const runtime = "nodejs";

/** Ollama の状態と、設定したモデルがあるか */
export async function GET() {
  return Response.json(await checkHealth());
}
