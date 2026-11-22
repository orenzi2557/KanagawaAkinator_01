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

### 追加した 82 件（2026-11-22 取得）

座標は OpenStreetMap（Nominatim）を基本にし、Wikipedia の座標（記事の {{coord}}）と照合しました。
OSM の検索結果が別の場所だった・見つからなかったものは Wikipedia の座標を使い、備考に書いています。

| ID                 | スポット                                    | 緯度, 経度              | 出典（OSM の要素 / Wikipedia） | 備考                                                               | 確認者 |
| ------------------ | ------------------------------------------- | ----------------------- | ------------------------------ | ------------------------------------------------------------------ | ------ |
| odawarajo          | 小田原城                                    | 35.2510547, 139.1534249 | way/167050294                  |                                                                    |        |
| kenchoji           | 建長寺                                      | 35.3324455, 139.5575336 | way/695599052                  |                                                                    |        |
| engakuji           | 円覚寺                                      | 35.3379364, 139.5478197 | way/695600375                  |                                                                    |        |
| hakonejinja        | 箱根神社                                    | 35.2039731, 139.0255832 | way/553740875                  |                                                                    |        |
| oyamaafuri         | 大山阿夫利神社                              | 35.4318696, 139.2380210 | way/1175336500                 | 下社の位置                                                         |        |
| samukawa           | 寒川神社                                    | 35.3788954, 139.3830774 | way/199423605                  |                                                                    |        |
| kawasakidaishi     | 川崎大師（平間寺）                          | 35.5342515, 139.7294416 | way/29178625                   |                                                                    |        |
| tonodake           | 塔ノ岳                                      | 35.4540704, 139.1633170 | node/357416162                 |                                                                    |        |
| kintokiyama        | 金時山                                      | 35.2896965, 139.0048479 | node/2270162192                |                                                                    |        |
| tanzawako          | 丹沢湖                                      | 35.4195153, 139.0453659 | relation/2313160               |                                                                    |        |
| shasui             | 洒水の滝                                    | 35.3524473, 139.0615444 | node/11936564496               |                                                                    |        |
| ogusuyama          | 大楠山                                      | 35.2502062, 139.6280609 | node/2303621064                |                                                                    |        |
| ikuta              | 生田緑地                                    | 35.6099693, 139.5594796 | way/98891374                   |                                                                    |        |
| sagamilake         | 相模湖                                      | 35.6106949, 139.1878024 | relation/2313173               | 湖面の代表点                                                       |        |
| shichirigahama     | 七里ヶ浜                                    | 35.3039934, 139.5140657 | way/53750907                   |                                                                    |        |
| sarushima          | 猿島                                        | 35.2860670, 139.6940563 | way/130990566                  |                                                                    |        |
| kannonzaki         | 観音崎公園                                  | 35.2559599, 139.7392797 | way/640826577                  |                                                                    |        |
| manazuru           | 真鶴半島                                    | 35.1460000, 139.1481944 | Wikipedia                      | Wikipedia の座標（OSM で半島の要素が見つからなかったため）         |        |
| southernbeach      | サザンビーチちがさき                        | 35.3171877, 139.3980517 | node/4356704049                |                                                                    |        |
| miurakaigan        | 三浦海岸                                    | 35.1850560, 139.6551760 | Wikipedia                      | Wikipedia の座標（OSM の検索結果が別の海水浴場だったため）         |        |
| inamuragasaki      | 稲村ヶ崎                                    | 35.3016962, 139.5254624 | node/6308019819                |                                                                    |        |
| ramenmuseum        | 新横浜ラーメン博物館                        | 35.5098496, 139.6145269 | node/1838113117                |                                                                    |        |
| misakiport         | 三崎漁港                                    | 35.1409069, 139.6163704 | way/194184688                  | 漁港内の施設「うらり」の位置で代用                                 |        |
| odawaraport        | 小田原漁港                                  | 35.2344853, 139.1449160 | way/799555453                  | 「漁港の駅 TOTOCO小田原」の位置で代用                              |        |
| dobuita            | どぶ板通り                                  | 35.2818854, 139.6657539 | way/33039334                   |                                                                    |        |
| motomachi          | 横浜元町                                    | 35.4402292, 139.6479342 | way/26491553                   | 通りの代表点                                                       |        |
| suzuhiro           | 鈴廣かまぼこの里                            | 35.2459153, 139.1298412 | way/655272660                  |                                                                    |        |
| koshigoe           | 腰越漁港                                    | 35.3066667, 139.4916667 | Wikipedia                      | Wikipedia の座標（OSM で見つからなかったため）                     |        |
| cosmoworld         | よこはまコスモワールド                      | 35.4556655, 139.6355287 | way/319352565                  |                                                                    |        |
| kodomonokuni       | こどもの国                                  | 35.5618827, 139.4911052 | way/147428294                  |                                                                    |        |
| soleil             | 長井海の手公園 ソレイユの丘                 | 35.1963947, 139.6116082 | node/9941210685                | バス停「ソレイユの丘」の位置で代用                                 |        |
| kowakien           | 箱根小涌園                                  | 35.2393532, 139.0451608 | node/4711713689                | 「箱根小涌園ユネッサン」の位置                                     |        |
| oisolongbeach      | 大磯ロングビーチ                            | 35.3009275, 139.2822028 | way/222969969                  |                                                                    |        |
| anpanman           | 横浜アンパンマンこどもミュージアム          | 35.4632355, 139.6289425 | way/723905273                  |                                                                    |        |
| tsujido            | 辻堂海浜公園                                | 35.3212805, 139.4481669 | way/164139709                  |                                                                    |        |
| ubako              | 姥子温泉                                    | 35.2433378, 139.0092333 | node/6683971983                |                                                                    |        |
| sokokura           | 底倉温泉                                    | 35.2440280, 139.0568060 | Wikipedia                      | Wikipedia の座標（OSM の検索結果が別の温泉のバス停だったため）     |        |
| ashinoyu           | 芦之湯温泉                                  | 35.2197760, 139.0434870 | node/8670938739                | 地区（芦之湯）の代表点                                             |        |
| tsurumaki          | 鶴巻温泉                                    | 35.3808983, 139.2775365 | way/160438547                  | 鶴巻温泉駅の位置で代用                                             |        |
| iiyama             | 飯山温泉                                    | 35.4805774, 139.3051615 | node/3800202240                | バス停「飯山温泉入口」の位置で代用                                 |        |
| nakagawaonsen      | 中川温泉                                    | 35.4438875, 139.0495859 | way/711324599                  | 町営「ぶなの湯」の位置                                             |        |
| kosoji             | 広沢寺温泉                                  | 35.4532855, 139.2840026 | node/2034665314                | バス停「広沢寺温泉」の位置で代用                                   |        |
| chokokunomori      | 箱根 彫刻の森美術館                         | 35.2442838, 139.0520834 | node/5182750902                |                                                                    |        |
| pola               | ポーラ美術館                                | 35.2566563, 139.0212049 | way/388180518                  |                                                                    |        |
| fujiko             | 川崎市 藤子・F・不二雄ミュージアム          | 35.6098389, 139.5736331 | way/1551428983                 |                                                                    |        |
| seimeinohoshi      | 神奈川県立生命の星・地球博物館              | 35.2393863, 139.1215819 | node/1420830429                |                                                                    |        |
| haratetsudo        | 原鉄道模型博物館                            | 35.4631490, 139.6250863 | node/2253958411                |                                                                    |        |
| yokohamabijutsukan | 横浜美術館                                  | 35.4570993, 139.6305271 | way/36213480                   |                                                                    |        |
| minkaen            | 川崎市立日本民家園                          | 35.6087072, 139.5594639 | relation/8200233               |                                                                    |        |
| yokosukabijutsukan | 横須賀美術館                                | 35.2596667, 139.7380107 | relation/19193052              |                                                                    |        |
| mikasa             | 記念艦「三笠」                              | 35.2851844, 139.6743413 | way/170957301                  |                                                                    |        |
| sagamiharamuseum   | 相模原市立博物館                            | 35.5593079, 139.3930755 | node/1420828722                |                                                                    |        |
| enosui             | 新江ノ島水族館                              | 35.3100750, 139.4794388 | way/727347470                  |                                                                    |        |
| zoorasia           | よこはま動物園ズーラシア                    | 35.4953194, 139.5237500 | Wikipedia                      | Wikipedia の座標（OSM の検索結果が案内板だったため）               |        |
| nogeyama           | 野毛山動物園                                | 35.4475396, 139.6226411 | way/158801232                  |                                                                    |        |
| kanazawazoo        | 金沢動物園（金沢自然公園）                  | 35.3515833, 139.6002222 | Wikipedia                      | Wikipedia の座標（金沢自然公園。OSM の検索結果がバス停だったため） |        |
| yumemigasaki       | 夢見ヶ崎動物公園                            | 35.5495620, 139.6649680 | way/28918314                   |                                                                    |        |
| hakoneen           | 箱根園（箱根園水族館）                      | 35.2122439, 139.0093068 | node/1420831376                | 箱根園水族館の位置                                                 |        |
| fureaikagakukan    | 相模川ふれあい科学館 アクアリウムさがみはら | 35.5474136, 139.3288881 | way/499903519                  |                                                                    |        |
| kawasui            | カワスイ 川崎水族館                         | 35.5292942, 139.6968358 | node/7731662125                |                                                                    |        |
| kannonzakimuseum   | 観音崎自然博物館                            | 35.2517880, 139.7423330 | node/1420833224                |                                                                    |        |
| asamizo            | 相模原麻溝公園                              | 35.5267304, 139.3919896 | way/261634460                  |                                                                    |        |
| sankeien           | 三溪園                                      | 35.4171400, 139.6593804 | way/312888383                  |                                                                    |        |
| kurihama           | くりはま花の国                              | 35.2211740, 139.7018783 | way/618024305                  |                                                                    |        |
| azumayama          | 吾妻山公園                                  | 35.2990539, 139.2502139 | way/392775631                  |                                                                    |        |
| ofunaflower        | 神奈川県立大船フラワーセンター              | 35.3480618, 139.5209316 | way/235838937                  |                                                                    |        |
| odawaraflower      | 小田原フラワーガーデン                      | 35.2806453, 139.1289508 | way/236985100                  |                                                                    |        |
| sogabairin         | 曽我梅林                                    | 35.2995446, 139.1930641 | node/6700903686                |                                                                    |        |
| shisseikaen        | 箱根湿生花園                                | 35.2659563, 139.0072245 | way/534023812                  |                                                                    |        |
| meigetsuin         | 明月院                                      | 35.3349131, 139.5516437 | way/695600376                  |                                                                    |        |
| kanagarden         | 花菜ガーデン                                | 35.3588089, 139.3124824 | way/572790844                  |                                                                    |        |
| ikutarose          | 生田緑地ばら苑                              | 35.6080493, 139.5689611 | node/4412870143                | ばら苑の位置                                                       |        |
| landmark           | 横浜ランドマークタワー                      | 35.4545980, 139.6314519 | way/64891750                   |                                                                    |        |
| yamashitapark      | 山下公園                                    | 35.4457103, 139.6499494 | way/35866698                   |                                                                    |        |
| minatonomieruoka   | 港の見える丘公園                            | 35.4401741, 139.6547043 | way/48117465                   |                                                                    |        |
| osanbashi          | 横浜港大さん橋国際客船ターミナル            | 35.4516667, 139.6477778 | Wikipedia                      | Wikipedia の座標（OSM の検索結果が別の施設だったため）             |        |
| marinetower        | 横浜マリンタワー                            | 35.4439285, 139.6509018 | way/319050351                  |                                                                    |        |
| nipponmaru         | 日本丸メモリアルパーク                      | 35.4544800, 139.6334463 | way/36073763                   |                                                                    |        |
| shonandaira        | 湘南平                                      | 35.3198696, 139.3087418 | node/494831838                 |                                                                    |        |
| verny              | ヴェルニー公園                              | 35.2834283, 139.6589781 | way/241056833                  |                                                                    |        |
| marien             | 川崎マリエン                                | 35.4973510, 139.7626762 | way/214602073                  |                                                                    |        |
| gaikoukan          | 外交官の家                                  | 35.4366340, 139.6432579 | way/404722400                  |                                                                    |        |

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

