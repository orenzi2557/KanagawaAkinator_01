# 旅行提案アプリ「かながわアキネーター（仮）」要件定義書

> このドキュメントは Claude Code に実装を依頼するための要件定義書です。
> リポジトリの `docs/requirements.md` に置き、`CLAUDE.md` から参照してください。

---

## 1. 概要

### 1.1 目的
- 利用者がアキネーターのような質問に答えると、条件に合った神奈川県内の観光地を提案する。
- 提案した観光地から近い別の観光地もあわせて提案する。

### 1.2 提案の流れ
1. 必須質問（全員に聞く）
2. 踏み込んだ質問（回答状況に応じて動的に選ぶ）
3. 提案（1位＋地図＋AI説明文＋近くのスポット）
4. フィードバック

### 1.3 前提・制約
| 項目 | 内容 |
|---|---|
| 開発体制 | ゼミ課題、3人チーム |
| 期限 | 2026年12月末に完成 |
| 発表 | 20分、スライド形式（デモあり） |
| 実行環境 | GPUなしのPC（RAM 16GB）、ローカル実行のみ。外部公開はしない |
| 言語 | JavaScript（TypeScriptは使わない） |
| バージョン管理 | GitHub（Issue / ブランチ / PR） |

---

## 2. 技術スタック

| 層 | 採用技術 | 備考 |
|---|---|---|
| フレームワーク | Next.js（App Router、JavaScript） | フロントとAPIを1つのアプリで扱う |
| スタイル | Tailwind CSS | |
| 地図 | Leaflet + react-leaflet + OpenStreetMapタイル | SSR非対応のため `dynamic(..., { ssr: false })` で読み込む |
| API | Next.js Route Handlers（`app/api/*/route.js`） | `export const runtime = "nodejs"` を指定する |
| ローカルLLM | Ollama（`http://localhost:11434`） | CPU実行 |
| LLMモデル | 3〜4Bクラスの日本語対応モデル（Q4量子化） | **gemma3:4b に決定**。モデル名は環境変数 `OLLAMA_MODEL` で切り替える |
| DB | SQLite（better-sqlite3） | フィードバックと回答ログの保存のみ |
| 観光地データ | JSONファイル（`data/spots.json`） | 18件なのでDB化しない |
| テスト | Vitest | スコアリングロジックの単体テストとシミュレーションテスト |
| Lint/Format | ESLint（create-next-app 標準）、Prettier | |

