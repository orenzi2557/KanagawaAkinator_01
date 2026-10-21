"use client";

// 「あなたに合う理由」。AI機能オンなら /api/explain からストリーミングで受け取り、
// オフ・失敗時はテンプレート文を表示する。

import { useEffect, useState } from "react";
import { templateReason } from "@/lib/llm/explain";

export function ReasonText({ spot, reasons, summary, aiEnabled }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState(aiEnabled ? "waiting" : "done");

  useEffect(() => {
    if (!aiEnabled) return;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spotId: spot.id, answersSummary: summary, reasonTags: reasons }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let received = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          received += value;
          setText(received);
          setStatus("streaming");
        }
        if (!received) setText(templateReason(spot, reasons));
        setStatus("done");
      } catch {
        if (controller.signal.aborted) return;
        setText(templateReason(spot, reasons));
        setStatus("done");
      }
    })();

    return () => controller.abort();
    // spot が変わったら親が key で作り直すので、ここでは初回だけ実行する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!aiEnabled) return <p>{templateReason(spot, reasons)}</p>;
  if (status === "waiting") {
    return (
      <p className="flex items-center gap-2 text-sm text-muted" role="status">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        AIが説明文を書いています…
      </p>
    );
  }
  return <p className={status === "streaming" ? "typing-caret" : undefined}>{text}</p>;
}