### 追加した 82 件

日本語版 Wikipedia の記事（本文全体）に書かれている内容だけから作りました。営業時間・料金は含めていません（「入園無料」など
記事に書かれている無料の情報だけは含めています。変わることがあるので公式サイトで確認してください）。

| ID                 | 出典                                                                          | 確認者 |
| ------------------ | ----------------------------------------------------------------------------- | ------ |
| odawarajo          | https://ja.wikipedia.org/wiki/小田原城                                        |        |
| kenchoji           | https://ja.wikipedia.org/wiki/建長寺                                          |        |
| engakuji           | https://ja.wikipedia.org/wiki/円覚寺                                          |        |
| hakonejinja        | https://ja.wikipedia.org/wiki/箱根神社                                        |        |
| oyamaafuri         | https://ja.wikipedia.org/wiki/大山阿夫利神社                                  |        |
| samukawa           | https://ja.wikipedia.org/wiki/寒川神社                                        |        |
| kawasakidaishi     | https://ja.wikipedia.org/wiki/平間寺                                          |        |
| tonodake           | https://ja.wikipedia.org/wiki/塔ノ岳                                          |        |
| kintokiyama        | https://ja.wikipedia.org/wiki/金時山                                          |        |
| tanzawako          | https://ja.wikipedia.org/wiki/丹沢湖                                          |        |
| shasui             | https://ja.wikipedia.org/wiki/洒水の滝                                        |        |
| ogusuyama          | https://ja.wikipedia.org/wiki/大楠山                                          |        |
| ikuta              | https://ja.wikipedia.org/wiki/生田緑地                                        |        |
| sagamilake         | https://ja.wikipedia.org/wiki/相模湖                                          |        |
| shichirigahama     | https://ja.wikipedia.org/wiki/七里ヶ浜                                        |        |
| sarushima          | https://ja.wikipedia.org/wiki/猿島                                            |        |
| kannonzaki         | https://ja.wikipedia.org/wiki/観音崎公園                                      |        |
| manazuru           | https://ja.wikipedia.org/wiki/真鶴半島                                        |        |
| southernbeach      | https://ja.wikipedia.org/wiki/サザンビーチちがさき                            |        |
| miurakaigan        | https://ja.wikipedia.org/wiki/三浦海岸                                        |        |
| inamuragasaki      | https://ja.wikipedia.org/wiki/稲村ヶ崎                                        |        |
| ramenmuseum        | https://ja.wikipedia.org/wiki/新横浜ラーメン博物館                            |        |
| misakiport         | https://ja.wikipedia.org/wiki/三崎漁港                                        |        |
| odawaraport        | https://ja.wikipedia.org/wiki/小田原漁港                                      |        |
| dobuita            | https://ja.wikipedia.org/wiki/どぶ板通り                                      |        |
| motomachi          | https://ja.wikipedia.org/wiki/元町_(横浜市)                                   |        |
| suzuhiro           | https://ja.wikipedia.org/wiki/鈴廣                                            |        |
| koshigoe           | https://ja.wikipedia.org/wiki/腰越漁港                                        |        |
| cosmoworld         | https://ja.wikipedia.org/wiki/よこはまコスモワールド                          |        |
| kodomonokuni       | https://ja.wikipedia.org/wiki/こどもの国_(横浜市)                             |        |
| soleil             | https://ja.wikipedia.org/wiki/長井海の手公園_ソレイユの丘                     |        |
| kowakien           | https://ja.wikipedia.org/wiki/箱根小涌園                                      |        |
| oisolongbeach      | https://ja.wikipedia.org/wiki/大磯ロングビーチ                                |        |
| anpanman           | https://ja.wikipedia.org/wiki/横浜アンパンマンこどもミュージアム              |        |
| tsujido            | https://ja.wikipedia.org/wiki/辻堂海浜公園                                    |        |
| ubako              | https://ja.wikipedia.org/wiki/姥子温泉                                        |        |
| sokokura           | https://ja.wikipedia.org/wiki/底倉温泉                                        |        |
| ashinoyu           | https://ja.wikipedia.org/wiki/芦之湯温泉                                      |        |
| tsurumaki          | https://ja.wikipedia.org/wiki/鶴巻温泉                                        |        |
| iiyama             | https://ja.wikipedia.org/wiki/飯山温泉                                        |        |
| nakagawaonsen      | https://ja.wikipedia.org/wiki/中川温泉                                        |        |
| kosoji             | https://ja.wikipedia.org/wiki/広沢寺温泉                                      |        |
| chokokunomori      | https://ja.wikipedia.org/wiki/箱根_彫刻の森美術館                             |        |
| pola               | https://ja.wikipedia.org/wiki/ポーラ美術館                                    |        |
| fujiko             | https://ja.wikipedia.org/wiki/藤子・F・不二雄ミュージアム                     |        |
| seimeinohoshi      | https://ja.wikipedia.org/wiki/神奈川県立生命の星・地球博物館                  |        |
| haratetsudo        | https://ja.wikipedia.org/wiki/原鉄道模型博物館                                |        |
| yokohamabijutsukan | https://ja.wikipedia.org/wiki/横浜美術館                                      |        |
| minkaen            | https://ja.wikipedia.org/wiki/日本民家園                                      |        |
| yokosukabijutsukan | https://ja.wikipedia.org/wiki/横須賀美術館                                    |        |
| mikasa             | https://ja.wikipedia.org/wiki/三笠_(戦艦)                                     |        |
| sagamiharamuseum   | https://ja.wikipedia.org/wiki/相模原市立博物館                                |        |
| enosui             | https://ja.wikipedia.org/wiki/新江ノ島水族館                                  |        |
| zoorasia           | https://ja.wikipedia.org/wiki/よこはま動物園ズーラシア                        |        |
| nogeyama           | https://ja.wikipedia.org/wiki/野毛山動物園                                    |        |
| kanazawazoo        | https://ja.wikipedia.org/wiki/金沢自然公園                                    |        |
| yumemigasaki       | https://ja.wikipedia.org/wiki/夢見ヶ崎動物公園                                |        |
| hakoneen           | https://ja.wikipedia.org/wiki/箱根園                                          |        |
| fureaikagakukan    | https://ja.wikipedia.org/wiki/相模川ふれあい科学館                            |        |
| kawasui            | https://ja.wikipedia.org/wiki/カワスイ_川崎水族館                             |        |
| kannonzakimuseum   | https://ja.wikipedia.org/wiki/観音崎自然博物館                                |        |
| asamizo            | https://ja.wikipedia.org/wiki/相模原麻溝公園                                  |        |
| sankeien           | https://ja.wikipedia.org/wiki/三溪園                                          |        |
| kurihama           | https://ja.wikipedia.org/wiki/くりはま花の国                                  |        |
| azumayama          | https://ja.wikipedia.org/wiki/吾妻山_(神奈川県)                               |        |
| ofunaflower        | https://ja.wikipedia.org/wiki/神奈川県立大船フラワーセンター                  |        |
| odawaraflower      | https://ja.wikipedia.org/wiki/小田原フラワーガーデン                          |        |
| sogabairin         | https://ja.wikipedia.org/wiki/曽我梅林                                        |        |
| shisseikaen        | https://ja.wikipedia.org/wiki/箱根町立箱根湿生花園                            |        |
| meigetsuin         | https://ja.wikipedia.org/wiki/明月院                                          |        |
| kanagarden         | https://ja.wikipedia.org/wiki/神奈川県立花と緑のふれあいセンター_花菜ガーデン |        |
| ikutarose          | https://ja.wikipedia.org/wiki/生田緑地                                        |        |
| landmark           | https://ja.wikipedia.org/wiki/横浜ランドマークタワー                          |        |
| yamashitapark      | https://ja.wikipedia.org/wiki/山下公園                                        |        |
| minatonomieruoka   | https://ja.wikipedia.org/wiki/港の見える丘公園                                |        |
| osanbashi          | https://ja.wikipedia.org/wiki/大さん橋                                        |        |
| marinetower        | https://ja.wikipedia.org/wiki/横浜マリンタワー                                |        |
| nipponmaru         | https://ja.wikipedia.org/wiki/日本丸メモリアルパーク                          |        |
| shonandaira        | https://ja.wikipedia.org/wiki/湘南平                                          |        |
| verny              | https://ja.wikipedia.org/wiki/ヴェルニー公園                                  |        |
| marien             | https://ja.wikipedia.org/wiki/川崎マリエン                                    |        |
| gaikoukan          | https://ja.wikipedia.org/wiki/外交官の家                                      |        |

