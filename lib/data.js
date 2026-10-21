// アプリで使うデータ（JSON）をまとめて読み込む。
import spots from "@/data/spots.json";
import questions from "@/data/questions.json";
import descriptions from "@/data/descriptions.json";

export { spots, questions, descriptions };

export const spotById = new Map(spots.map((s) => [s.id, s]));