### 2.1 環境変数（`.env.local`、`.env.example` も用意する）
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
LLM_TIMEOUT_MS=30000
DATABASE_PATH=./data/app.db
```

---

## 3. 機能要件

| ID | 機能 | 内容 |
|---|---|---|
| F-01 | スタート画面 | アプリの説明、「はじめる」ボタン、所要時間の目安（約3〜5分） |
| F-02 | 4択質問 | 「はい / たぶんそう / どちらでもない / いいえ」（必須質問は専用の選択肢） |
| F-03 | 自由記述 | **すべての質問**に自由記述欄を付ける。4択と併用でき、自由記述だけの回答も可 |
| F-04 | 文章解析 | 自由記述をLLMでタグ点数に変換してスコアに加算する。失敗時はキーワード辞書で代替する |
| F-05 | 動的な質問選択 | 残りの候補を最もよく分けられる質問を次に出す |
| F-06 | 終了判定 | 1位が十分に抜けた時点、または上限の問数で質問を終了する |
| F-07 | 戻る | 1つ前の質問に戻れる（スコアは再計算する） |
| F-08 | 結果表示 | 1位のスポット、2位・3位の候補、マッチ度（%）、マッチ理由のタグ |
| F-09 | 地図 | 1位と近くのスポット（最大2件）をピン表示。距離（km）も表示 |
| F-10 | AI説明文 | 事前生成した基本説明＋その場で生成する「あなたに合う理由」（ストリーミング表示） |
| F-11 | フィードバック | 満足度（5段階）、行きたいと思ったか（はい/いいえ）、自由コメント → SQLiteに保存 |
| F-12 | LLM停止時の動作 | Ollamaが起動していなくても、質問から提案までは動く（説明文は基本説明のみ表示） |

---

## 4. 画面要件

状態遷移: `start → questioning（繰り返し） → result → feedback → start`
状態はクライアント側で `useReducer` を使って管理する。ログイン機能は作らない。

### 4.1 スタート画面（`/`）
- タイトル、アプリの説明（2〜3行）、「はじめる」ボタン

### 4.2 質問画面（`/quiz`）
- 進捗バー（現在の問数 / 上限問数）
- 質問文
- 4択ボタン（選ぶとハイライトされる。選んだだけでは次に進まない）
- 自由記述欄（プレースホルダ例:「例: 海鮮が食べたいけど、あまり歩きたくない」）
- 「次へ」ボタン（4択か自由記述のどちらかがあれば押せる）
- 「戻る」ボタン
- 文章解析中は「AIが回答を読み取っています…」を表示（タイムアウトするとフォールバック処理になる）

### 4.3 結果画面（`/result`）
- 1位: 名前、ジャンル、マッチ度、マッチ理由のタグ（例: #海 #グルメ）
- AI説明文: 基本説明は即時表示し、「あなたに合う理由」はストリーミングで表示
- 地図: 1位と近くのスポット（最大2件）
- 近くのスポットのカード: 名前、距離、一言説明
- 2位・3位の候補（クリックすると1位と入れ替えて表示）
- 「フィードバックへ」ボタン

### 4.4 フィードバック画面（`/feedback`）
- 満足度（★1〜5）、「行きたいと思った？」（はい/いいえ）、コメント（任意）
- 送信後、「ありがとうございました」と「もう一度診断する」ボタン

---

## 5. データ仕様

### 5.1 タグ定義（共通）
`history`（歴史・寺社）、`nature`（自然・景色）、`sea`（海）、`food`（グルメ）、`active`（体を動かす・アクティブ）、`relax`（癒やし・のんびり）、`indoor`（屋内・雨でもOK）、`family`（子ども連れ向き）

各スポットのタグ値は 0〜3 の整数（0 = 該当しない、3 = とても当てはまる）。

### 5.2 観光地（`data/spots.json`）— 6ジャンル × 3件 = 18件
| ジャンル（genre） | スポット |
|---|---|
| `history` 歴史・寺社 | 鶴岡八幡宮、鎌倉大仏（高徳院）、長谷寺 |
| `nature` 自然・景色 | 大涌谷、芦ノ湖、宮ヶ瀬湖 |
| `sea` 海・ビーチ | 江の島、由比ヶ浜、城ヶ島 |
| `gourmet` グルメ・街歩き | 横浜中華街、横浜赤レンガ倉庫、小町通り |
| `leisure` レジャー | 横浜・八景島シーパラダイス、相模湖プレジャーフォレスト、カップヌードルミュージアム横浜 |
| `onsen` 温泉・癒やし | 箱根湯本温泉、湯河原温泉、七沢温泉 |

スキーマ:
```json
{
  "id": "enoshima",
  "name": "江の島",
  "genre": "sea",
  "area": "藤沢市",
  "lat": 0.0,
  "lng": 0.0,
  "budget": 2,
  "tags": { "history": 1, "nature": 2, "sea": 3, "food": 2, "active": 2, "relax": 1, "indoor": 0, "family": 2 },
  "facts": ["江島神社がある", "しらす料理が名物"],
  "summary": "一言説明（30字程度）"
}
```
- `budget`: 1 = 無料〜安い、2 = 普通、3 = 高め
- `lat` / `lng`: **地理院地図またはOpenStreetMapで確認した値を入れる**（推測した値を入れない）
- `facts`: LLMに渡す事実情報（3〜5件）。**公式サイトなどで確認したことだけを書く**
- タグ値はチームで合議して決め、根拠を `docs/tagging.md` に残す

### 5.3 質問（`data/questions.json`）
```json
[
  {
    "id": "r_companion",
    "tier": "required",
    "text": "誰と行く予定？",
    "options": [
      { "label": "ひとり",     "effect": { "relax": 1, "history": 1 } },
      { "label": "友達",       "effect": { "active": 1, "food": 1 } },
      { "label": "恋人",       "effect": { "nature": 1, "sea": 1 } },
      { "label": "家族・子ども", "effect": { "family": 2, "indoor": 1 } }
    ]
  },
  {
    "id": "q_sea",
    "tier": "deep",
    "text": "海が見える場所に行きたい？",
    "tag": "sea"
  }
]
```
- `required`（必須質問、3問）: 同行者、予算感、過ごし方（アクティブ／のんびり）。選択肢ごとに `effect` を持つ
- `deep`（踏み込んだ質問、12問以上）: 共通の4択を使い、`tag` を1つ持つ。1つのタグにつき言い回しの違う質問を最低1つ用意する
- 予算質問の回答は、`budget` の差に応じた減点として扱う（5.4節）

### 5.4 共通4択の重み
| 回答 | weight |
|---|---|
| はい | +2 |
| たぶんそう | +1 |
| どちらでもない | 0 |
| いいえ | −2 |

---

## 6. スコアリング仕様（`lib/engine/`）

純粋関数として実装し、React に依存させない（テストできるようにするため）。

### 6.1 スコア計算
```
score(spot) = Σ_deep回答 weight × spot.tags[q.tag]
            + Σ_required回答 Σ_tag effect[tag] × spot.tags[tag]
            + Σ_自由記述 Σ_tag llmScore[tag] × spot.tags[tag] × TEXT_WEIGHT
            − BUDGET_PENALTY × max(0, spot.budget − userBudget)
