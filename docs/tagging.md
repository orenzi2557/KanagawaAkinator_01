# タグ付けの根拠（ドラフト）

> **状態: 叩き台。** Claude Code が作成した初期値です。チームで合議して確定し、変更したら
> この表と `data/spots.json` を両方更新し、`npm test`（シミュレーションテスト）が通ることを確認してください。

## 基準

| 値  | 意味                                   |
| --- | -------------------------------------- |
| 3   | そのスポットの主目的・代表的な楽しみ方 |
| 2   | はっきり楽しめる要素がある             |
| 1   | 少しはある／周辺で楽しめる             |
| 0   | ほぼ該当しない                         |

| タグ    | 判断の目安                                               |
| ------- | -------------------------------------------------------- |
| history | 寺社・史跡・歴史的建造物、長い歴史をもつ温泉地           |
| nature  | 山・湖・森・海岸の地形など、自然の景色そのものが見どころ |
| sea     | 海が見える・海辺で遊べる                                 |
| food    | 食事や食べ歩きが目的になる                               |
| active  | よく歩く・アトラクション・アスレチック                   |
| relax   | 座って過ごせる・癒やし・のんびり                         |
| indoor  | 雨でも楽しめる屋内施設がある                             |
| family  | 子ども連れで楽しみやすい                                 |
| art     | 美術・博物館・展示を見ることが目的になる                 |
| animal  | 動物園・水族館など、生き物に会える                       |
| flower  | 花・庭園が見どころ（季節の花を含む）                     |
| night   | 夜景や、日が暮れてからも楽しめる要素がある               |

`budget`: 1 = 無料〜安い（参拝・散策中心）、2 = 普通（乗り物・飲食代がかかる）、3 = 高め（入場料・宿泊が中心）。

## 一覧

