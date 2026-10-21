// 基本説明（事前生成、要件 7.1）のプロンプト。scripts/generate-descriptions.js から使う。

export function buildDescriptionPrompt(spot) {
  const facts = spot.facts.map((f) => `- ${f}`).join("\n");
  const system = [
    "あなたは神奈川県の観光案内係です。",
    "観光地の事実情報だけを使って、観光地の紹介文を日本語で2〜3文（100〜140字程度）で書きます。",
    "守ること:",
    "- 事実情報に書かれている内容だけを使う。事実情報にない名物・料理・お店・施設・体験は書かない。",
    "- 営業時間・料金・アクセス・混雑状況は書かない。",
    "- 見出し・箇条書き・絵文字は使わず、です・ます調の文章だけを出力する。",
  ].join("\n");
  const user = [
    `観光地: ${spot.name}（${spot.area}）`,
    `事実情報:\n${facts}`,
    "この観光地の紹介文を書いてください。",
  ].join("\n\n");
  return { system, user };
}

/** 生成結果の整形（マークダウン記号や前後の空白を取り除く） */
export function cleanDescription(text) {
  return text
    .replace(/\*\*|__|`|^#+\s*/gm, "")
    .replace(/\s*\n+\s*/g, "")
    .trim();
}
