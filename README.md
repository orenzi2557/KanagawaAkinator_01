# かながわアキネーター（仮）

質問に答えると、神奈川県内の観光地を提案するアプリです（ゼミ課題）。
アキネーターのように回答に応じて次の質問を選び、1 位のスポット・地図・近くのスポット・AI の説明文を表示します。

- 要件: [docs/requirements.md](docs/requirements.md)
- タグ付けの根拠: [docs/tagging.md](docs/tagging.md)
- データの出典と確認状況: [docs/data-sources.md](docs/data-sources.md)
- LLM ベンチマーク: [docs/llm-benchmark.md](docs/llm-benchmark.md)

## セットアップ（目安 30 分）

### 1. 必要なもの

| ソフト  | バージョン               | 備考                                                             |
| ------- | ------------------------ | ---------------------------------------------------------------- |
| Node.js | 22 以上（24 で動作確認） | https://nodejs.org/                                              |
| Git     | 任意                     |                                                                  |
| Ollama  | 0.40 以上で動作確認      | https://ollama.com/download 。**なくても動きます**（AI機能オフ） |

GPU は不要です（CPU で動きます）。RAM は 16 GB を想定しています。

### 2. LLM モデルの取得（Ollama を使う場合）

```bash
ollama pull gemma3:4b
```

約 3.4 GB のダウンロードです。Ollama を起動しておくと（Windows/Mac はアプリを起動するだけ）、`http://localhost:11434` で待ち受けます。

### 3. アプリの準備

```bash
git clone <このリポジトリの URL>
cd travel-akinator
npm install
cp .env.example .env.local
```

Windows の PowerShell では `cp` の代わりに `Copy-Item .env.example .env.local` を使います。

> npm 12 以降で「install scripts blocked」と表示されても問題ありません。
> better-sqlite3 は同梱のビルド済みバイナリを使うので、ビルドツールは不要です。

### 4. 起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。画面右上が「AI機能オン」なら Ollama と連携しています。
「AI機能オフ」のときも、質問から提案までは動きます（自由記述はキーワード辞書、説明文はテンプレート文になります）。

## 環境変数（`.env.local`）

| 名前              | 既定値                   | 内容                                                             |
| ----------------- | ------------------------ | ---------------------------------------------------------------- |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama の URL                                                    |
| `OLLAMA_MODEL`    | `gemma3:4b`              | 使うモデル                                                       |
| `LLM_TIMEOUT_MS`  | `30000`                  | LLM 1 回あたりのタイムアウト（超えたらフォールバック）           |
| `DATABASE_PATH`   | `./data/app.db`          | フィードバックを保存する SQLite ファイル（初回起動時に自動作成） |

## コマンド

| コマンド                          | 内容                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `npm run dev`                     | 開発サーバー（http://localhost:3000）                                                            |
| `npm run build` / `npm start`     | 本番ビルド / 本番サーバー                                                                        |
| `npm test`                        | テスト（Vitest）。スコア計算・質問選択・終了判定・距離・シミュレーション・API                    |
| `npm run validate:data`           | `spots.json` / `questions.json` の検証                                                           |
| `npm run simulate`                | シミュレーション結果を表で表示（発表資料用）                                                     |
| `npm run generate:descriptions`   | 基本説明を LLM で生成して `data/descriptions.json` に保存（既存はスキップ、`-- --force` で全件） |
| `npm run bench:llm`               | LLM のベンチマーク → `docs/llm-benchmark.md`（`-- --models a,b` でモデル指定）                   |
| `npm run feedback:summary`        | フィードバックの集計（発表資料用）                                                               |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                |

## しくみ

```
回答 ──▶ lib/engine（スコア計算・次の質問・終了判定・近くのスポット）──▶ 結果画面
  │
  └ 自由記述 ──▶ /api/parse-text ──▶ Ollama（JSON スキーマで出力固定）
                         └ 失敗・タイムアウト ──▶ キーワード辞書（lib/llm/keywords.js）

結果画面 ──▶ /api/explain ──▶ Ollama（facts だけを渡してストリーミング）
                    └ 失敗 ──▶ テンプレート文
```

- スコア: `Σ 4択の重み × タグ値 + Σ 必須質問の effect × タグ値 + Σ 自由記述の点数 × タグ値 − 予算オーバーの減点`
- 次の質問: スコア上位 6 件でタグ値の分散が最も大きい質問（自由記述で強く表明済みのタグ・聞き済みのタグは優先度を下げる）
- 終了: 踏み込んだ質問 4 問以上で 1 位と 2 位の差が 4 以上、または合計 10 問
- 重みやしきい値は `lib/engine/constants.js` にまとめています

## ディレクトリ

```
app/                 画面（/, /quiz, /result, /feedback）と API（app/api/*/route.js）
components/          画面の部品（QuestionCard, AnswerButtons, SpotMap など）
lib/engine/          スコアリングエンジン（React に依存しない純粋関数）
lib/llm/             Ollama 連携、自由記述の解析、説明文、キーワード辞書
lib/state/           quizReducer（useReducer 用）
lib/db.js            SQLite
data/                spots.json, questions.json, descriptions.json
scripts/             データ検証、説明文の生成、ベンチマーク、集計
tests/               Vitest
docs/                要件定義書、タグ付けの根拠、出典、ベンチマーク
```

## データを直すとき

1. `data/spots.json` / `data/questions.json` を編集する
2. `npm run validate:data` と `npm test`（シミュレーション: 1 位 15/18 以上、3 位以内 18/18）を通す
3. タグを変えたら `docs/tagging.md` も更新する
4. facts を変えたら `npm run generate:descriptions -- --only <id>` で説明を作り直し、内容を確認する

## 依存パッケージ（追加した理由）

| パッケージ                           | 理由                                    |
| ------------------------------------ | --------------------------------------- |
| `leaflet`, `react-leaflet`           | 結果画面の地図（OpenStreetMap タイル）  |
| `better-sqlite3`                     | フィードバックと回答ログの保存          |
| `zod`                                | API の入力と LLM の出力の検証           |
| `vitest`                             | テスト                                  |
| `prettier`, `eslint-config-prettier` | コード整形（ESLint と競合しないように） |

## うまく動かないとき

- **画面のデザインが崩れる・古い表示のまま**: 開発サーバーを止めて `.next` フォルダを削除し、`npm run dev` し直す
- **ずっと「AI機能オフ」**: `ollama list` に `gemma3:4b` があるか、`.env.local` の `OLLAMA_MODEL` と一致しているかを確認する
- **AI の応答が遅い**: 初回はモデルの読み込みに 10〜20 秒かかります。2 回目以降は速くなります（30 分間メモリに残します）
- **地図が表示されない**: 地図タイルはインターネットから取得します。オフラインでは地図の背景が出ません（ピンと距離は表示されます）

## 発表に向けて

- CPU での LLM 実行は遅いので、**デモ動画を必ず用意する**
- スライドの材料: `npm run simulate`（シミュレーション結果）、`docs/llm-benchmark.md`、`npm run feedback:summary`