| ID                 | スポット                                           | ジャンル | エリア   | budget | history | nature | sea | food | active | relax | indoor | family | art | animal | flower | night |
| ------------------ | -------------------------------------------------- | -------- | -------- | ------ | ------- | ------ | --- | ---- | ------ | ----- | ------ | ------ | --- | ------ | ------ | ----- |
| tsurugaoka         | 鶴岡八幡宮                                         | history  | kamakura | 1      | 3       | 1      | 0   | 1    | 2      | 1     | 0      | 1      | 0   | 0      | 1      | 0     |
| kotokuin           | 鎌倉大仏（高徳院）                                 | history  | kamakura | 1      | 3       | 1      | 0   | 0    | 0      | 2     | 0      | 2      | 0   | 0      | 0      | 0     |
| hasedera           | 長谷寺                                             | history  | kamakura | 1      | 3       | 2      | 2   | 0    | 1      | 2     | 1      | 1      | 0   | 0      | 2      | 0     |
| owakudani          | 大涌谷                                             | nature   | hakone   | 2      | 0       | 3      | 0   | 1    | 3      | 0     | 0      | 1      | 0   | 0      | 0      | 0     |
| ashinoko           | 芦ノ湖                                             | nature   | hakone   | 2      | 1       | 3      | 0   | 1    | 1      | 3     | 0      | 2      | 0   | 0      | 0      | 0     |
| miyagase           | 宮ヶ瀬湖                                           | nature   | kenoh    | 1      | 0       | 3      | 0   | 0    | 2      | 2     | 1      | 3      | 0   | 0      | 0      | 1     |
| enoshima           | 江の島                                             | sea      | shonan   | 2      | 2       | 2      | 3   | 2    | 2      | 1     | 0      | 2      | 0   | 0      | 1      | 1     |
| yuigahama          | 由比ヶ浜                                           | sea      | kamakura | 1      | 0       | 1      | 3   | 0    | 2      | 2     | 0      | 3      | 0   | 0      | 0      | 0     |
| jogashima          | 城ヶ島                                             | sea      | miura    | 1      | 0       | 3      | 3   | 1    | 2      | 1     | 0      | 1      | 0   | 0      | 0      | 0     |
| chinatown          | 横浜中華街                                         | gourmet  | yokohama | 2      | 1       | 0      | 0   | 3    | 1      | 0     | 2      | 2      | 0   | 0      | 0      | 1     |
| akarenga           | 横浜赤レンガ倉庫                                   | gourmet  | yokohama | 2      | 2       | 0      | 1   | 2    | 0      | 1     | 3      | 1      | 1   | 0      | 0      | 2     |
| komachi            | 小町通り                                           | gourmet  | kamakura | 1      | 2       | 0      | 0   | 3    | 1      | 0     | 1      | 1      | 0   | 0      | 0      | 0     |
| hakkeijima         | 横浜・八景島シーパラダイス                         | leisure  | yokohama | 3      | 0       | 0      | 2   | 1    | 2      | 0     | 3      | 3      | 0   | 3      | 0      | 1     |
| sagamiko           | さがみ湖MORI MORI（旧 相模湖プレジャーフォレスト） | leisure  | kenoh    | 3      | 0       | 2      | 0   | 0    | 3      | 0     | 0      | 3      | 0   | 0      | 0      | 2     |
| cupnoodle          | カップヌードルミュージアム横浜                     | leisure  | yokohama | 2      | 1       | 0      | 0   | 2    | 1      | 0     | 3      | 3      | 2   | 0      | 0      | 0     |
| hakoneyumoto       | 箱根湯本温泉                                       | onsen    | hakone   | 3      | 3       | 1      | 0   | 2    | 1      | 3     | 2      | 2      | 0   | 0      | 0      | 0     |
| yugawara           | 湯河原温泉                                         | onsen    | seisho   | 3      | 2       | 3      | 1   | 1    | 0      | 3     | 2      | 1      | 0   | 0      | 0      | 0     |
| nanasawa           | 七沢温泉                                           | onsen    | kenoh    | 2      | 1       | 3      | 0   | 0    | 1      | 3     | 2      | 1      | 0   | 0      | 0      | 0     |
| odawarajo          | 小田原城                                           | history  | seisho   | 2      | 3       | 1      | 0   | 0    | 2      | 1     | 1      | 2      | 1   | 0      | 1      | 0     |
| kenchoji           | 建長寺                                             | history  | kamakura | 1      | 3       | 1      | 0   | 0    | 1      | 2     | 0      | 1      | 0   | 0      | 0      | 0     |
| engakuji           | 円覚寺                                             | history  | kamakura | 1      | 3       | 2      | 0   | 0    | 1      | 2     | 0      | 0      | 0   | 0      | 0      | 0     |
| hakonejinja        | 箱根神社                                           | history  | hakone   | 1      | 3       | 2      | 0   | 0    | 1      | 1     | 0      | 1      | 0   | 0      | 0      | 0     |
| oyamaafuri         | 大山阿夫利神社                                     | history  | kenoh    | 2      | 3       | 3      | 0   | 0    | 3      | 0     | 0      | 1      | 0   | 0      | 0      | 0     |
| samukawa           | 寒川神社                                           | history  | shonan   | 1      | 3       | 0      | 0   | 0    | 1      | 1     | 0      | 1      | 0   | 0      | 0      | 0     |
| kawasakidaishi     | 川崎大師（平間寺）                                 | history  | kawasaki | 1      | 3       | 0      | 0   | 1    | 1      | 0     | 0      | 1      | 0   | 0      | 0      | 0     |
| tonodake           | 塔ノ岳                                             | nature   | kenoh    | 1      | 1       | 3      | 0   | 0    | 3      | 0     | 0      | 0      | 0   | 0      | 0      | 0     |
| kintokiyama        | 金時山                                             | nature   | hakone   | 1      | 0       | 3      | 0   | 0    | 3      | 0     | 0      | 1      | 0   | 0      | 0      | 0     |
| tanzawako          | 丹沢湖                                             | nature   | seisho   | 1      | 1       | 3      | 0   | 0    | 2      | 2     | 0      | 1      | 0   | 0      | 0      | 0     |
| shasui             | 洒水の滝                                           | nature   | seisho   | 1      | 1       | 3      | 0   | 0    | 1      | 1     | 0      | 0      | 0   | 0      | 0      | 0     |
| ogusuyama          | 大楠山                                             | nature   | miura    | 1      | 0       | 3      | 2   | 0    | 2      | 1     | 0      | 1      | 0   | 0      | 0      | 0     |
| ikuta              | 生田緑地                                           | nature   | kawasaki | 1      | 1       | 3      | 0   | 0    | 2      | 2     | 0      | 2      | 0   | 0      | 0      | 0     |
| sagamilake         | 相模湖                                             | nature   | kenoh    | 1      | 1       | 3      | 0   | 0    | 1      | 2     | 0      | 1      | 0   | 0      | 0      | 0     |
| shichirigahama     | 七里ヶ浜                                           | sea      | kamakura | 1      | 0       | 2      | 3   | 0    | 1      | 2     | 0      | 1      | 0   | 0      | 0      | 1     |
| sarushima          | 猿島                                               | sea      | miura    | 2      | 2       | 3      | 3   | 0    | 2      | 1     | 0      | 1      | 0   | 0      | 0      | 0     |
| kannonzaki         | 観音崎公園                                         | sea      | miura    | 1      | 2       | 3      | 3   | 0    | 2      | 1     | 0      | 2      | 0   | 0      | 0      | 0     |
| manazuru           | 真鶴半島                                           | sea      | seisho   | 1      | 0       | 3      | 3   | 0    | 2      | 1     | 0      | 1      | 0   | 0      | 0      | 0     |
| southernbeach      | サザンビーチちがさき                               | sea      | shonan   | 1      | 0       | 1      | 3   | 1    | 2      | 1     | 0      | 3      | 0   | 0      | 0      | 0     |
| miurakaigan        | 三浦海岸                                           | sea      | miura    | 1      | 0       | 1      | 3   | 0    | 2      | 1     | 0      | 3      | 0   | 0      | 0      | 0     |
| inamuragasaki      | 稲村ヶ崎                                           | sea      | kamakura | 1      | 3       | 2      | 3   | 0    | 1      | 2     | 0      | 1      | 0   | 0      | 0      | 1     |
| ramenmuseum        | 新横浜ラーメン博物館                               | gourmet  | yokohama | 2      | 1       | 0      | 0   | 3    | 0      | 0     | 3      | 2      | 1   | 0      | 0      | 1     |
| misakiport         | 三崎漁港                                           | gourmet  | miura    | 2      | 1       | 1      | 3   | 3    | 1      | 0     | 0      | 1      | 0   | 0      | 0      | 0     |
| odawaraport        | 小田原漁港                                         | gourmet  | seisho   | 2      | 0       | 0      | 2   | 3    | 1      | 0     | 1      | 1      | 0   | 0      | 0      | 0     |
| dobuita            | どぶ板通り                                         | gourmet  | miura    | 1      | 2       | 0      | 0   | 2    | 1      | 0     | 1      | 1      | 0   | 0      | 0      | 1     |
| motomachi          | 横浜元町                                           | gourmet  | yokohama | 2      | 2       | 0      | 0   | 2    | 1      | 0     | 1      | 1      | 0   | 0      | 0      | 0     |
| suzuhiro           | 鈴廣かまぼこの里                                   | gourmet  | seisho   | 2      | 2       | 0      | 0   | 3    | 0      | 0     | 2      | 2      | 1   | 0      | 0      | 0     |
| koshigoe           | 腰越漁港                                           | gourmet  | kamakura | 1      | 0       | 1      | 3   | 3    | 1      | 1     | 0      | 1      | 0   | 0      | 0      | 0     |
| cosmoworld         | よこはまコスモワールド                             | leisure  | yokohama | 2      | 0       | 0      | 1   | 1    | 3      | 0     | 0      | 3      | 0   | 0      | 0      | 3     |
| kodomonokuni       | こどもの国                                         | leisure  | yokohama | 2      | 0       | 2      | 0   | 0    | 3      | 1     | 0      | 3      | 0   | 2      | 0      | 0     |
| soleil             | 長井海の手公園 ソレイユの丘                        | leisure  | miura    | 2      | 0       | 2      | 1   | 1    | 3      | 1     | 0      | 3      | 0   | 1      | 1      | 0     |
| kowakien           | 箱根小涌園                                         | leisure  | hakone   | 3      | 1       | 1      | 0   | 1    | 2      | 3     | 2      | 3      | 0   | 0      | 0      | 0     |
| oisolongbeach      | 大磯ロングビーチ                                   | leisure  | shonan   | 3      | 0       | 0      | 2   | 0    | 3      | 1     | 0      | 3      | 0   | 0      | 0      | 0     |
| anpanman           | 横浜アンパンマンこどもミュージアム                 | leisure  | yokohama | 3      | 0       | 0      | 0   | 1    | 2      | 0     | 3      | 3      | 1   | 0      | 0      | 0     |
| tsujido            | 辻堂海浜公園                                       | leisure  | shonan   | 2      | 0       | 1      | 1   | 0    | 3      | 1     | 1      | 3      | 1   | 0      | 0      | 0     |
| ubako              | 姥子温泉                                           | onsen    | hakone   | 2      | 2       | 2      | 0   | 0    | 0      | 3     | 1      | 0      | 0   | 0      | 0      | 0     |
| sokokura           | 底倉温泉                                           | onsen    | hakone   | 3      | 3       | 2      | 0   | 0    | 0      | 3     | 1      | 0      | 0   | 0      | 0      | 0     |
| ashinoyu           | 芦之湯温泉                                         | onsen    | hakone   | 3      | 3       | 2      | 0   | 0    | 0      | 3     | 1      | 0      | 0   | 0      | 0      | 0     |
| tsurumaki          | 鶴巻温泉                                           | onsen    | kenoh    | 2      | 1       | 1      | 0   | 0    | 0      | 3     | 1      | 1      | 0   | 0      | 0      | 0     |
| iiyama             | 飯山温泉                                           | onsen    | kenoh    | 2      | 0       | 2      | 0   | 0    | 0      | 3     | 1      | 0      | 0   | 0      | 0      | 0     |
| nakagawaonsen      | 中川温泉                                           | onsen    | seisho   | 2      | 1       | 3      | 0   | 0    | 0      | 3     | 1      | 0      | 0   | 0      | 0      | 0     |
| kosoji             | 広沢寺温泉                                         | onsen    | kenoh    | 3      | 1       | 2      | 0   | 0    | 0      | 3     | 1      | 0      | 0   | 0      | 0      | 0     |
| chokokunomori      | 箱根 彫刻の森美術館                                | museum   | hakone   | 3      | 0       | 2      | 0   | 0    | 1      | 1     | 1      | 2      | 3   | 0      | 0      | 0     |
| pola               | ポーラ美術館                                       | museum   | hakone   | 3      | 0       | 2      | 0   | 0    | 0      | 2     | 3      | 1      | 3   | 0      | 0      | 0     |
| fujiko             | 川崎市 藤子・F・不二雄ミュージアム                 | museum   | kawasaki | 2      | 0       | 0      | 0   | 0    | 0      | 1     | 3      | 3      | 3   | 0      | 0      | 0     |
| seimeinohoshi      | 神奈川県立生命の星・地球博物館                     | museum   | seisho   | 2      | 1       | 1      | 0   | 0    | 0      | 0     | 3      | 3      | 2   | 1      | 0      | 0     |
| haratetsudo        | 原鉄道模型博物館                                   | museum   | yokohama | 2      | 1       | 0      | 0   | 0    | 0      | 1     | 3      | 3      | 3   | 0      | 0      | 0     |
| yokohamabijutsukan | 横浜美術館                                         | museum   | yokohama | 2      | 0       | 0      | 0   | 0    | 0      | 1     | 3      | 1      | 3   | 0      | 0      | 0     |
| minkaen            | 川崎市立日本民家園                                 | museum   | kawasaki | 2      | 3       | 2      | 0   | 0    | 1      | 1     | 1      | 2      | 2   | 0      | 0      | 0     |
| yokosukabijutsukan | 横須賀美術館                                       | museum   | miura    | 2      | 0       | 1      | 2   | 0    | 0      | 2     | 3      | 1      | 3   | 0      | 0      | 0     |
| mikasa             | 記念艦「三笠」                                     | museum   | miura    | 2      | 3       | 0      | 2   | 0    | 1      | 0     | 2      | 1      | 2   | 0      | 0      | 0     |
| sagamiharamuseum   | 相模原市立博物館                                   | museum   | kenoh    | 1      | 2       | 1      | 0   | 0    | 0      | 1     | 3      | 3      | 2   | 0      | 0      | 0     |
| enosui             | 新江ノ島水族館                                     | animal   | shonan   | 3      | 0       | 0      | 3   | 0    | 0      | 1     | 3      | 3      | 1   | 3      | 0      | 0     |
| zoorasia           | よこはま動物園ズーラシア                           | animal   | yokohama | 2      | 0       | 2      | 0   | 0    | 2      | 0     | 0      | 3      | 0   | 3      | 0      | 0     |
| nogeyama           | 野毛山動物園                                       | animal   | yokohama | 1      | 0       | 1      | 0   | 0    | 1      | 0     | 1      | 3      | 0   | 3      | 0      | 0     |
| kanazawazoo        | 金沢動物園（金沢自然公園）                         | animal   | yokohama | 2      | 0       | 2      | 1   | 0    | 2      | 0     | 0      | 3      | 0   | 3      | 1      | 0     |
| yumemigasaki       | 夢見ヶ崎動物公園                                   | animal   | kawasaki | 1      | 1       | 1      | 0   | 0    | 0      | 1     | 0      | 3      | 0   | 3      | 0      | 0     |
| hakoneen           | 箱根園（箱根園水族館）                             | animal   | hakone   | 2      | 0       | 2      | 1   | 0    | 1      | 1     | 2      | 2      | 0   | 2      | 0      | 0     |
| fureaikagakukan    | 相模川ふれあい科学館 アクアリウムさがみはら        | animal   | kenoh    | 1      | 0       | 1      | 0   | 0    | 0      | 1     | 3      | 3      | 1   | 3      | 0      | 0     |
| kawasui            | カワスイ 川崎水族館                                | animal   | kawasaki | 3      | 0       | 0      | 0   | 0    | 0      | 1     | 3      | 2      | 1   | 3      | 0      | 1     |
| kannonzakimuseum   | 観音崎自然博物館                                   | animal   | miura    | 2      | 0       | 2      | 2   | 0    | 0      | 1     | 2      | 3      | 1   | 2      | 0      | 0     |
| asamizo            | 相模原麻溝公園                                     | animal   | kenoh    | 1      | 0       | 2      | 0   | 0    | 3      | 1     | 0      | 3      | 0   | 2      | 2      | 0     |
| sankeien           | 三溪園                                             | flower   | yokohama | 2      | 3       | 2      | 0   | 0    | 1      | 2     | 0      | 1      | 1   | 0      | 3      | 0     |
| kurihama           | くりはま花の国                                     | flower   | miura    | 1      | 0       | 2      | 1   | 0    | 2      | 1     | 0      | 3      | 0   | 0      | 3      | 0     |
| azumayama          | 吾妻山公園                                         | flower   | shonan   | 1      | 1       | 2      | 2   | 0    | 2      | 1     | 0      | 2      | 0   | 0      | 3      | 0     |
| ofunaflower        | 神奈川県立大船フラワーセンター                     | flower   | kamakura | 2      | 0       | 2      | 0   | 0    | 1      | 2     | 1      | 2      | 0   | 0      | 3      | 0     |
| odawaraflower      | 小田原フラワーガーデン                             | flower   | seisho   | 1      | 0       | 2      | 0   | 0    | 1      | 2     | 2      | 2      | 0   | 0      | 3      | 0     |
| sogabairin         | 曽我梅林                                           | flower   | seisho   | 1      | 1       | 2      | 0   | 1    | 1      | 2     | 0      | 1      | 0   | 0      | 3      | 0     |
| shisseikaen        | 箱根湿生花園                                       | flower   | hakone   | 2      | 0       | 3      | 0   | 0    | 1      | 2     | 1      | 1      | 1   | 0      | 3      | 0     |
| meigetsuin         | 明月院                                             | flower   | kamakura | 1      | 3       | 2      | 0   | 0    | 1      | 2     | 0      | 0      | 0   | 0      | 3      | 0     |
| kanagarden         | 花菜ガーデン                                       | flower   | shonan   | 2      | 0       | 2      | 0   | 1    | 1      | 2     | 0      | 2      | 0   | 0      | 3      | 0     |
| ikutarose          | 生田緑地ばら苑                                     | flower   | kawasaki | 2      | 1       | 2      | 0   | 0    | 1      | 2     | 0      | 1      | 0   | 0      | 3      | 0     |
| landmark           | 横浜ランドマークタワー                             | city     | yokohama | 2      | 0       | 0      | 1   | 2    | 0      | 1     | 2      | 1      | 0   | 0      | 0      | 3     |
| yamashitapark      | 山下公園                                           | city     | yokohama | 1      | 2       | 1      | 3   | 0    | 1      | 2     | 0      | 2      | 0   | 0      | 1      | 2     |
| minatonomieruoka   | 港の見える丘公園                                   | city     | yokohama | 1      | 2       | 1      | 2   | 0    | 1      | 2     | 0      | 1      | 0   | 0      | 2      | 2     |
| osanbashi          | 横浜港大さん橋国際客船ターミナル                   | city     | yokohama | 1      | 2       | 0      | 3   | 0    | 1      | 2     | 1      | 1      | 0   | 0      | 0      | 3     |
| marinetower        | 横浜マリンタワー                                   | city     | yokohama | 2      | 1       | 0      | 2   | 0    | 0      | 1     | 2      | 1      | 0   | 0      | 0      | 3     |
| nipponmaru         | 日本丸メモリアルパーク                             | city     | yokohama | 2      | 2       | 0      | 3   | 0    | 1      | 1     | 1      | 2      | 2   | 0      | 0      | 1     |
| shonandaira        | 湘南平                                             | city     | shonan   | 1      | 0       | 2      | 2   | 0    | 1      | 1     | 0      | 2      | 0   | 0      | 2      | 3     |
| verny              | ヴェルニー・小栗公園（旧 ヴェルニー公園）          | city     | miura    | 1      | 2       | 0      | 3   | 0    | 1      | 2     | 0      | 1      | 0   | 0      | 2      | 2     |
| marien             | 川崎マリエン                                       | city     | kawasaki | 1      | 0       | 0      | 2   | 0    | 0      | 1     | 2      | 1      | 0   | 0      | 0      | 3     |
| gaikoukan          | 外交官の家                                         | city     | yokohama | 1      | 3       | 0      | 0   | 0    | 0      | 1     | 2      | 1      | 1   | 0      | 1      | 0     |

