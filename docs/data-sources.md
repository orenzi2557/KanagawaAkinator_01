# 観光地データの出典と確認状況

> **人による確認が必要です。** 座標と facts は以下の出典から取得しました（2026-10-21 取得）。
> 要件どおり、チームで地理院地図・公式サイトと照合し、確認したら「確認者」欄を埋めてください。

## 座標

OpenStreetMap（Nominatim / Overpass API）の値をそのまま使っています。面や線のデータは代表点（重心）です。

| ID           | スポット                       | 緯度, 経度              | OSM の要素        | 備考                                      | 確認者 |
| ------------ | ------------------------------ | ----------------------- | ----------------- | ----------------------------------------- | ------ |
| tsurugaoka   | 鶴岡八幡宮                     | 35.3251836, 139.5561787 | way/34550401      | 境内の代表点                              |        |
| kotokuin     | 鎌倉大仏（高徳院）             | 35.3164986, 139.5357293 | way/606025831     | 境内の代表点                              |        |
| hasedera     | 長谷寺                         | 35.3122687, 139.5333092 | way/695597656     | 境内の代表点                              |        |
| owakudani    | 大涌谷                         | 35.2474057, 139.0242051 | way/727045804     | natural=valley                            |        |
| ashinoko     | 芦ノ湖                         | 35.2144830, 139.0019966 | relation/10349338 | 湖面の重心                                |        |
| miyagase     | 宮ヶ瀬湖                       | 35.5212818, 139.2356154 | relation/10442300 | 湖面の重心                                |        |
| enoshima     | 江の島                         | 35.3001052, 139.4806371 | way/191655339     | 島の重心                                  |        |
| yuigahama    | 由比ヶ浜                       | 35.3091195, 139.5422113 | way/53749627      | natural=beach                             |        |
| jogashima    | 城ヶ島                         | 35.1333220, 139.6182534 | relation/11979740 | 島の重心                                  |        |
| chinatown    | 横浜中華街                     | 35.4426638, 139.6451907 | way/445258887     | エリアの代表点                            |        |
| akarenga     | 横浜赤レンガ倉庫               | 35.4524046, 139.6429182 | node/10216454044  |                                           |        |
| komachi      | 小町通り                       | 35.3207763, 139.5519605 | way/460141218     | 歩行者道路の代表点                        |        |
| hakkeijima   | 横浜・八景島シーパラダイス     | 35.3365027, 139.6457835 | way/314206942     |                                           |        |
| sagamiko     | さがみ湖MORI MORI              | 35.6054026, 139.2076487 | way/539541663     | tourism=theme_park                        |        |
| cupnoodle    | カップヌードルミュージアム横浜 | 35.4554953, 139.6388891 | way/72970880      | OSM 上の名称は「安藤百福発明記念館 横浜」 |        |
| hakoneyumoto | 箱根湯本温泉                   | 35.2333709, 139.1036639 | node/2440021673   | **箱根湯本駅**の位置で代用                |        |
| yugawara     | 湯河原温泉                     | 35.1457298, 139.0730642 | way/710487406     | **町営「こごめの湯」**の位置で代用        |        |
| nanasawa     | 七沢温泉                       | 35.4479966, 139.2878076 | node/2604183642   | **バス停「七沢温泉」**の位置で代用        |        |

## facts

各スポットの facts は、日本語版 Wikipedia の該当記事（冒頭〜概要部分）に書かれている内容だけから作りました。
営業時間・料金・現在の営業状況は含めていません。**公式サイトでの確認はまだです。**

| ID           | 出典                                                                              | 確認者 |
| ------------ | --------------------------------------------------------------------------------- | ------ |
| tsurugaoka   | https://ja.wikipedia.org/wiki/鶴岡八幡宮                                          |        |
| kotokuin     | https://ja.wikipedia.org/wiki/高徳院                                              |        |
| hasedera     | https://ja.wikipedia.org/wiki/長谷寺_(鎌倉市)                                     |        |
| owakudani    | https://ja.wikipedia.org/wiki/大涌谷                                              |        |
| ashinoko     | https://ja.wikipedia.org/wiki/芦ノ湖                                              |        |
| miyagase     | https://ja.wikipedia.org/wiki/宮ヶ瀬湖                                            |        |
| enoshima     | https://ja.wikipedia.org/wiki/江の島                                              |        |
| yuigahama    | https://ja.wikipedia.org/wiki/由比ヶ浜                                            |        |
| jogashima    | https://ja.wikipedia.org/wiki/城ヶ島                                              |        |
| chinatown    | https://ja.wikipedia.org/wiki/横浜中華街                                          |        |
| akarenga     | https://ja.wikipedia.org/wiki/横浜赤レンガ倉庫                                    |        |
| komachi      | https://ja.wikipedia.org/wiki/小町通り                                            |        |
| hakkeijima   | https://ja.wikipedia.org/wiki/横浜・八景島シーパラダイス                          |        |
| sagamiko     | https://ja.wikipedia.org/wiki/さがみ湖MORI_MORI                                   |        |
| cupnoodle    | https://ja.wikipedia.org/wiki/カップヌードルミュージアム                          |        |
| hakoneyumoto | https://ja.wikipedia.org/wiki/箱根温泉 （「箱根湯本温泉」はこの記事へ転送される） |        |
| yugawara     | https://ja.wikipedia.org/wiki/湯河原温泉                                          |        |
| nanasawa     | https://ja.wikipedia.org/wiki/七沢温泉                                            |        |

## 要件との差分（要確認）

- **相模湖プレジャーフォレスト**は 2024年7月13日に「**さがみ湖MORI MORI**」へ改称しています（Wikipedia より）。
  アプリでは「さがみ湖MORI MORI（旧 相模湖プレジャーフォレスト）」と表示しています。
- **カップヌードルミュージアム横浜**の正式名称は「安藤百福発明記念館 横浜」で、カップヌードルミュージアムは愛称です。

## 基本説明（`data/descriptions.json`）

`npm run generate:descriptions`（gemma3:4b）で生成したあと、Claude Code が facts と照合し、
facts にない記述（例: 長谷寺「アジサイの名所として知られる洞窟」、宮ヶ瀬湖「ダムの仕組みを学べる」、
七沢温泉「地域住民に親しまれている」など）を含む 13 件を手で書き直しました。
**チームでの最終確認はまだです。** facts を直したら、その ID の説明も作り直して確認してください。
