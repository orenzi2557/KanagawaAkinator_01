// spots.json / questions.json の検証（要件 11）。scripts/validate-data.js とテストから使う。

import { GENRE_LABELS, TAGS } from "./engine/constants.js";

/** 神奈川県を囲む矩形（おおよそ。城ヶ島の安房埼が最南端 35.1256） */
export const KANAGAWA_BOUNDS = { minLat: 35.1, maxLat: 35.7, minLng: 138.9, maxLng: 139.8 };

const SPOT_FIELDS = [
  "id",
  "name",
  "genre",
  "area",
  "lat",
  "lng",
  "budget",
  "tags",
  "facts",
  "summary",
];
const SPOTS_PER_GENRE = 3;
const REQUIRED_QUESTION_COUNT = 3;
const MIN_DEEP_QUESTIONS = 12;
const MIN_DEEP_PER_TAG = 2;

const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

function findDuplicates(ids) {
  const seen = new Set();
  return [...new Set(ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false))))];
}

/** @returns {{ errors: string[], warnings: string[] }} */
export function validateSpots(spots) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(spots)) return { errors: ["spots.json が配列ではありません"], warnings };

  for (const id of findDuplicates(spots.map((s) => s.id))) errors.push(`ID が重複: ${id}`);

  spots.forEach((s, i) => {
    const where = `spots[${i}] (${s.id ?? "?"})`;
    for (const f of SPOT_FIELDS) {
      if (s[f] === undefined || s[f] === null || s[f] === "")
        errors.push(`${where}: ${f} がありません`);
    }
    if (s.genre && !(s.genre in GENRE_LABELS)) errors.push(`${where}: 不明な genre "${s.genre}"`);
    if (s.budget !== undefined && !isInt(s.budget, 1, 3))
      errors.push(`${where}: budget は 1〜3 の整数`);

    if (typeof s.lat !== "number" || typeof s.lng !== "number") {
      errors.push(`${where}: lat/lng は数値`);
    } else {
      const b = KANAGAWA_BOUNDS;
      if (s.lat < b.minLat || s.lat > b.maxLat || s.lng < b.minLng || s.lng > b.maxLng) {
        errors.push(`${where}: 座標 (${s.lat}, ${s.lng}) が神奈川県の範囲外`);
      }
    }

    if (s.tags && typeof s.tags === "object") {
      for (const t of TAGS) {
        if (!isInt(s.tags[t], 0, 3)) errors.push(`${where}: tags.${t} は 0〜3 の整数`);
      }
      for (const t of Object.keys(s.tags)) {
        if (!TAGS.includes(t)) errors.push(`${where}: 不明なタグ "${t}"`);
      }
    }

    if (Array.isArray(s.facts)) {
      if (s.facts.length < 3 || s.facts.length > 5) errors.push(`${where}: facts は 3〜5 件`);
      if (s.facts.some((f) => typeof f !== "string" || f.trim() === "")) {
        errors.push(`${where}: facts に空の項目があります`);
      }
    } else if (s.facts !== undefined) {
      errors.push(`${where}: facts は配列`);
    }

    const text = JSON.stringify(s);
    if (/TODO/i.test(text)) warnings.push(`${where}: TODO が残っています`);
    if (typeof s.summary === "string" && s.summary.length > 40) {
      warnings.push(`${where}: summary が長め（${s.summary.length}字）`);
    }
  });

  for (const genre of Object.keys(GENRE_LABELS)) {
    const n = spots.filter((s) => s.genre === genre).length;
    if (n !== SPOTS_PER_GENRE)
      errors.push(`genre "${genre}" が ${n} 件（${SPOTS_PER_GENRE} 件必要）`);
  }
  return { errors, warnings };
}

/** @returns {{ errors: string[], warnings: string[] }} */
export function validateQuestions(questions) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(questions))
    return { errors: ["questions.json が配列ではありません"], warnings };

  for (const id of findDuplicates(questions.map((q) => q.id))) errors.push(`ID が重複: ${id}`);

  questions.forEach((q, i) => {
    const where = `questions[${i}] (${q.id ?? "?"})`;
    if (!q.id || !q.text) errors.push(`${where}: id と text が必要`);
    if (q.tier === "deep") {
      if (!TAGS.includes(q.tag)) errors.push(`${where}: 不明な tag "${q.tag}"`);
    } else if (q.tier === "required") {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`${where}: options が 2 件以上必要`);
        return;
      }
      q.options.forEach((o, j) => {
        if (!o.label) errors.push(`${where}.options[${j}]: label がありません`);
        for (const [t, v] of Object.entries(o.effect ?? {})) {
          if (!TAGS.includes(t)) errors.push(`${where}.options[${j}]: 不明なタグ "${t}"`);
          if (typeof v !== "number") errors.push(`${where}.options[${j}]: effect.${t} は数値`);
        }
        if (o.budget !== undefined && !isInt(o.budget, 1, 3)) {
          errors.push(`${where}.options[${j}]: budget は 1〜3 の整数`);
        }
      });
    } else {
      errors.push(`${where}: tier は required か deep`);
    }
  });

  const required = questions.filter((q) => q.tier === "required");
  const deep = questions.filter((q) => q.tier === "deep");
  if (required.length !== REQUIRED_QUESTION_COUNT) {
    errors.push(`必須質問が ${required.length} 問（${REQUIRED_QUESTION_COUNT} 問必要）`);
  }
  if (deep.length < MIN_DEEP_QUESTIONS) {
    errors.push(`踏み込んだ質問が ${deep.length} 問（${MIN_DEEP_QUESTIONS} 問以上必要）`);
  }
  for (const t of TAGS) {
    const n = deep.filter((q) => q.tag === t).length;
    if (n < MIN_DEEP_PER_TAG)
      errors.push(`タグ "${t}" の質問が ${n} 問（${MIN_DEEP_PER_TAG} 問以上必要）`);
  }
  if (!required.some((q) => q.options?.some((o) => o.budget !== undefined))) {
    errors.push("予算の必須質問（options に budget を持つもの）がありません");
  }
  return { errors, warnings };
}

/** descriptions.json（任意）: スポット ID → 説明文 */
export function validateDescriptions(descriptions, spots) {
  const errors = [];
  const warnings = [];
  for (const s of spots) {
    if (!descriptions[s.id]) warnings.push(`descriptions.json に ${s.id} の説明がありません`);
  }
  for (const id of Object.keys(descriptions)) {
    if (!spots.some((s) => s.id === id)) errors.push(`descriptions.json に不明な ID: ${id}`);
  }
  return { errors, warnings };
}