## スポットごとのメモ

- **鶴岡八幡宮**: 国の史跡で history 3。広い境内と参道を歩くので active 2。参拝は無料のため budget 1。
- **鎌倉大仏**: 国宝の大仏で history 3。大仏を眺めて過ごすため relax 2、子どもにもわかりやすく family 2。
- **長谷寺**: 寺院で history 3。アジサイの名所で nature 2、境内から海を望めるので sea 2、洞窟があり indoor 1。
- **大涌谷**: 噴気地帯の景観で nature 3。斜面を歩いて見て回るので active 3、のんびり座る場所ではないので relax 0。
- **芦ノ湖**: カルデラ湖と富士山の景色で nature 3、遊覧船で座って景色を見られるので relax 3。箱根神社などがあり history 1。
- **宮ヶ瀬湖**: ダム湖と丹沢の山で nature 3。公園・遊覧船・クリスマスツリーなど家族向けで family 3、水とエネルギー館で indoor 1。
- **江の島**: 海に浮かぶ島で sea 3。島内は坂と階段が多く active 2、史跡・名勝なので history 2。
- **由比ヶ浜**: 砂浜の海水浴場で sea 3、海水浴は子ども連れが多いので family 3。景色の主役は海なので nature 1。
- **城ヶ島**: 磯・灯台・海食崖の景色で nature 3・sea 3。磯遊び・磯釣りで active 2。
- **横浜中華街**: 500店以上の飲食店などで food 3。店内で過ごせるので indoor 2。
- **横浜赤レンガ倉庫**: 屋内の文化・商業施設で indoor 3。明治の倉庫で history 2、港に面して sea 1。
- **小町通り**: 食べ歩きの商店街で food 3。鶴岡八幡宮の参道近くで history 2。安く楽しめるので budget 1。
- **八景島シーパラダイス**: 水族館で indoor 3、遊園地もあり family 3。海に囲まれた島で sea 2。入場料がかかるので budget 3。
- **さがみ湖MORI MORI**: アトラクション・アスレチックで active 3・family 3。森の中なので nature 2。
- **カップヌードルミュージアム横浜**: 屋内の体験型博物館で indoor 3・family 3。食がテーマで food 2。
- **箱根湯本温泉**: 開湯 738 年とされる温泉で history 3・relax 3。温泉街の飲食・土産で food 2。宿泊中心で budget 3。
- **湯河原温泉**: 千歳川の谷沿いの温泉街で nature 3・relax 3。万葉集・文豪ゆかりで history 2。
- **七沢温泉**: 丹沢のふもとの温泉郷で nature 3・relax 3。

