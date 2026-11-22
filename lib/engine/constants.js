// スコアリングエンジンの定数。調整はこのファイルだけで行う。

/** 共通タグ（定義順は表示順・同点時の順序にも使う） */
export const TAGS = [
  "history",
  "nature",
  "sea",
  "food",
  "active",
  "relax",
  "indoor",
  "family",
  "art",
  "animal",
  "flower",
  "night",
];

export const TAG_LABELS = {
  history: "歴史",
  nature: "自然",
  sea: "海",
  food: "グルメ",
  active: "アクティブ",
  relax: "のんびり",
  indoor: "屋内",
  family: "家族向け",
  art: "アート・展示",
  animal: "生き物",
  flower: "花・庭園",
  night: "夜景",
};

export const GENRE_LABELS = {
  history: "歴史・寺社",
  nature: "自然・景色",
  sea: "海・ビーチ",
  gourmet: "グルメ・街歩き",
  leisure: "レジャー",
  onsen: "温泉・癒やし",
  museum: "博物館・美術館",
  animal: "動物園・水族館",
  flower: "花・庭園",
  city: "夜景・港町",
};

/** ジャンルごとのスポット数（データ検証で使う） */
export const SPOTS_PER_GENRE = 10;

/** おすすめエリアの区分（spot.region の値）。定義順は表示順にも使う */
export const REGION_LABELS = {
  yokohama: "横浜",
  kawasaki: "川崎",
  kamakura: "鎌倉",
  shonan: "湘南",
  miura: "三浦半島",
  hakone: "箱根",
  seisho: "小田原・湯河原",
  kenoh: "県央・相模原・丹沢",
};

/** 踏み込んだ質問（deep）の共通4択と重み（要件 5.4） */
export const ANSWER_OPTIONS = [
  { value: "yes", label: "はい", weight: 2 },
  { value: "probably", label: "たぶんそう", weight: 1 },
  { value: "neutral", label: "どちらでもない", weight: 0 },
  { value: "no", label: "いいえ", weight: -2 },
];

export const ANSWER_WEIGHTS = Object.fromEntries(ANSWER_OPTIONS.map((o) => [o.value, o.weight]));

/** 自由記述の点数にかける重み */
export const TEXT_WEIGHT = 1.0;

/** 予算オーバー 1 段階あたりの減点 */
export const BUDGET_PENALTY = 3;

/** 次の質問を選ぶときに見る上位スポット数 */
export const TOP_K = 10;

/** 自由記述で強く表明されたとみなす累積点数の絶対値 */
export const STRONG_TEXT_THRESHOLD = 2;

/** 強く表明済みのタグの質問は、分散にこの係数をかけて優先度を下げる */
export const STRONG_TEXT_VARIANCE_FACTOR = 0.25;

/** すでに同じタグの deep 質問に答えている場合も、分散にこの係数をかけて優先度を下げる */
export const ASKED_TAG_VARIANCE_FACTOR = 0.5;

/** 終了判定: deep 質問の最低問数 */
export const MIN_DEEP_QUESTIONS = 4;

/** 終了判定: 1位と2位のスコア差がこれ以上なら終了 */
export const LEAD_THRESHOLD = 4;

/** 終了判定: 合計問数の上限（必須質問を含む） */
export const MAX_QUESTIONS = 12;

/** 近くのスポットの表示件数 */
export const NEARBY_COUNT = 2;

/** おすすめエリアで、1位と同じエリアから並べるスポットの数 */
export const AREA_SPOT_COUNT = 3;

/** マッチ理由として表示するタグの最大数 */
export const MAX_REASON_TAGS = 3;
