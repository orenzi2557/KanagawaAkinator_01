/** ログ用に例外を 1 行で表す（name しか持たない例外もあるため） */
export function describeError(error) {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause instanceof Error ? ` (cause: ${error.cause.message})` : "";
  return `${error.name}: ${error.message || "（メッセージなし）"}${cause}`;
}
