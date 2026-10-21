"use client";

import { templateReason } from "@/lib/llm/explain";

/** 「あなたに合う理由」。AI機能オフのときはテンプレート文 */
export function ReasonText({ spot, reasons }) {
  return <p>{templateReason(spot, reasons)}</p>;
}