## 要件との差分（要確認）

- **相模湖プレジャーフォレスト**は 2024年7月13日に「**さがみ湖MORI MORI**」へ改称しています（Wikipedia より）。
  アプリでは「さがみ湖MORI MORI（旧 相模湖プレジャーフォレスト）」と表示しています。
- **カップヌードルミュージアム横浜**の正式名称は「安藤百福発明記念館 横浜」で、カップヌードルミュージアムは愛称です。

- **ヴェルニー公園**は 2026年11月14日に正式名称を「**ヴェルニー・小栗公園**」に変更しています（Wikipedia より）。
  アプリでは「ヴェルニー・小栗公園（旧 ヴェルニー公園）」と表示しています。
- **川崎大師**の正式名称は「平間寺」、**金沢動物園**は金沢自然公園の中の施設、**箱根園**の水族館は箱根園の中の施設です。
  facts はそれぞれの記事（平間寺・金沢自然公園・箱根園）から作っています。
- **生田緑地**と**生田緑地ばら苑**は同じ記事（生田緑地）の別の節から facts を作っています。

## 基本説明（`data/descriptions.json`）

`npm run generate:descriptions`（gemma3:4b）で生成したあと、Claude Code が facts と照合し、
facts にない記述（例: 長谷寺「アジサイの名所として知られる洞窟」、宮ヶ瀬湖「ダムの仕組みを学べる」、
七沢温泉「地域住民に親しまれている」など）を含む 13 件を手で書き直しました。
**チームでの最終確認はまだです。** facts を直したら、その ID の説明も作り直して確認してください。

追加した 82 件の基本説明は Ollama を使わず、Claude Code が facts だけをもとに書きました（facts にないことは書いていません）。
**チームでの確認はまだです。**