### 追加した 82 件（2026-11 追加・叩き台）

> facts（`data/spots.json`）と Wikipedia の記述をもとに Claude Code が付けた初期値です。
> 既存 18 件の art / animal / flower / night も同時に付けました（鶴岡八幡宮 flower 1、長谷寺 flower 2、
> 八景島シーパラダイス animal 3、赤レンガ倉庫 night 2、さがみ湖MORI MORI night 2、カップヌードルミュージアム art 2 など）。

- **小田原城**（歴史・寺社）: 3 = history、2 = active・family。budget 2。
- **建長寺**（歴史・寺社）: 3 = history、2 = relax。budget 1。
- **円覚寺**（歴史・寺社）: 3 = history、2 = nature・relax。budget 1。
- **箱根神社**（歴史・寺社）: 3 = history、2 = nature。budget 1。
- **大山阿夫利神社**（歴史・寺社）: 3 = history・nature・active、2 = なし。budget 2。
- **寒川神社**（歴史・寺社）: 3 = history、2 = なし。budget 1。
- **川崎大師（平間寺）**（歴史・寺社）: 3 = history、2 = なし。budget 1。
- **塔ノ岳**（自然・景色）: 3 = nature・active、2 = なし。budget 1。
- **金時山**（自然・景色）: 3 = nature・active、2 = なし。budget 1。
- **丹沢湖**（自然・景色）: 3 = nature、2 = active・relax。budget 1。
- **洒水の滝**（自然・景色）: 3 = nature、2 = なし。budget 1。
- **大楠山**（自然・景色）: 3 = nature、2 = sea・active。budget 1。
- **生田緑地**（自然・景色）: 3 = nature、2 = active・relax・family。budget 1。
- **相模湖**（自然・景色）: 3 = nature、2 = relax。budget 1。
- **七里ヶ浜**（海・ビーチ）: 3 = sea、2 = nature・relax。budget 1。
- **猿島**（海・ビーチ）: 3 = nature・sea、2 = history・active。budget 2。
- **観音崎公園**（海・ビーチ）: 3 = nature・sea、2 = history・active・family。budget 1。
- **真鶴半島**（海・ビーチ）: 3 = nature・sea、2 = active。budget 1。
- **サザンビーチちがさき**（海・ビーチ）: 3 = sea・family、2 = active。budget 1。
- **三浦海岸**（海・ビーチ）: 3 = sea・family、2 = active。budget 1。
- **稲村ヶ崎**（海・ビーチ）: 3 = history・sea、2 = nature・relax。budget 1。
- **新横浜ラーメン博物館**（グルメ・街歩き）: 3 = food・indoor、2 = family。budget 2。
- **三崎漁港**（グルメ・街歩き）: 3 = sea・food、2 = なし。budget 2。
- **小田原漁港**（グルメ・街歩き）: 3 = food、2 = sea。budget 2。
- **どぶ板通り**（グルメ・街歩き）: 3 = なし、2 = history・food。budget 1。
- **横浜元町**（グルメ・街歩き）: 3 = なし、2 = history・food。budget 2。
- **鈴廣かまぼこの里**（グルメ・街歩き）: 3 = food、2 = history・indoor・family。budget 2。
- **腰越漁港**（グルメ・街歩き）: 3 = sea・food、2 = なし。budget 1。
- **よこはまコスモワールド**（レジャー）: 3 = active・family・night、2 = なし。budget 2。
- **こどもの国**（レジャー）: 3 = active・family、2 = nature・animal。budget 2。
- **長井海の手公園 ソレイユの丘**（レジャー）: 3 = active・family、2 = nature。budget 2。
- **箱根小涌園**（レジャー）: 3 = relax・family、2 = active・indoor。budget 3。
- **大磯ロングビーチ**（レジャー）: 3 = active・family、2 = sea。budget 3。
- **横浜アンパンマンこどもミュージアム**（レジャー）: 3 = indoor・family、2 = active。budget 3。
- **辻堂海浜公園**（レジャー）: 3 = active・family、2 = なし。budget 2。
- **姥子温泉**（温泉・癒やし）: 3 = relax、2 = history・nature。budget 2。
- **底倉温泉**（温泉・癒やし）: 3 = history・relax、2 = nature。budget 3。
- **芦之湯温泉**（温泉・癒やし）: 3 = history・relax、2 = nature。budget 3。
- **鶴巻温泉**（温泉・癒やし）: 3 = relax、2 = なし。budget 2。
- **飯山温泉**（温泉・癒やし）: 3 = relax、2 = nature。budget 2。
- **中川温泉**（温泉・癒やし）: 3 = nature・relax、2 = なし。budget 2。
- **広沢寺温泉**（温泉・癒やし）: 3 = relax、2 = nature。budget 3。
- **箱根 彫刻の森美術館**（博物館・美術館）: 3 = art、2 = nature・family。budget 3。
- **ポーラ美術館**（博物館・美術館）: 3 = indoor・art、2 = nature・relax。budget 3。
- **川崎市 藤子・F・不二雄ミュージアム**（博物館・美術館）: 3 = indoor・family・art、2 = なし。budget 2。
- **神奈川県立生命の星・地球博物館**（博物館・美術館）: 3 = indoor・family、2 = art。budget 2。
- **原鉄道模型博物館**（博物館・美術館）: 3 = indoor・family・art、2 = なし。budget 2。
- **横浜美術館**（博物館・美術館）: 3 = indoor・art、2 = なし。budget 2。
- **川崎市立日本民家園**（博物館・美術館）: 3 = history、2 = nature・family・art。budget 2。
- **横須賀美術館**（博物館・美術館）: 3 = indoor・art、2 = sea・relax。budget 2。
- **記念艦「三笠」**（博物館・美術館）: 3 = history、2 = sea・indoor・art。budget 2。
- **相模原市立博物館**（博物館・美術館）: 3 = indoor・family、2 = history・art。budget 1。
- **新江ノ島水族館**（動物園・水族館）: 3 = sea・indoor・family・animal、2 = なし。budget 3。
- **よこはま動物園ズーラシア**（動物園・水族館）: 3 = family・animal、2 = nature・active。budget 2。
- **野毛山動物園**（動物園・水族館）: 3 = family・animal、2 = なし。budget 1。
- **金沢動物園（金沢自然公園）**（動物園・水族館）: 3 = family・animal、2 = nature・active。budget 2。
- **夢見ヶ崎動物公園**（動物園・水族館）: 3 = family・animal、2 = なし。budget 1。
- **箱根園（箱根園水族館）**（動物園・水族館）: 3 = なし、2 = nature・indoor・family・animal。budget 2。
- **相模川ふれあい科学館 アクアリウムさがみはら**（動物園・水族館）: 3 = indoor・family・animal、2 = なし。budget 1。
- **カワスイ 川崎水族館**（動物園・水族館）: 3 = indoor・animal、2 = family。budget 3。
- **観音崎自然博物館**（動物園・水族館）: 3 = family、2 = nature・sea・indoor・animal。budget 2。
- **相模原麻溝公園**（動物園・水族館）: 3 = active・family、2 = nature・animal・flower。budget 1。
- **三溪園**（花・庭園）: 3 = history・flower、2 = nature・relax。budget 2。
- **くりはま花の国**（花・庭園）: 3 = family・flower、2 = nature・active。budget 1。
- **吾妻山公園**（花・庭園）: 3 = flower、2 = nature・sea・active・family。budget 1。
- **神奈川県立大船フラワーセンター**（花・庭園）: 3 = flower、2 = nature・relax・family。budget 2。
- **小田原フラワーガーデン**（花・庭園）: 3 = flower、2 = nature・relax・indoor・family。budget 1。
- **曽我梅林**（花・庭園）: 3 = flower、2 = nature・relax。budget 1。
- **箱根湿生花園**（花・庭園）: 3 = nature・flower、2 = relax。budget 2。
- **明月院**（花・庭園）: 3 = history・flower、2 = nature・relax。budget 1。
- **花菜ガーデン**（花・庭園）: 3 = flower、2 = nature・relax・family。budget 2。
- **生田緑地ばら苑**（花・庭園）: 3 = flower、2 = nature・relax。budget 2。
- **横浜ランドマークタワー**（夜景・港町）: 3 = night、2 = food・indoor。budget 2。
- **山下公園**（夜景・港町）: 3 = sea、2 = history・relax・family・night。budget 1。
- **港の見える丘公園**（夜景・港町）: 3 = なし、2 = history・sea・relax・flower・night。budget 1。
- **横浜港大さん橋国際客船ターミナル**（夜景・港町）: 3 = sea・night、2 = history・relax。budget 1。
- **横浜マリンタワー**（夜景・港町）: 3 = night、2 = sea・indoor。budget 2。
- **日本丸メモリアルパーク**（夜景・港町）: 3 = sea、2 = history・family・art。budget 2。
- **湘南平**（夜景・港町）: 3 = night、2 = nature・sea・family・flower。budget 1。
- **ヴェルニー・小栗公園（旧 ヴェルニー公園）**（夜景・港町）: 3 = sea、2 = history・relax・flower・night。budget 1。
- **川崎マリエン**（夜景・港町）: 3 = night、2 = sea・indoor。budget 1。
- **外交官の家**（夜景・港町）: 3 = history、2 = indoor。budget 1。

