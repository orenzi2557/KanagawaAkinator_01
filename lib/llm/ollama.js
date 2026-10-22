// Ollama クライアント（サーバー専用）。
// 環境変数: OLLAMA_BASE_URL / OLLAMA_MODEL / LLM_TIMEOUT_MS

const HEALTH_TIMEOUT_MS = 3000;
/** CPU 実行では読み込みに時間がかかるので、使い終わってもしばらくメモリに残す */
const KEEP_ALIVE = "30m";

export function ollamaConfig(env = process.env) {
  return {
    baseUrl: (env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, ""),
    model: env.OLLAMA_MODEL || "gemma3:4b",
    timeoutMs: Number(env.LLM_TIMEOUT_MS) || 30000,
  };
}

/**
 * Ollama が起動していて、設定したモデルがあるか。
 * @returns {Promise<{ ollama: boolean, model: string|null }>}
 */
export async function checkHealth(config = ollamaConfig()) {
  try {
    const res = await fetch(`${config.baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (!res.ok) return { ollama: false, model: null };
    const { models = [] } = await res.json();
    const wanted = config.model.includes(":") ? config.model : `${config.model}:latest`;
    const found = models.some((m) => m.name === wanted || m.model === wanted);
    return { ollama: found, model: found ? config.model : null };
  } catch {
    return { ollama: false, model: null };
  }
}

function chatBody(config, { system, user, format, numPredict, stream, temperature }) {
  return JSON.stringify({
    model: config.model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    stream,
    ...(format ? { format } : {}),
    keep_alive: KEEP_ALIVE,
    options: { temperature: temperature ?? (format ? 0 : 0.6), num_predict: numPredict },
  });
}

/**
 * JSON スキーマで出力形式を固定して 1 回問い合わせる。
 * @returns {Promise<unknown>} パース済みの JSON
 */
export async function chatJson(
  { system, user, schema, numPredict = 200, signal },
  config = ollamaConfig(),
) {
  const timeout = AbortSignal.timeout(config.timeoutMs);
  const res = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: chatBody(config, { system, user, format: schema, numPredict, stream: false }),
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.message?.content ?? "");
}

/** モデルをメモリから降ろす（ベンチマークで複数モデルを順に測るときに使う） */
export async function unloadModel(config = ollamaConfig()) {
  await fetch(`${config.baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.model, keep_alive: 0 }),
  }).catch(() => {});
}

/** ストリーミング中、断片と断片の間がこれ以上空いたら打ち切る */
const STREAM_IDLE_TIMEOUT_MS = 15000;

/**
 * 文章をストリーミングで生成する。テキストの断片を順に返す。
 * timeoutMs は「最初の断片が来るまで」の上限で、生成全体の時間ではない
 * （CPU では生成に 10 秒以上かかるので、全体にかけると途中で切れてしまう）。
 * 途中で止まったときは STREAM_IDLE_TIMEOUT_MS で打ち切る。
 * 呼び出し側が途中でやめたとき（return / 例外）は Ollama への接続も切る。
 * @returns {AsyncGenerator<string>}
 */
export async function* chatStream(
  { system, user, numPredict = 220, temperature, signal },
  config = ollamaConfig(),
) {
  const controller = new AbortController();
  const timeoutAfter = (ms, message) =>
    setTimeout(() => controller.abort(new DOMException(message, "TimeoutError")), ms);
  let timer = timeoutAfter(
    config.timeoutMs,
    `最初の応答が ${config.timeoutMs}ms 以内に来ませんでした`,
  );

  try {
    const res = await fetch(`${config.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: chatBody(config, { system, user, numPredict, temperature, stream: true }),
      signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal,
    });
    if (!res.ok || !res.body) throw new Error(`Ollama HTTP ${res.status}`);

    const decoder = new TextDecoder();
    let buffer = "";
    for await (const chunk of res.body) {
      buffer += decoder.decode(chunk, { stream: true });
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const data = JSON.parse(line);
        if (data.error) throw new Error(data.error);
        if (data.message?.content) {
          clearTimeout(timer);
          timer = timeoutAfter(STREAM_IDLE_TIMEOUT_MS, "応答が途中で止まりました");
          yield data.message.content;
        }
        if (data.done) return;
      }
    }
  } finally {
    clearTimeout(timer);
    // 途中でやめた場合に Ollama の生成を止める（完了後に呼んでも害はない）
    controller.abort();
  }
}