```
- `TEXT_WEIGHT = 1.0`、`BUDGET_PENALTY = 3`（定数ファイルで管理し、あとから調整できるようにする）
- マッチ度(%)は、全スポットのスコアを min-max 正規化して表示する

### 6.2 次の質問の選び方
1. 必須質問を定義順に出す
2. 以降は、まだ聞いていない `deep` 質問から次のものを選ぶ:
   - 現在のスコア上位 K=6 件について、その質問の `tag` の値の分散を計算する
   - 分散が最大の質問を選ぶ（同点なら定義順）
   - 自由記述ですでに強く表明されたタグ（|累積llmScore| ≥ 2）の質問は優先度を下げる

### 6.3 終了条件
- 踏み込んだ質問を最低4問聞いたうえで、`score(1位) − score(2位) ≥ 4` になったら終了
- または合計10問に達したら終了

### 6.4 近くのスポット
- ハバーサイン公式で、1位からの距離を全スポット分計算する
- 1位を除いて距離が近い順に並べ、上位2件を出す（同じ距離ならスコアが高い方を優先）

---

## 7. LLM仕様（`lib/llm/`）

### 7.1 CPU実行を前提とした方針
- **生成する文章は短くする**。出力トークン数を制限する（`num_predict`）
- **基本説明は事前に生成しておく**: `npm run generate:descriptions` で18件分を生成して `data/descriptions.json` に保存し、人が確認・修正する
- その場で生成するのは「あなたに合う理由」（2〜3文）と自由記述の解析だけにする
- 1回のリクエストのタイムアウトは `LLM_TIMEOUT_MS`。超えたらフォールバックする
- アプリ起動時に `/api/health` でOllamaの状態とモデルの有無を確認し、使えなければ「AI機能オフ」で動かす

### 7.2 自由記述の解析（`POST /api/parse-text`）
- 入力: `{ question: string, text: string }`
- Ollamaの `format` にJSONスキーマを渡して、出力形式を固定する
- 出力: `{ scores: { history: -2〜2, ... }, budget: 1|2|3|null }`（言及がないタグは0にする）
- プロンプトの要点: 「文章から読み取れることだけを評価し、書かれていないことは0にする」
- フォールバック: `lib/llm/keywords.js` のキーワード辞書（例: 「海」「ビーチ」→ sea +2、「歩きたくない」→ active −2、「雨」→ indoor +2）

### 7.3 説明文の生成（`POST /api/explain`）
- 入力: `{ spotId, answersSummary }`（answersSummary は上位タグと自由記述の要約）
- プロンプトには `facts` だけを事実情報として渡し、「facts にないことは書かない、営業時間や料金は書かない」と明示する
- 出力: ストリーミング（`ReadableStream` で返す）
- フォールバック: テンプレート文（例: 「#海 #グルメ が好きなあなたにぴったりです」）

### 7.4 モデルの選び方
- 候補を2〜3個用意し、`scripts/bench-llm.js` で、解析10件・説明3件の「所要時間」と「JSONの成功率」を測る
- 結果は `docs/llm-benchmark.md` に記録し、発表のスライドでも使う

---

## 8. API仕様

| メソッド | パス | 内容 |
|---|---|---|
| GET | `/api/health` | `{ ollama: boolean, model: string \| null }` |
| POST | `/api/parse-text` | 7.2節 |
| POST | `/api/explain` | 7.3節（ストリーミング） |
| POST | `/api/feedback` | `{ spotId, rating, wantToGo, comment, answers }` を保存し、`{ ok: true }` を返す |

入力のバリデーションは zod で行う。不正な入力には400を返す。

### 8.1 DBスキーマ（SQLite）
```sql
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  spot_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  want_to_go INTEGER NOT NULL,
  comment TEXT,
  answers_json TEXT NOT NULL
);
```
起動時にテーブルがなければ作成する。`data/app.db` は `.gitignore` に入れる。

---

## 9. 非機能要件
| 項目 | 目標 |
|---|---|
| 4択のみの回答 | 次の質問を即時表示（100ms以内） |
| 自由記述の解析 | CPU環境で目標15秒以内、最大でもタイムアウト値まで |
| 説明文 | 最初の文字が10秒以内に表示され始める |
| LLM停止時 | 提案まで支障なく動く |
| 表示 | PCのブラウザ（Chrome）を主対象とし、スマホ幅でも崩れない |
| セットアップ | README の手順どおりに進めれば、新しいPCでも30分以内に起動できる |

---

## 10. ディレクトリ構成
```
travel-akinator/
├─ app/
│  ├─ page.js                 スタート画面
│  ├─ quiz/page.js            質問画面
│  ├─ result/page.js          結果画面
│  ├─ feedback/page.js        フィードバック画面
│  └─ api/
│     ├─ health/route.js
│     ├─ parse-text/route.js
│     ├─ explain/route.js
│     └─ feedback/route.js
├─ components/                QuestionCard, AnswerButtons, FreeTextInput, SpotCard, SpotMap, ProgressBar など
├─ lib/
│  ├─ engine/                 score.js, selectQuestion.js, finish.js, nearby.js, constants.js
│  ├─ llm/                    ollama.js, parseText.js, explain.js, keywords.js
│  ├─ db.js
│  └─ state/quizReducer.js
├─ data/                      spots.json, questions.json, descriptions.json
├─ scripts/                   generate-descriptions.js, bench-llm.js, validate-data.js
├─ tests/                     engine.test.js, simulation.test.js, nearby.test.js
├─ docs/                      requirements.md, tagging.md, llm-benchmark.md
├─ CLAUDE.md
└─ README.md
```

---

## 11. テスト要件
- **単体テスト**: スコア計算、次の質問の選択、終了判定、距離計算
- **シミュレーションテスト（重要）**: 18件それぞれを「正解」とする仮想ユーザーを作る。そのスポットのタグ値から理想の回答を自動生成して最後まで回答させ、正解のスポットが **1位** になる割合が 15/18 以上、**3位以内** になる割合が 18/18 であることを確認する。満たさない場合は質問やタグを見直す
- **データ検証**: `scripts/validate-data.js` で、必須項目、タグ値の範囲、座標が神奈川県の範囲内か、ID の重複、を確認する
- LLMに依存する処理はモックしてテストする

---

## 12. 実装フェーズ（Claude Code はこの順に進め、フェーズごとに確認を求める）

| Phase | 内容 | 完了条件 |
|---|---|---|
| 0 | `create-next-app`（JavaScript / App Router / Tailwind / ESLint）、Vitest と Prettier の導入、`.env.example`、README の雛形 | `npm run dev` と `npm test` が通る |
| 1 | `lib/engine` と、仮データ（6件程度）でのテスト | 単体テストが通る |
| 2 | 18件の `spots.json` と `questions.json`、`validate-data.js` | データ検証とシミュレーションテストが基準を満たす（座標と facts は人が確認する） |
| 3 | 4画面のUIと `quizReducer`（LLMなし、自由記述はキーワード辞書のみ） | 最初から最後まで画面遷移できる |
| 4 | 地図と近くのスポット | 結果画面に地図と距離が出る |
| 5 | Ollama連携（health / parse-text / explain、ストリーミング、フォールバック） | Ollamaを止めても提案まで動く |
| 6 | 説明文の事前生成スクリプトと `bench-llm.js` | `descriptions.json` と `llm-benchmark.md` ができる |
| 7 | フィードバック（SQLite）と全体の仕上げ | フィードバックが保存される |

### Claude Code への作業ルール
- TypeScript を導入しない（`.js` / `.jsx` のみ）
- 1つのフェーズを1つのブランチとPRにまとめる（ブランチ名 `feature/phaseN-xxx`）。コミットは小さく分ける
- 観光地の事実情報（座標、facts、営業情報）を推測で書かない。不明な項目は `TODO` にして人に確認を求める
- 定数（重み、しきい値、K、問数の上限）は `lib/engine/constants.js` にまとめる
- 新しい依存パッケージを追加するときは、理由をPRに書く

---

## 13. スケジュールと役割分担（案）

| 期間 | 内容 |
|---|---|
| 10月第4週〜11月第1週 | Phase 0〜1、タグ定義、スポットのデータ収集、LLMモデルの比較 |
| 11月第2週〜第3週 | Phase 2〜3（質問セットの調整にここで時間をかける） |
| 11月第4週〜12月第1週 | Phase 4〜6 |
| 12月第2週 | Phase 7、ゼミ内で試用してもらい、フィードバックを集める |
| 12月第3週 | 結果に基づく調整、デモ動画の撮影 |
| 12月第4週 | 発表準備（スライド、リハーサル） |

| 担当 | 主な範囲 |
|---|---|
| A | 質問エンジン、データ（spots / questions / タグ付け）、テスト |
| B | 画面UI、地図、デザイン |
| C | LLM連携、API、DB、ベンチマーク |

### 発表（20分）に向けて
- CPUでのLLM実行は遅いため、**デモ動画を必ず用意しておく**（ライブデモが失敗したときの保険）
- スライドに使う材料: スコアリングの仕組みの図、シミュレーションテストの結果、LLMのベンチマーク、試用時のフィードバックの集計

---

## 14. 未決事項
- [x] 使用するLLMモデル → gemma3:4b（比較結果は `docs/llm-benchmark.md`）
- [ ] 踏み込んだ質問の最終的な文面と数
- [ ] チームの役割分担の確定
- [ ] アプリ名