## エリア（region）

おすすめエリアの表示に使う区分です。値と表示名は `lib/engine/constants.js` の `REGION_LABELS`。

| region   | 表示名             | 含む市町村（目安）                                      |
| -------- | ------------------ | ------------------------------------------------------- |
| yokohama | 横浜               | 横浜市                                                  |
| kawasaki | 川崎               | 川崎市                                                  |
| kamakura | 鎌倉               | 鎌倉市                                                  |
| shonan   | 湘南               | 藤沢市・茅ヶ崎市・寒川町・平塚市・大磯町・二宮町        |
| miura    | 三浦半島           | 横須賀市・三浦市・逗子市・葉山町                        |
| hakone   | 箱根               | 箱根町                                                  |
| seisho   | 小田原・湯河原     | 小田原市・真鶴町・湯河原町・南足柄市・足柄上郡          |
| kenoh    | 県央・相模原・丹沢 | 相模原市・厚木市・伊勢原市・秦野市・愛川町・清川村 など |

## シミュレーション結果（`npm run simulate`）

100 件の初期値で **1位 70/100、3位以内 94/100**（基準: 1位 65% 以上、3位以内 90% 以上。
問数の上限 12 問、`TOP_K` 10）。18 件のときは 1位 18/18・3位以内 18/18 でした。

同じジャンルどうし（鎌倉の寺社、箱根の温泉、横浜の美術館・博物館、水族館、花の名所、横浜港の公園など）は
タグが似ていて、同点になると spots.json で先に書かれたスポットが上になります。
タグを変えたら `npm run simulate` で、どのスポットが何位になるかを確認してください。
