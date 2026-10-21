// Phase 1 用の仮データ（6件）。座標・内容は架空でテスト専用。
const t = (history, nature, sea, food, active, relax, indoor, family) => ({
  history,
  nature,
  sea,
  food,
  active,
  relax,
  indoor,
  family,
});

export const sampleSpots = [
  {
    id: "temple",
    name: "テスト寺",
    genre: "history",
    lat: 35.3,
    lng: 139.55,
    budget: 1,
    tags: t(3, 1, 0, 1, 1, 2, 0, 1),
  },
  {
    id: "lake",
    name: "テスト湖",
    genre: "nature",
    lat: 35.2,
    lng: 139.0,
    budget: 2,
    tags: t(0, 3, 0, 1, 2, 2, 0, 2),
  },
  {
    id: "beach",
    name: "テスト浜",
    genre: "sea",
    lat: 35.3,
    lng: 139.5,
    budget: 1,
    tags: t(0, 2, 3, 1, 2, 1, 0, 2),
  },
  {
    id: "town",
    name: "テスト街",
    genre: "gourmet",
    lat: 35.44,
    lng: 139.65,
    budget: 2,
    tags: t(1, 0, 0, 3, 1, 1, 2, 2),
  },
  {
    id: "park",
    name: "テスト遊園地",
    genre: "leisure",
    lat: 35.6,
    lng: 139.2,
    budget: 3,
    tags: t(0, 1, 0, 1, 3, 0, 1, 3),
  },
  {
    id: "onsen",
    name: "テスト温泉",
    genre: "onsen",
    lat: 35.23,
    lng: 139.1,
    budget: 3,
    tags: t(1, 2, 0, 2, 0, 3, 2, 1),
  },
];

export const sampleQuestions = [
  {
    id: "r_companion",
    tier: "required",
    text: "誰と行く予定？",
    options: [
      { label: "ひとり", effect: { relax: 1, history: 1 } },
      { label: "友達", effect: { active: 1, food: 1 } },
      { label: "恋人", effect: { nature: 1, sea: 1 } },
      { label: "家族・子ども", effect: { family: 2, indoor: 1 } },
    ],
  },
  {
    id: "r_budget",
    tier: "required",
    text: "予算は？",
    options: [
      { label: "安く", budget: 1, effect: {} },
      { label: "普通", budget: 2, effect: {} },
      { label: "高くてもいい", budget: 3, effect: {} },
    ],
  },
  { id: "q_history", tier: "deep", text: "歴史？", tag: "history" },
  { id: "q_nature", tier: "deep", text: "自然？", tag: "nature" },
  { id: "q_sea", tier: "deep", text: "海？", tag: "sea" },
  { id: "q_food", tier: "deep", text: "グルメ？", tag: "food" },
  { id: "q_active", tier: "deep", text: "アクティブ？", tag: "active" },
  { id: "q_relax", tier: "deep", text: "のんびり？", tag: "relax" },
  { id: "q_indoor", tier: "deep", text: "屋内？", tag: "indoor" },
  { id: "q_family", tier: "deep", text: "家族？", tag: "family" },
  { id: "q_sea2", tier: "deep", text: "海2？", tag: "sea" },
];

export const answer = (questionId, choice, extra = {}) => ({
  questionId,
  choice,
  text: "",
  textScores: null,
  textBudget: null,
  ...extra,
});
