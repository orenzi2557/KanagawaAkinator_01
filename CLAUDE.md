# CLAUDE.md

@AGENTS.md

要件は [docs/requirements.md](docs/requirements.md) を参照すること。

## 作業ルール
- TypeScript を導入しない（`.js` / `.jsx` のみ）
- 1フェーズ = 1ブランチ（`feature/phaseN-xxx`）。コミットは小さく分ける
- 観光地の事実情報（座標、facts、営業情報）を推測で書かない。不明な項目は `TODO` にして人に確認を求める
- 定数（重み、しきい値、K、問数の上限）は `lib/engine/constants.js` にまとめる
- `lib/engine/` は React に依存しない純粋関数にする
- 新しい依存パッケージを追加するときは、理由を PR（または README の「依存パッケージ」）に書く

## よく使うコマンド
- `npm run dev` 開発サーバー
- `npm test` テスト（Vitest）
- `npm run validate:data` データ検証
- `npm run lint` / `npm run format`
