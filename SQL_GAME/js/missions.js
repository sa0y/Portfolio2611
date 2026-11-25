const missions = [
    {
        id: 0,
        title: "プロローグ：匿名の告発と押収資料の確認",
        desc: "2026年11月に届いた匿名メールの手がかりをもとに、押収された各テーブルの全体像と共通IDを確認せよ。",
        isBriefing: true,
        dialogue: "上司：2026年11月、監査部門に匿名メールが届いた。『TECH-26のUSBメモリの輸入取引を記録が消される前に調べてください。』とのことだ。まずは輸入データを含む資料全体を見てみよう。",
        explanation: `まずは調査の土台となる各テーブルを確認しましょう。

・各タブを切り替えて、どんなテーブルと列（カラム）があるか確認します。
・表どうしをつなぐ手がかりになる「共通のID（company_id や trade_id）」にも目を向けておきましょう。

確認が終わったら、「資料の確認を完了する」ボタンを押して捜査に進みます。`,
        expectedSql: "",
        hints: [
            {
                level: 1,
                type: "進め方",
                text: "まずは画面上のタブを切り替えて、どんな表があり、それぞれどんな項目（列）を持っているか眺めてみましょう。まだSQLを書かなくても大丈夫です。"
            },
            {
                level: 2,
                type: "見るべき場所",
                text: "会社を表すIDや、取引を表すIDがどの表にあるかに注目してみてください。あとで別々の表の情報を結びつけるときの目印になります。"
            },
            {
                level: 3,
                type: "次のステップ",
                text: "表の全体像がつかめたら、下の完了ボタンを押して第1章に進みましょう。実際のSQL操作は第1章から始まります。"
            }
        ],
        group: "🌱 プロローグ：匿名の告発",
        glossary: {
            title: "プロローグで確認する押収資料",
            html: `
- <span class="badge">Companies</span> 会社マスター（company_id / company_name / address）<br>
- <span class="badge">Imports</span> 輸入・受入数量・USB容量記録1,000件（trade_id / company_id / model_number / product_name / category / quantity / received_quantity / declared_value / declaration_date / declared_weight_kg / actual_weight_kg / advertised_capacity / actual_capacity）<br>
- <span class="badge">Containers</span> コンテナ保管記録（container_record_id / trade_id / container_area / container_number）
            `
        }
    },

    // ==========================================
    // 第1章：不自然な申告金額（01〜04）
    // ==========================================
    {
        id: 1,
        title: "01. 輸入記録の全体像を確認せよ",
        desc: "Imports テーブルの全データを取得し、取引記録の全体像を確認せよ。",
        orderSensitive: false,
        explanation: `【解説】
SELECT * FROM テーブル名; は、指定したテーブルのすべての列とすべての行を取得する基本のSQLです。

・SELECT *：すべての列を取り出す
・FROM テーブル名：どのテーブルから取るか指定する
・（末尾の ; はあってもなくても大丈夫です）

まずは1,000件の輸入取引記録にどんな項目と値が入っているか確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：輸入取引記録の全体像を確認できたな。",
            learned: [
                "SELECT *：すべての列を取得する",
                "FROM テーブル名：データを取得するテーブルを指定する"
            ]
        },
        expectedSql: "SELECT * FROM Imports;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "まずは絞り込みをせず、「どんなデータがどれくらい入っているか」を丸ごと確認する一歩目です。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "「どの列を出すか」を指定する命令と、「どの表から取るか」を指定する命令を組み合わせます。列をひとつずつ書かなくても「すべて」を表す記号が使えます。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT * FROM 表A の形で、すべての列・行を取得する指定と表名を組み合わせましょう。"
            }
        ],
        dialogue: "上司：まずはデータを見てくれ。何が問題なのか、そこから調べよう。まずは Imports の全記録を出して全体を確認してみよう。",
        group: "🔍 第1章：不自然な申告金額",
        glossary: {
            title: "対象テーブル・カラム",
            html: "• <span class='badge'>Imports</span> 輸入・取引記録の全データ（1,000件・すべての列）"
        }
    },
    {
        id: 2,
        title: "02. USBメモリの取引に絞り込め",
        desc: "Imports テーブルから、カテゴリ（category）が「USBメモリ」の取引記録だけを取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
WHERE 句を使うと、条件に合う行だけを絞り込めます。

・WHERE category = 'USBメモリ'：カテゴリが USBメモリ の行だけを選ぶ

文字列を指定するときは、シングルクォーテーション（' '）で囲むのがポイントです。`,
        clearFeedback: {
            dialogue: "上司：USBメモリの取引記録を抽出できたな。",
            learned: [
                "WHERE：条件でデータを絞り込む",
                "=：値が一致するか比較する",
                "'USBメモリ'：文字列を指定する（シングルクォーテーションで囲む）"
            ]
        },
        expectedSql: "SELECT * FROM Imports WHERE category = 'USBメモリ';",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "全件ではなく、「商品の種類（カテゴリ）が特定のものに一致する行」だけを残したいときの絞り込みです。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "条件をつけるためのキーワードと、等しいことを表す記号を使います。文字の値を書くときは、シングルクォーテーションで囲むのがルールです。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT * FROM 表A → WHERE 表A.カラム = '値' の形で、全件取得の形に条件部分を追加しましょう。"
            }
        ],
        dialogue: "上司：匿名メールには『USBメモリの輸入取引を調べてください』とあったな。まずはカテゴリが『USBメモリ』の取引に絞り込んでみよう。",
        group: "🔍 第1章：不自然な申告金額",
        glossary: {
            title: "対象カラムの意味",
            html: "• <span class='badge'>category</span> 商品のカテゴリ（'USBメモリ' を指定）"
        }
    },
    {
        id: 3,
        title: "03. TECH-26の申告額を安い順に並べよ",
        desc: "Imports テーブルから、型番（model_number）が「TECH-26」の記録を、申告額（declared_value）が安い順（昇順）に並べよ。",
        orderSensitive: true,
        explanation: `【解説】
ORDER BY 列名 を使うと、指定した列の値が小さい順（昇順・安い順）に並べ替えられます。

・ORDER BY declared_value：申告額が安い順に並べる
・※ ASC をつけて ORDER BY declared_value ASC と書いても同じ意味になります

同じ型番・似た数量でも、申告額が極端に低い取引がないか見比べてみましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26の取引では、申告額に大きな差がある記録が確認できたな。",
            learned: [
                "ORDER BY 列名：指定した列の小さい順（昇順・安い順）に並べ替える",
                "ASC：昇順を明示したいときに使うキーワード（省略しても昇順になる）"
            ]
        },
        expectedSql: `SELECT *
FROM Imports
WHERE model_number = 'TECH-26'
ORDER BY declared_value;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "「型番で絞り込む」ことと、「金額が小さいものから順に見やすく並べる」ことの2つを同時に行います。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "条件で絞る命令に加えて、並び替えを指定するキーワードを使います。何も指定しないと小さい順（昇順）になります。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT * FROM 表A → WHERE 表A.カラム = '値' → ORDER BY 表A.カラム ASC の形で、条件のあとに並び替えを加えましょう。"
            }
        ],
        dialogue: "上司：TECH-26 の取引を申告額が安い順に並べてみよう。同じ型番なのに申告金額が大きく異なる取引がないか確かめるんだ。",
        group: "🔍 第1章：不自然な申告金額",
        glossary: {
            title: "対象カラムの意味",
            html: `
- <span class='badge'>model_number</span> 製品の型番（TECH-26）<br>
- <span class='badge'>quantity</span> 輸入数量（比較の基準）<br>
- <span class='badge'>declared_value</span> 申告された取引金額（並び替えの対象）
            `
        }
    },
    {
        id: 4,
        title: "04. TECH-26 の最新取引記録を確認せよ",
        desc: "Imports テーブルから、型番（model_number）が「TECH-26」の取引を対象に、申告日（declaration_date）が最も新しい記録を10件取得せよ。",
        orderSensitive: true,
        explanation: `【解説】
条件絞り込み、降順並び替え、件数制限を組み合わせて「最新の10件」を取り出します。

・WHERE model_number = 'TECH-26'：型番が TECH-26 の取引に絞る
・ORDER BY declaration_date DESC：新しい日付が上に来るよう並べる
・LIMIT 10：先頭の10件だけを取得する

申告金額だけでは判断しきれないため、次の第2章では貨物の数量にも異常がないか調べていきます。`,
        clearFeedback: {
            dialogue: "上司：TECH-26 の申告日が新しい順の記録を確認できたな。",
            learned: [
                "WHERE：条件に一致するデータを絞り込む",
                "ORDER BY 列名 DESC：降順（大きい順・新しい順）に並べ替える",
                "LIMIT 10：取得する件数を10件に制限する"
            ]
        },
        expectedSql: `SELECT *
FROM Imports
WHERE model_number = 'TECH-26'
ORDER BY declaration_date DESC
LIMIT 10;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "「新しい日付＝値が大きいほう」が上に来るように並べたあと、上から決まった件数だけ抜き出します。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "大きい順・新しい順に並べる指定と、取り出す行数を制限するキーワードを使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT * FROM 表A → WHERE 表A.カラム = '値' → ORDER BY 表A.日付列 DESC → LIMIT 件数 の順で組み立てましょう。"
            }
        ],
        dialogue: "上司：TECH-26 の取引は申告額の低さが気になるものがあるな。申告日が最も新しい記録を10件出して、最近の状況を確かめよう。",
        group: "🔍 第1章：不自然な申告金額",
        glossary: {
            title: "対象カラムの意味",
            html: `
- <span class='badge'>model_number</span> 製品の型番（'TECH-26' を指定）<br>
- <span class='badge'>declaration_date</span> 申告日（並び替えに利用）<br>
- <span class='badge'>LIMIT 10</span> 取得件数の上限（最大10件）
            `
        }
    },

    // ==========================================
    // 第2章：一致しない数量（05〜08）
    // ==========================================
    {
        id: 5,
        title: "05. TECH-26の申告数量と受入数量が異なる記録を抽出せよ",
        desc: "Imports テーブルから、型番（model_number）が「TECH-26」の取引のうち、申告数量（quantity）と実際の受入数量（received_quantity）が一致しない記録をすべて取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "AND", "=", "!="],
        difficulty: 2,
        explanation: `【解説】
まず WHERE で型番を TECH-26 に絞り、AND で数量の条件を加えます。!=（または <>）を使うと、2つの値が「等しくない」行を取り出せます。

・model_number = 'TECH-26'：TECH-26 の取引に絞る
・quantity != received_quantity：申告数量と受入数量が違う行を探す

TECH-26 の受入数量の記録を確認し、数量が一致していない取引を洗い出しましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26で申告数量と受入数量が一致しない記録を確認できたな。",
            learned: [
                "WHERE：条件に一致するデータを絞り込む",
                "AND：型番と数量の両方の条件を満たす行を取得する",
                "!=：2つの値が等しくないことを判定する",
                "<>：!= と同じく、等しくないことを判定する"
            ]
        },
        expectedSql: "SELECT * FROM Imports WHERE model_number = 'TECH-26' AND quantity != received_quantity;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "まずTECH-26の取引に絞り、その中から「2つの数量の列を見比べて、値がズレている行」を探します。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "型番で絞る条件と、それに追加する条件をつなぐAND、「同じではない（等しくない）」ことを表す比較記号を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT * FROM 表A → WHERE 表A.カラム = '値' AND 表A.カラム != 表A.カラム の形で、2つ目の条件をANDで加えましょう。"
            }
        ],
        dialogue: "上司：TECH-26の貨物に数量の異常がないか確認しよう。申告数量と実際の受入数量が異なる取引を抽出してみてくれ。",
        group: "📦 第2章：一致しない数量",
        glossary: {
            title: "対象テーブル・カラム",
            html: `
- <span class='badge'>model_number</span> 製品の型番（TECH-26）<br>
- <span class='badge'>quantity</span> 書類上の申告数量<br>
- <span class='badge'>received_quantity</span> 実際に受け入れた数量<br>
- <span class='badge'>AND</span> 型番と数量の両方の条件を満たす
            `
        }
    },
    {
        id: 6,
        title: "06. TECH-26の受入数量が申告数量を下回る記録を抽出せよ",
        desc: "Imports テーブルから、型番（model_number）が「TECH-26」の取引のうち、実際の受入数量（received_quantity）が申告数量（quantity）を下回っている記録だけを取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "AND", "=", "<"],
        difficulty: 2,
        explanation: `【解説】
WHERE で TECH-26 に絞り、AND で数量の条件を加えます。< を使うと、左側の値が右側の値より「小さい」行を絞り込めます。

・model_number = 'TECH-26'：TECH-26 の取引に絞る
・received_quantity < quantity：受入数量が申告数量より少ない行を探す

TECH-26 の中から、書類上の数より実際の数が少ない取引だけを抜き出しましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26で申告数量より受入数量が少ない記録を抽出できたな。",
            learned: [
                "<：左側の値が右側の値より小さいことを判定する",
                "AND：型番と数量の両方の条件を満たす行を取得する",
                "WHERE：指定した条件に一致する記録だけを取得する"
            ]
        },
        expectedSql: "SELECT * FROM Imports WHERE model_number = 'TECH-26' AND received_quantity < quantity;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "TECH-26の取引に絞ったうえで、「下回る」＝「実際の受入数の方が、申告された数より少ない」という大小関係を調べます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "型番で絞る条件、それに条件を追加するAND、左の値が右の値より小さいことを示す記号を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT * FROM 表A → WHERE 表A.カラム = '値' AND 表A.数値列 < 表A.数値列 の形で、比較条件をANDで加えましょう。"
            }
        ],
        dialogue: "上司：今度はTECH-26の中から、受入数量が申告数量より少ない、つまり数量が不足している取引だけに絞り込んでみよう。",
        group: "📦 第2章：一致しない数量",
        glossary: {
            title: "対象テーブル・カラム",
            html: `
- <span class='badge'>model_number</span> 製品の型番（TECH-26）<br>
- <span class='badge'>received_quantity</span> 実際の受入数量<br>
- <span class='badge'>quantity</span> 書類上の申告数量<br>
- <span class='badge'>AND</span> 型番と数量の両方の条件を満たす<br>
- <span class='badge'><</span> 左側が右側より小さいことを表す
            `
        }
    },
    {
        id: 7,
        title: "07. TECH-26の数量差を計算して異常の規模を確認せよ",
        desc: "Imports テーブルから、型番（model_number）が「TECH-26」の取引について、取引ID（trade_id）と不足数（missing_quantity）を取得し、不足数が大きい順に並べよ。",
        orderSensitive: true,
        concept: ["WHERE", "=", "SELECT", "-", "AS"],
        difficulty: 3,
        explanation: `【解説】
WHERE で TECH-26 の取引に絞ってから、列同士を引き算し、その結果に AS で別名を付けます。

・WHERE model_number = 'TECH-26'：TECH-26 の取引に絞る
・quantity - received_quantity：数量の差（不足数）を計算する
・AS missing_quantity：計算結果の列名を missing_quantity にする
・ORDER BY missing_quantity DESC：不足数が大きい順（降順）に並べる

TECH-26 の取引に限って、不足数の大きいものから確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26の取引ごとの数量不足を大きい順に確認できたな。T004では350個の不足が見つかった。",
            learned: [
                "WHERE：TECH-26の取引に絞り込む",
                "-：数値の引き算を行う算術演算子",
                "AS：取得した列や計算結果に別名を付ける",
                "missing_quantity：今回の不足数を表す列名",
                "ORDER BY ... DESC：指定した値が大きい順（降順）に並べる"
            ]
        },
        expectedSql: "SELECT trade_id, quantity - received_quantity AS missing_quantity FROM Imports WHERE model_number = 'TECH-26' ORDER BY missing_quantity DESC;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "TECH-26の取引に絞り、「申告した数から実際の数を引いた残り（不足数）」を計算して、大きい順に並べます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "TECH-26に絞るWHERE条件、引き算の記号、計算結果に名前をつけるキーワード、そして大きい順に並べる指定を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT 表A.識別列, 表A.数値列 - 表A.数値列 AS 別名 FROM 表A → WHERE 表A.カラム = '値' → ORDER BY 別名 DESC の形で組み立てましょう。"
            }
        ],
        dialogue: "上司：TECH-26の取引に絞って数量の差を計算し、異常の規模を確認しよう。申告数量から受入数量を引いた差を missing_quantity として出してみてくれ。",
        group: "📦 第2章：一致しない数量",
        glossary: {
            title: "対象テーブル・カラム",
            html: `
- <span class='badge'>model_number</span> 製品の型番（TECH-26）<br>
- <span class='badge'>trade_id</span> 取引ID<br>
- <span class='badge'>quantity</span> 申告数量<br>
- <span class='badge'>received_quantity</span> 受入数量<br>
- <span class='badge'>missing_quantity</span> 計算した不足数の別名<br>
- <span class='badge'>ORDER BY ... DESC</span> 不足数が大きい順に並べる
            `
        }
    },
    {
        id: 8,
        title: "08. TECH-26の200個以上の数量不足を特定せよ",
        desc: "Imports テーブルから、型番（model_number）が「TECH-26」の取引のうち、実際の受入数量（received_quantity）が申告数量（quantity）を下回り、さらに申告数量と受入数量の差が200個以上ある記録をすべて取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "AND", "=", "<", ">=", "-", "()"],
        difficulty: 3,
        explanation: `【解説】
WHERE で TECH-26 に絞り、受入数量が申告数量より少ないことと、不足数が200個以上であることを AND でつなぎます。条件のまとまりは ( ) で囲みます。

・model_number = 'TECH-26'：TECH-26 の取引に絞る
・(received_quantity < quantity)：受入数量が申告数量より少ない
・(quantity - received_quantity >= 200)：不足数が200個以上

TECH-26 の中から、大きな数量のズレが起きている取引を特定しましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26で数量差が200個以上ある記録を抽出できたな。大きな不足が起きている取引を絞り込めた。",
            learned: [
                "AND：複数の条件をすべて満たすデータを取得する",
                "()：条件のまとまりを分かりやすくする",
                ">=：左側の値が右側の値以上であることを判定する",
                "-：2つの数値カラムの差を計算する",
                "WHERE：指定した条件に一致する記録を抽出する"
            ]
        },
        expectedSql: `SELECT *
FROM Imports
WHERE model_number = 'TECH-26'
  AND (received_quantity < quantity)
  AND (quantity - received_quantity >= 200);`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "まずTECH-26に絞り、「受入数が申告数より少ないこと」と「その差（引き算の結果）が200以上であること」の両方を満たす行を探します。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "型番で絞る条件、複数条件をつなぐキーワード、大小比較、引き算、条件を囲む丸括弧を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT * FROM 表A → WHERE 表A.カラム = '値' AND (条件A) AND (表A.数値列 - 表A.数値列 >= 数値) の形で、条件をANDと丸括弧で組み立てましょう。"
            }
        ],
        dialogue: "上司：TECH-26の中から数量の差が200個以上ある大きな異常を絞り込んでみよう。不審な記録を一覧にして確認するんだ。",
        group: "📦 第2章：一致しない数量",
        glossary: {
            title: "今回使う構文・カラム",
            html: `
- <span class='badge'>model_number</span> 製品の型番（TECH-26）<br>
- <span class='badge'>quantity</span> 書類上の申告数量<br>
- <span class='badge'>received_quantity</span> 実際の受入数量<br>
- <span class='badge'>AND</span> 複数の条件をすべて満たす<br>
- <span class='badge'>( )</span> 条件のまとまりを表す<br>
- <span class='badge'>>=</span> 200以上であることを判定する
            `
        }
    },

    // ==========================================
    // 第3章：疑わしい会社の集計（09〜13）
    // ==========================================
    {
        id: 9,
        title: "09. 会社IDごとの取引件数を集計せよ",
        desc: "Imports テーブルから、会社ID（company_id）ごとにグループ化し、会社IDと各会社の取引件数（別名：trade_count）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
第2章で見えた数量のズレが特定の会社に偏っていないか確かめるため、まずは会社IDごとの取引件数を集計します。

・GROUP BY company_id：会社IDごとにグループ化する
・COUNT(*) AS trade_count：会社ごとの取引件数を trade_count という名前で出す

取引件数が極端に多い会社や少ない会社がないか確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：会社IDごとの取引件数を集計できたな。",
            learned: [
                "GROUP BY 列名：指定した列の値ごとにグループ化する",
                "COUNT(*)：各グループの行数を数える",
                "AS 別名：集計結果に別名を付ける"
            ]
        },
        expectedSql: "SELECT company_id, COUNT(*) AS trade_count FROM Imports GROUP BY company_id;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "バラバラの取引行を「会社IDごと」に山分けして、それぞれの山に何件の行が入っているか数えます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "同じ値ごとにグループを作る命令と、行数を数える集計関数、そして結果の列に別名をつけるキーワードを使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT 表A.グループ列, COUNT(*) AS 別名 FROM 表A → GROUP BY 表A.グループ列 の形で組み立てましょう。"
            }
        ],
        dialogue: "上司：数量のズレや不自然な申告額は、特定の会社に集中しているのかもしれない。まずは Imports で会社IDごとの取引件数を集計してみよう。",
        group: "🏢 第3章：疑わしい会社の集計",
        glossary: {
            title: "対象カラム・関数の意味",
            html: `
- <span class='badge'>Imports</span> 輸入・取引記録<br>
- <span class='badge'>company_id</span> 会社ID（グループ化の基準）<br>
- <span class='badge'>COUNT(*)</span> 各グループの件数を数える関数
            `
        }
    },
    {
        id: 10,
        title: "10. TECH-26 を扱う業者番号を重複なく一覧化せよ",
        desc: "Imports テーブルから、型番（model_number）が 'TECH-26' の取引に関わっている会社ID（company_id）を重複を除いて取得せよ。",
        concept: ["SELECT", "DISTINCT", "WHERE"],
        difficulty: 2,
        orderSensitive: false,
        explanation: `【解説】
DISTINCT を使うと、TECH-26 の取引が複数回ある会社でも company_id を重複なく1回ずつ一覧にできます。

・SELECT DISTINCT company_id：重複を除いた会社IDを出す
・WHERE model_number = 'TECH-26'：型番が TECH-26 の取引に絞る

まずは関わる業者番号を重複なく押さえたうえで、このあと会社ごとの金額や数量の計算に進んでいきましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26 を扱っている業者番号を重複なく出せたな。対象となる業者の顔ぶれが見えたところで、次は各社の金額を計算して比べてみよう。",
            learned: [
                "DISTINCT：取得結果から重複する行を取り除く",
                "WHERE との併用：特定条件に合う行に絞ったうえで、重複のない一覧を作れる"
            ]
        },
        expectedSql: "SELECT DISTINCT company_id FROM Imports WHERE model_number = 'TECH-26';",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "TECH-26 の取引がある会社IDを一覧にしますが、同じ会社IDが何回も並ばないよう重複を省きます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "重複をなくすキーワードと、型番で絞り込む条件を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT DISTINCT 表A.カラム FROM 表A → WHERE 表A.カラム = '値' の形で、重複を除く指定と条件を組み合わせましょう。"
            }
        ],
        dialogue: "上司：まずはこの型番（TECH-26）を扱っている業者番号を重複なく一覧にしてくれ。そのあとで各社の金額を計算していくぞ。",
        group: "🏢 第3章：疑わしい会社の集計",
        glossary: {
            title: "対象カラム・句の意味",
            html: `
- <span class='badge'>DISTINCT</span> 重複する行を取り除いて表示する<br>
- <span class='badge'>company_id</span> 業者番号（会社ID）<br>
- <span class='badge'>model_number = 'TECH-26'</span> 絞り込む製品の型番
            `
        }
    },
   {
        id: 11,
        title: "11. TECH-26 の会社ごとの最高・最低申告額を比較せよ",
        desc: "Imports テーブルから、型番（model_number）が 'TECH-26' の取引を対象に、会社ID（company_id）ごとの最高申告額（別名：max_value）と最低申告額（別名：min_value）を取得せよ。",
        concept: ["WHERE", "MAX", "MIN", "GROUP BY"],
        difficulty: 2,
        orderSensitive: false,
        explanation: `【解説】
TECH-26 の取引に絞り、まずは会社ごとの申告額の幅（最高額と最低額の差）を把握します。

・WHERE model_number = 'TECH-26'：型番が TECH-26 の取引に絞る
・MAX(declared_value) AS max_value：会社ごとの最高申告額を求める
・MIN(declared_value) AS min_value：会社ごとの最低申告額を求める
・GROUP BY company_id：会社IDごとにまとめる

極端に安い・高い取引が混ざっている会社がないか、振れ幅を確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26 の会社ごとの最高申告額と最低申告額を確認できたな。幅の大きさが分かったところで、次はならした水準（平均）を見てみよう。",
            learned: [
                "MAX(列名)：グループ内の最大値を求める",
                "MIN(列名)：グループ内の最小値を求める",
                "WHERE と GROUP BY の併用：特定の型番に絞ったうえで会社ごとの幅を比べられる"
            ]
        },
        expectedSql: "SELECT company_id, MAX(declared_value) AS max_value, MIN(declared_value) AS min_value FROM Imports WHERE model_number = 'TECH-26' GROUP BY company_id;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "TECH-26 の取引に絞ったうえで、会社ごとに「一番高い申告額」と「一番安い申告額」を並べて金額の幅を確かめます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "型番で絞る条件と、最大値を求める関数・最小値を求める関数・グループ化の指定を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT 表A.グループ列, MAX(表A.数値列) AS 別名, MIN(表A.数値列) AS 別名 FROM 表A → WHERE 表A.カラム = '値' → GROUP BY 表A.グループ列 の形で組み立てましょう。"
            }
        ],
        dialogue: "上司：さっき出た業者たちの TECH-26 について、まずは会社ごとの申告額の最高値と最低値を出し、金額の幅を確認しよう。",
        group: "🏢 第3章：疑わしい会社の集計",
        glossary: {
            title: "対象カラム・関数の意味",
            html: `
- <span class='badge'>model_number = 'TECH-26'</span> 絞り込む製品の型番<br>
- <span class='badge'>MAX()</span> グループ内の最大値を求める関数<br>
- <span class='badge'>MIN()</span> グループ内の最小値を求める関数
            `
        }
    },
    {
        id: 12,
        title: "12. TECH-26 の会社ごとの1個あたり申告額の平均を求めよ",
        desc: "Imports テーブルから、型番（model_number）が 'TECH-26' の取引を対象に、会社ID（company_id）ごとの1個あたり申告額（申告額 declared_value ÷ 申告数量 quantity）の平均を小数点以下で四捨五入した値（別名：avg_unit_value）を取得せよ。",
        concept: ["WHERE", "/", "AVG", "ROUND", "GROUP BY"],
        difficulty: 2,
        orderSensitive: false,
        explanation: `【解説】
TECH-26 の取引に絞り、取引ごとの数量差に左右されない「1個あたりの申告額」を出したうえで、会社ごとの平均水準を比べます。

・declared_value * 1.0 / quantity：1個あたりの申告額を計算する（* 1.0 で割り算の途中切り捨てを防ぐ）
・ROUND(AVG(...), 0) AS avg_unit_value：会社ごとの平均を計算し、小数点以下を四捨五入して整数に丸める
・WHERE model_number = 'TECH-26' AND GROUP BY company_id：TECH-26 に絞り、会社IDごとにまとめる

最高・最低の幅とあわせて、ならしたときの単価水準も押さえておきましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26 の会社ごとの1個あたり申告額の平均を確認できたな。幅だけでなく、ならした単価水準の違いも見えてきたぞ。",
            learned: [
                "/（割り算）：申告額を申告数量で割り、1個あたりの金額を求める",
                "AVG(列名) / ROUND(数値, 0)：平均を出し、小数点以下を四捨五入して整数に丸める",
                "WHERE と GROUP BY の併用：対象条件に絞ったうえでグループごとの平均を計算できる"
            ]
        },
        expectedSql: "SELECT company_id, ROUND(AVG(declared_value * 1.0 / quantity), 0) AS avg_unit_value FROM Imports WHERE model_number = 'TECH-26' GROUP BY company_id;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "TECH-26 の取引に絞ったうえで、まず「1個あたりの申告額（申告額÷申告数量）」を求め、その会社ごとの平均を四捨五入して整数にします。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "型番で絞る条件と、割り算（/）、平均を求める関数（AVG）、小数点を丸める関数（ROUND）、グループ化（GROUP BY）を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT 表A.グループ列, ROUND(AVG(表A.数値列 * 1.0 / 表A.数値列), 桁数) AS 別名 FROM 表A → WHERE 表A.カラム = '値' → GROUP BY 表A.グループ列 の形で組み立てましょう。"
            }
        ],
        dialogue: "上司：幅が見えたところで、今度は取引件数や個数の差に左右されないよう、会社ごとの1個あたり申告額の平均を出して単価水準を確かめよう。",
        group: "🏢 第3章：疑わしい会社の集計",
        glossary: {
            title: "対象カラム・演算子・関数の意味",
            html: `
- <span class='badge'>declared_value / quantity</span> 1個あたりの申告額（申告額 ÷ 申告数量）<br>
- <span class='badge'>AVG(...)</span> 会社ごとの平均値<br>
- <span class='badge'>ROUND(..., 0)</span> 小数点以下を四捨五入して整数に丸める
            `
        }
    },
    {
        id: 13,
        title: "13. TECH-26 の会社ごとの申告数量合計を集計せよ",
        desc: "Imports テーブルから、型番（model_number）が 'TECH-26' の取引を対象に、会社ID（company_id）ごとの申告数量（quantity）の合計（別名：tech26_total_qty）を取得せよ。",
        concept: ["WHERE", "SUM", "GROUP BY"],
        difficulty: 2,
        orderSensitive: false,
        explanation: `【解説】
TECH-26 の取引に絞り、どの会社IDでどれくらいの数量が動いているか合計を出します。

・WHERE model_number = 'TECH-26'：型番が TECH-26 の取引に絞る
・SUM(quantity) AS tech26_total_qty：会社ごとの申告数量の合計を求める
・GROUP BY company_id：会社IDごとにまとめる

TECH-26 の数量規模を押さえたうえで、会社IDだけでは会社名までは分からないため、次のステップで他の表とつないで詳しく調べていきます。`,
        clearFeedback: {
            dialogue: "上司：TECH-26 の会社ごとの申告数量の合計を出せたな。会社IDだけでは会社名までは分からないから、次は他の表とつないで確かめよう。",
            learned: [
                "WHERE と SUM・GROUP BY の併用：特定の型番に絞ったうえで会社ごとに合計を計算できる",
                "SUM(列名)：グループごとの数値を合計する"
            ]
        },
        expectedSql: "SELECT company_id, SUM(quantity) AS tech26_total_qty FROM Imports WHERE model_number = 'TECH-26' GROUP BY company_id;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "「型番が TECH-26 の取引」だけに絞ったあと、会社IDごとに申告数量を合計します。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "型番で絞る条件と、合計を求める関数・グループ化の指定を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT 表A.グループ列, SUM(表A.数値列) AS 別名 FROM 表A → WHERE 表A.カラム = '値' → GROUP BY 表A.グループ列 の形で組み立てましょう。"
            }
        ],
        dialogue: "上司：TECH-26 の取引に絞って、会社IDごとの申告数量の合計を出してくれ。IDが分かったら、次は他の表と結びつけていくぞ。",
        group: "🏢 第3章：疑わしい会社の集計",
        glossary: {
            title: "対象カラム・句の意味",
            html: `
- <span class='badge'>model_number = 'TECH-26'</span> 絞り込む製品の型番<br>
- <span class='badge'>SUM(quantity) AS tech26_total_qty</span> 会社ごとの申告数量の合計<br>
- <span class='badge'>GROUP BY company_id</span> 会社IDごとに集計する
            `
        }
    },
    // ==========================================
    // 第4章：つながる記録、浮かび上がる疑惑（14〜17）
    // ==========================================
    {
        id: 14,
        title: "14. TECH-26の会社情報と輸入記録を JOIN せよ",
        desc: "型番（model_number）が「TECH-26」の取引に絞り、Imports と Companies を company_id で JOIN して、取引ID（trade_id）・会社名（company_name）・型番（Imports.model_number）を取得せよ。",
        prologue: "押収した資料を調べると、輸入記録には会社ID、会社マスターには会社名や所在地が別々に保存されている。記録を単独で見るだけでは、取引を行った企業の実態までは分からない。共通するIDを手がかりに複数の表を照合し、断片的な情報を一つの証拠としてつなげよう。",
        orderSensitive: false,
        explanation: `【解説】
まずはTECH-26の取引に絞ったうえで、2つの表を共通のID（company_id）で横につなぐ基本の JOIN から始めましょう。

・JOIN Companies：会社情報をつなぐ表を指定する（INNER JOIN と同じ意味です）
・ON Imports.company_id = Companies.company_id：同じ company_id の行どうしを合わせる目印
・WHERE Imports.model_number = 'TECH-26'：TECH-26の取引に絞る`,
        clearFeedback: {
            dialogue: "上司：TECH-26の輸入記録を会社マスターとつないで、取引ごとの会社名と型番を確認できたな。",
            learned: [
                "JOIN 〜 ON 〜：共通のIDが一致する行どうしを横につなぐ基本の書き方（INNER JOIN と同じ）",
                "WHERE Imports.model_number = 'TECH-26'：対象の型番に絞り込む",
                "SELECT Imports.model_number：絞り込みに使った型番も結果に表示する",
                "テーブル名.列名：どの表の列かをはっきりさせる書き方"
            ]
        },
        expectedSql: `SELECT
    Imports.trade_id,
    Companies.company_name,
    Imports.model_number
FROM Imports
JOIN Companies
    ON Imports.company_id = Companies.company_id
WHERE Imports.model_number = 'TECH-26';`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "TECH-26の取引に絞り、会社名を知るために会社マスターをつなぎます。取引ID・会社名・型番を表示しましょう。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "WHEREで型番を絞る条件に加えて、別の表をつなぐキーワードと、どの列同士が一致するかを教える条件指定を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → JOIN 表B ON 表A.共通キー = 表B.共通キー → WHERE 表A.カラム = '値' の順で組み立てましょう。"
            }
        ],
        dialogue: "上司：TECH-26の取引がどの会社のものか、型番も表示しながらImports と Companies を JOIN して確かめよう。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "会社情報と輸入記録をつなぐ項目",
            html: `
- <span class='badge'>Companies</span> 会社マスター（company_name）<br>
- <span class='badge'>Imports</span> 輸入・取引記録（trade_id）<br>
- <span class='badge'>Imports.model_number</span> 型番（TECH-26に絞り込み、結果にも表示）<br>
- <span class='badge'>company_id</span> 2つの表をつなぐ共通の会社ID
            `
        }
    },
    {
        id: 15,
        title: "15. TECH-26の輸入記録とコンテナ保管記録を JOIN せよ",
        desc: "型番（model_number）が「TECH-26」の取引に絞り、Imports と Containers を trade_id で JOIN して、取引ID（trade_id）・コンテナ番号（container_number）・型番（Imports.model_number）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
14番に続いて、TECH-26の取引に絞ったうえで Imports と Containers を共通の trade_id でつなぎます。

・JOIN Containers ON Imports.trade_id = Containers.trade_id：同じ取引IDの行どうしを合わせる
・WHERE Imports.model_number = 'TECH-26'：TECH-26の取引に絞る
・取引とコンテナの対応関係をたどれるようにする`,
        clearFeedback: {
            dialogue: "上司：TECH-26の輸入記録とコンテナ保管記録をつなげて、取引・コンテナ・型番を確認できたな。",
            learned: [
                "JOIN 〜 ON 〜：別の表とも共通ID（trade_id）で横につなげる",
                "WHERE Imports.model_number = 'TECH-26'：対象の型番に絞り込む",
                "SELECT Imports.model_number：絞り込みに使った型番も結果に表示する",
                "つなぐ相手が変わっても、JOIN と ON の形は同じ"
            ]
        },
        expectedSql: `SELECT
    Imports.trade_id,
    Containers.container_number,
    Imports.model_number
FROM Imports
JOIN Containers
    ON Imports.trade_id = Containers.trade_id
WHERE Imports.model_number = 'TECH-26';`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "TECH-26に絞り、コンテナ保管記録を結びつけて、取引ID・コンテナ番号・型番を表示しましょう。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "WHEREで型番を絞る条件に加えて、表をつなぐ結合キーワードと取引IDを一致させる条件を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → JOIN 表B ON 表A.共通キー = 表B.共通キー → WHERE 表A.カラム = '値' の順で組み立てましょう。"
            }
        ],
        dialogue: "上司：TECH-26の貨物がどのコンテナに入っているか、型番も表示してImports と Containers をtrade_idでつないで確かめよう。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "輸入記録とコンテナ保管記録をつなぐ項目",
            html: `
- <span class='badge'>Imports</span> 輸入・取引記録（trade_id）<br>
- <span class='badge'>Containers</span> コンテナ保管記録（container_number）<br>
- <span class='badge'>Imports.model_number</span> 型番（TECH-26に絞り込み、結果にも表示）<br>
- <span class='badge'>trade_id</span> 2つの表をつなぐ共通の取引ID
            `
        }
    },
    {
        id: 16,
        title: "16. LEFT JOINでTECH-26の受入数量未記録取引を照合せよ",
        desc: "型番（model_number）が「TECH-26」で、受入数量（received_quantity）がNULLの取引を対象に、Importsを左側にしてContainersをtrade_idでLEFT JOINし、取引ID（trade_id）・コンテナ番号（container_number）・型番（Imports.model_number）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
15番のINNER JOINと比べ、Importsを左側にしてLEFT JOINします。Containers側に一致する記録がなくてもImportsの行は残ります。

・LEFT JOIN Containers ON Imports.trade_id = Containers.trade_id：左側のImportsをすべて残して保管情報をつなぐ
・WHERE Imports.model_number = 'TECH-26'：TECH-26の取引に絞る
・AND Imports.received_quantity IS NULL：その中から受入数量が空の行を選ぶ

この問題のNULLはImports.received_quantityに記録されたNULLです。LEFT JOINで生じるContainers側のNULLとは区別して考えましょう。`,
        clearFeedback: {
            dialogue: "上司：TECH-26のうち受入数量が未記録の取引を、型番とコンテナ番号も含めて確認できたな。",
            learned: [
                "LEFT JOIN と WHERE の組み合わせ：Importsを残したまま条件に合う行を抽出できる",
                "AND：型番と受入数量の両方の条件を満たす行を選ぶ",
                "SELECT Imports.model_number：絞り込みに使った型番も結果に表示する",
                "IS NULL：値が記録されていない行を絞り込む"
            ]
        },
        expectedSql: `SELECT
    Imports.trade_id,
    Containers.container_number,
    Imports.model_number
FROM Imports
LEFT JOIN Containers
    ON Imports.trade_id = Containers.trade_id
WHERE Imports.model_number = 'TECH-26'
  AND Imports.received_quantity IS NULL;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "15番と同じくTECH-26に絞り、LEFT JOINで受入数量の記録が空になっている行を抽出します。型番も結果に含めましょう。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "LEFT JOINでImportsの行を残し、WHEREで型番を絞ったあと、ANDとIS NULLで受入数量が未記録の取引に絞ります。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → LEFT JOIN 表B ON 表A.共通キー = 表B.共通キー → WHERE 表A.カラム = '値' AND 表A.カラム IS NULL の順で組み立てましょう。"
            }
        ],
        dialogue: "上司：TECH-26で受入数量が NULL の取引があるな。どのコンテナにあるか、絞り込んで確かめよう。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "未記録の受入数量とコンテナを絞り込む項目",
            html: `
- <span class='badge'>Imports.received_quantity</span> 受入数量<br>
- <span class='badge'>Imports.model_number</span> 型番（TECH-26に絞り込み、結果にも表示）<br>
- <span class='badge'>IS NULL</span> 値が記録されていない状態<br>
- <span class='badge'>Containers.container_number</span> コンテナ番号
            `
        }
    },
    {
        id: 17,
        title: "17. TECH-26の未記録取引を3テーブルの JOIN で照合せよ",
        desc: "Imports・Companies・Containers の3テーブルを JOIN し、型番（model_number）が「TECH-26」で受入数量（received_quantity）が NULL の取引について、会社名（company_name）・取引ID（trade_id）・型番（Imports.model_number）・コンテナ番号（container_number）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
16番の2テーブル結合に Companies を加え、3つの表をそれぞれの共通IDでつなぎます。Importsから取引IDと型番、Companiesから会社名、Containersからコンテナ番号を取り出します。

・JOIN Companies ON Imports.company_id = Companies.company_id：会社IDで会社名をつなぐ
・JOIN Containers ON Imports.trade_id = Containers.trade_id：取引IDでコンテナ番号をつなぐ
・WHERE Imports.model_number = 'TECH-26'：TECH-26の取引に絞る
・AND Imports.received_quantity IS NULL：その中から受入数量が未記録の行に絞る

受入数量が未記録の荷物が「どのコンテナにあり」「どこの会社に紐づくか」まで一気に照合できます。`,
        clearFeedback: {
            dialogue: "上司：TECH-26で受入数量が未記録の取引について、会社・型番・コンテナまで照合できたな。",
            learned: [
                "3テーブルの JOIN：つなぐ相手ごとに正しい共通ID（company_id / trade_id）を指定する",
                "複数結合＋WHERE・AND：複数の表をまとめて複数の条件で絞り込める",
                "SELECT Imports.model_number：絞り込みに使った型番も結果に表示する"
            ]
        },
        expectedSql: `SELECT
    Companies.company_name,
    Imports.trade_id,
    Imports.model_number,
    Containers.container_number
FROM Imports
JOIN Companies
    ON Imports.company_id = Companies.company_id
JOIN Containers
    ON Imports.trade_id = Containers.trade_id
WHERE Imports.model_number = 'TECH-26'
  AND Imports.received_quantity IS NULL;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "16番と同じくTECH-26かつ受入数量が未記録の取引に絞り、会社名と型番も含めて結果にまとめます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "結合を2回続けて3つの表をつなぎ、型番と受入数量の条件をANDで組み合わせます。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → JOIN 表B ON 表A.共通キー = 表B.共通キー → JOIN 表C ON 表A.共通キー = 表C.共通キー → WHERE 表A.カラム = '値' AND 表A.カラム IS NULL の順で組み立てましょう。"
            }
        ],
        dialogue: "上司：TECH-26で受入数量が未記録の荷物がどこの会社の取引なのか、型番も含めて3つの表で照合しよう。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "3テーブル照合に使う項目とキー",
            html: `
- <span class='badge'>Companies.company_name</span> 会社名（company_id で結合）<br>
- <span class='badge'>Imports.trade_id</span> 取引ID<br>
- <span class='badge'>Imports.model_number</span> 型番（TECH-26に絞り込み、結果にも表示）<br>
- <span class='badge'>Containers.container_number</span> コンテナ番号（trade_id で結合）
            `
        }
    },

    // ==========================================
    // 第5章：USB容量の分類（18〜19）
    // ==========================================
    {
        id: 18,
        title: "18. USB容量の検査結果を3段階に分類せよ",
        desc: "Imports テーブルから、取引ID（trade_id）・広告容量（advertised_capacity）・実容量（actual_capacity）と、実容量が広告容量より少ないなら '容量不足'、同じなら '正常'、それ以外は '超過' とする分類列（別名：capacity_status）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
CASE WHEN を使うと、条件ごとにラベルを分けて新しい列を作れます。

・WHEN actual_capacity < advertised_capacity THEN '容量不足'
・WHEN actual_capacity = advertised_capacity THEN '正常'
・ELSE '超過'
・END AS capacity_status

上から順に条件をチェックし、当てはまったラベルが capacity_status に入ります。`,
        clearFeedback: {
            dialogue: "上司：USB容量の検査結果を3段階に分類できたな。",
            learned: [
                "CASE WHEN 〜 THEN 〜 ELSE 〜 END：条件ごとに異なる値を返す分岐構文",
                "AS capacity_status：分類結果の列に別名を付ける"
            ]
        },
        expectedSql: `SELECT
    trade_id,
    advertised_capacity,
    actual_capacity,
    CASE
        WHEN actual_capacity < advertised_capacity THEN '容量不足'
        WHEN actual_capacity = advertised_capacity THEN '正常'
        ELSE '超過'
    END AS capacity_status
FROM Imports;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "元のデータにはない「判定ラベルの列」を、実容量と広告容量の比べ方によって新しく作り出します。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "条件分岐を作る構文を使います。「もし〜なら」のあとに「そうだったらこの値」を書き、どれにも当てはまらないときの扱いと、ひとまとまりの終わり＋別名をつけます。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT 表A.識別列, CASE WHEN 条件A THEN '結果A' WHEN 条件B THEN '結果B' ELSE 'その他' END AS 別名 FROM 表A の形で、分類列を組み立てましょう。"
            }
        ],
        dialogue: "上司：次はUSB容量の検査記録を見てみよう。実容量と広告容量を比べて、3段階に分類してみてくれ。",
        group: "💾 第5章：USB容量の分類",
        glossary: {
            title: "USB容量分類の項目",
            html: `
- <span class='badge'>advertised_capacity</span> 広告・表示上の容量<br>
- <span class='badge'>actual_capacity</span> 実際の測定容量<br>
- <span class='badge'>CASE WHEN ... END</span> 条件分岐で分類を作る構文
            `
        }
    },
    {
        id: 19,
        title: "19. 特定取引IDのUSB容量を確認",
        desc: "Imports テーブルから、取引ID（trade_id）が 'T008' の記録について、取引ID（trade_id）・広告容量（advertised_capacity）・実容量（actual_capacity）と、18番と同じ3段階分類（別名：capacity_status）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
17番で見つかった受入数量未記録の取引（T008）について、USB容量に問題がないか確認します。

・WHERE trade_id = 'T008'：対象の取引IDに絞り込む
・CASE WHEN ... END AS capacity_status：容量の状態を確認する

容量に異常がなければ、受入数量の未記録は容量ごまかしではなく登録漏れの可能性が高いと判断できます。`,
        clearFeedback: {
            dialogue: "上司：T008 のUSB容量を確認できたな。容量に問題がないなら、受入数量の未記録は容量ごまかしではなく登録漏れの可能性が高そうだ。別の怪しい取引を絞り込もう。",
            learned: [
                "WHERE と CASE WHEN の併用：特定の対象に絞ったうえで条件分類を行える",
                "異常の切り分け：記録の欠落が容量異常と結びつくか確認できる"
            ]
        },
        expectedSql: `SELECT
    trade_id,
    advertised_capacity,
    actual_capacity,
    CASE
        WHEN actual_capacity < advertised_capacity THEN '容量不足'
        WHEN actual_capacity = advertised_capacity THEN '正常'
        ELSE '超過'
    END AS capacity_status
FROM Imports
WHERE trade_id = 'T008';`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "18番で作った3段階の分類表示を、すべての取引ではなく「特定の1件の取引ID」だけに絞って確認します。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "3段階分類の仕組みと、特定のIDに一致する行だけを選ぶ条件指定を合わせます。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "SELECT 表A.識別列, CASE WHEN 条件A THEN '結果A' ELSE 'その他' END AS 別名 FROM 表A → WHERE 表A.識別列 = '値' の形で、対象を絞りましょう。"
            }
        ],
        dialogue: "上司：さっき受入数量が未記録だった T008 だが、USB容量のほうはどうなっている？確認して切り分けよう。",
        group: "💾 第5章：USB容量の分類",
        glossary: {
            title: "T008 切り分けの確認項目",
            html: `
- <span class='badge'>trade_id = 'T008'</span> 受入数量が未記録の対象取引<br>
- <span class='badge'>capacity_status</span> 容量の分類結果
            `
        }
    },

    // ==========================================
    // 第6章：異常の切り分けとコンテナの特定（20〜24）
    // ==========================================
    {
        id: 20,
        title: "20. 重量異常と容量不足の候補をまとめて抽出せよ",
        desc: "Imports から、TECH-26で数量不足かつ重量超過の取引、または広告容量より実容量が小さい取引を抽出せよ。",
        orderSensitive: false,
        explanation: `【解説】
        まずは2種類の異常候補を OR でまとめて洗い出します。

        ・数量不足かつ重量超過：受入数量が申告数量より少ないのに実重量が重い
        ・容量不足：実容量が広告容量より小さい
        ・OR：どちらかの異常条件を満たす行を抽出する

        この段階では候補を広く拾います。次の問題で2つの切り口を別々に確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：重量の異常とUSB容量不足、2種類の候補が見つかった。別々に確かめてから最終照合しよう。",
            learned: ["OR：どちらかの条件を満たす行を選ぶ", "AND：同じ切り口の複数条件をすべて満たす行を選ぶ"]
        },
        expectedSql: `SELECT trade_id, model_number, quantity, received_quantity, declared_weight_kg, actual_weight_kg, advertised_capacity, actual_capacity
FROM Imports
WHERE (model_number = 'TECH-26' AND received_quantity < quantity AND actual_weight_kg > declared_weight_kg)
   OR (model_number = 'TECH-26' AND actual_capacity < advertised_capacity);`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "「TECH-26で、数が減っているのに重くなっているグループ」と「TECH-26で、容量が足りないグループ」のどちらかに当てはまるものを広く集めます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "同じグループ内で複数条件をまとめるつなぎ方と、2つのグループを合わせるつなぎ方、そして大小比較の記号・丸括弧を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → WHERE (必須条件 AND 条件A AND 条件B) OR (必須条件 AND 条件C) の形で、条件のまとまりを丸括弧に入れて組み立てましょう。"
            }
        ],
        dialogue: "上司：まずはTECH-26の中から、数量と重量に不自然な差がある取引、またはUSB容量が不足している取引を拾おう。",
        group: "🎯 最終章：異常の切り分けとコンテナ特定",
        glossary: {
            title: "2種類の異常候補を探すカラム",
            html: `
- <span class='badge'>received_quantity / quantity</span> 受入数量と申告数量<br>
- <span class='badge'>actual_weight_kg / declared_weight_kg</span> 実重量と申告重量<br>
- <span class='badge'>actual_capacity / advertised_capacity</span> 実容量と広告容量<br>
- <span class='badge'>OR</span> いずれかの異常条件を満たす行を取得する
            `
        }
    },
    {
        id: 21,
        title: "21. 必須条件と選択条件を分け、数量・重量の異常を特定せよ",
        desc: "Imports から、型番が TECH-26 かつ受入数量が NULL でない取引のうち、（受入数量が申告数量より少なく実重量が申告重量より重い、または実重量が申告重量の1.2倍より重い）取引（trade_id, company_id, quantity, received_quantity, declared_weight_kg, actual_weight_kg）を特定せよ。",
        orderSensitive: false,
        explanation: `【解説】
まずは基本の「必須条件は外、選択条件（OR）は () で囲む」形で数量・重量の異常を探ります。T008 のような受入数量未記録（NULL）を除外するため、received_quantity IS NOT NULL を必須条件に入れています。

・必須条件（外に出す）：model_number = 'TECH-26' かつ received_quantity IS NOT NULL
・選択条件（() で囲む）：((received_quantity < quantity AND actual_weight_kg > declared_weight_kg) OR actual_weight_kg > declared_weight_kg * 1.2)

まずは外枠と OR カッコの基本形に慣れましょう。`,
        clearFeedback: {
            dialogue: "上司：T008 のような未記録行を除きつつ、数量・重量の異常取引を絞り込めたな。会社ID C004（アオバ・マイクロ）が絡んでいるぞ。",
            learned: [
                "必須条件と選択条件の分離：必須条件は () の外に出し、OR 群だけを () で囲む",
                "IS NOT NULL：未記録（NULL）のデータをあらかじめ除外する"
            ]
        },
        expectedSql: `SELECT trade_id, company_id, quantity, received_quantity, declared_weight_kg, actual_weight_kg
FROM Imports
WHERE model_number = 'TECH-26'
  AND received_quantity IS NOT NULL
  AND (
        (received_quantity < quantity AND actual_weight_kg > declared_weight_kg)
        OR actual_weight_kg > declared_weight_kg * 1.2
  );`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "「TECH-26」かつ「受入数量が NULL でない」を必須条件として外に出し、重量や数量のズレに関する2つの条件を OR でまとめて絞り込みます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "IS NOT NULL、AND、そして OR の選択肢全体を囲む丸括弧 () を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → WHERE 表A.カラム = '値' AND 表A.カラム IS NOT NULL AND ((条件A AND 条件B) OR 条件C) の形で組み立てましょう。"
            }
        ],
        dialogue: "上司：まずは数量・重量の異常からだ。未記録（NULL）を弾きつつ、必須条件は外、選択条件は () で囲む基本形で絞り込んでくれ。",
        group: "🎯 最終章：異常の切り分けとコンテナ特定",
        glossary: {
            title: "数量・重量異常の確認項目",
            html: `
- <span class='badge'>IS NOT NULL</span> 受入数量が記録済みの行に絞る<br>
- <span class='badge'>必須条件</span> model_number = 'TECH-26' と IS NOT NULL は () の外<br>
- <span class='badge'>選択条件 ()</span> OR 群全体を () で囲む
            `
        }
    },
    {
        id: 22,
        title: "22. 入れ子のカッコを使い、USB容量・仕様の異常を特定せよ",
        desc: "Imports から、型番が TECH-26 であり、かつ（実容量が広告容量より小さい、または広告容量が 256 以上かつ実容量が 64 以下）の取引（trade_id, company_id, advertised_capacity, actual_capacity）を特定せよ。",
        orderSensitive: false,
        explanation: `【解説】
21番より少し踏み込み、OR でつなぐ選択条件の中に AND の塊を () で入れ子にして絞り込みます。

・必須条件（外に出す）：model_number = 'TECH-26'
・選択条件（() で囲む）：(actual_capacity < advertised_capacity OR (advertised_capacity >= 256 AND actual_capacity <= 64))

外側の () で OR 全体くくり、内側の () で AND の塊を分けることで、複雑な条件も読みやすく正確に書けます。`,
        clearFeedback: {
            dialogue: "上司：容量不足の取引はT014とT015だ。こちらも会社ID C004（アオバ・マイクロ）の取引ばかりだな。21番とあわせて、この会社をサブクエリで絞り込んでみよう。",
            learned: [
                "() の入れ子：OR 全体を囲む () の中に、AND でまとめた条件の塊を () で入れられる",
                "段階的な条件設計：単純な比較と複合条件を OR でつなぐ"
            ]
        },
        expectedSql: `SELECT trade_id, company_id, advertised_capacity, actual_capacity
FROM Imports
WHERE model_number = 'TECH-26'
  AND (
        actual_capacity < advertised_capacity
        OR (advertised_capacity >= 256 AND actual_capacity <= 64)
  );`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "今回も「TECH-26」を必須条件として外に出し、容量不足に関する条件と「大容量表示なのに実容量が小さい」条件を OR でまとめます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "OR 群全体を囲む丸括弧 () と、その中の AND 条件をまとめる丸括弧 () 、AND / OR を使います。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → WHERE 表A.カラム = '値' AND (条件A OR (条件B AND 条件C)) の形で、ORとANDを丸括弧で整理しましょう。"
            }
        ],
        dialogue: "上司：次はUSB容量の異常だ。21番より少し条件が複雑になるが、カッコの入れ子を使って TECH-26 の容量偽装を絞り込んでくれ。",
        group: "🎯 最終章：異常の切り分けとコンテナ特定",
        glossary: {
            title: "容量異常の確認項目と入れ子カッコ",
            html: `
- <span class='badge'>advertised_capacity</span> 広告・表示上の容量（GB）<br>
- <span class='badge'>actual_capacity</span> 実際に測定した容量（GB）<br>
- <span class='badge'>入れ子 ()</span> OR 全体を囲む () の中に AND の塊を () で入れる
            `
        }
    },
    {
        id: 23,
        title: "23. サブクエリで対象会社を絞り込み、2つの異常を統合せよ",
        desc: "Companiesへのサブクエリでアオバ・マイクロのIDを取得して絞り込み、TECH-26の取引の中から（数量不足かつ重量超過）または（実容量が広告容量より小さい）に当てはまる取引ID（trade_id）を特定せよ。",
        orderSensitive: false,
        explanation: `【解説】
サブクエリ（副問い合わせ）とは、SQL文の中に () で囲んで書く、もうひとつの SELECT 文のことです。外側の SELECT の条件や計算などで使う値を、先に別の SELECT で取り出して渡したいときに使います。

今回の捜査では、アオバ・マイクロの会社IDを外側の条件で使うために、() の中の SELECT で会社IDを取り出します。

・動きの順番：まず () の中の SELECT が先に実行され、取り出された値が外側の WHERE に渡されます
・必須条件（外に出す）：company_id = (サブクエリ) かつ model_number = 'TECH-26'
・選択条件（() で囲む）：(received_quantity < quantity AND actual_weight_kg > declared_weight_kg) OR actual_capacity < advertised_capacity

まずは「条件に使う値を取り出す SELECT」を思い浮かべてから、外側の取引絞り込みとつなげてみましょう。
参考記事： https://techplay.jp/column/1841`,
        clearFeedback: {
            dialogue: "上司：サブクエリでアオバ・マイクロに絞り込み、必須条件と選択条件を正しく組み合わせて対象取引IDを確定できたな。初めてのサブクエリ、よくやったぞ。最後はコンテナ記録と照合しよう。",
            learned: [
                "サブクエリ：SQL文の中に () で囲んで書く SELECT 文で、取り出した値を外側の条件などに渡せる",
                "内側から考えるコツ：まずは「外側の条件で使う値を取り出す SELECT」を形にしてから外側に組み合わせる",
                "必須条件と選択条件の統合：2つの調査結果の条件を () と OR で1つにまとめる"
            ]
        },
        expectedSql: `SELECT Imports.trade_id
FROM Imports
WHERE Imports.company_id = (SELECT company_id FROM Companies WHERE company_name = 'アオバ・マイクロ')
  AND Imports.model_number = 'TECH-26'
  AND (
    (Imports.received_quantity < Imports.quantity AND Imports.actual_weight_kg > Imports.declared_weight_kg)
    OR (Imports.actual_capacity < Imports.advertised_capacity)
  );`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "サブクエリとは、外側の条件などで使う値を先に別の SELECT で取り出して渡すために、() の中に書く SELECT 文のことです。まずは今回の条件に使う「アオバ・マイクロの会社IDを取り出す SELECT」を思い浮かべてみましょう。参考記事： https://techplay.jp/column/1841"
            },
            {
                level: 2,
                type: "使う構文",
                text: "サブクエリ用の丸括弧 (SELECT ...) に加えて、OR 群全体を囲む丸括弧 () と、条件の塊を分ける丸括弧 () を使います。外側の = とつなぐ場合は、サブクエリが1つの値（会社ID）を返す形にします。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → WHERE 表A.カラム = (SELECT 表B.カラム FROM 表B WHERE 表B.カラム = '値') AND 表A.カラム = '値' AND (条件A OR 条件B) の形で組み立てましょう。まずは () の中の SELECT を先に作ると整理しやすいです。"
            }
        ],
        dialogue: "上司：21番でも22番でもアオバ・マイクロ（C004）が浮かび上がったな。今回は初めてのサブクエリだ。() の中の SELECT で会社IDを取り出し、必須条件と選択条件のルールで2つの異常を統合しよう。",
        group: "🎯 最終章：異常の切り分けとコンテナ特定",
        glossary: {
            title: "サブクエリとカッコの基本ルール",
            html: `
- <span class='badge'>サブクエリ (SELECT ...)</span> 外側の条件などで使う値を先に取り出して渡す、() 内の SELECT 文<br>
- <span class='badge'>必須条件</span> 会社ID（サブクエリ）と TECH-26 は () の外に出す<br>
- <span class='badge'>選択条件 ()</span> 2つの異常パターンの OR 全体を () で囲む<br>
- <span class='badge'>Imports.trade_id</span> 抽出する対象取引ID
            `
        }
    },
    {
        id: 24,
        title: "24. 最終照合でコンテナを特定せよ",
        desc: "2つの切り口で確定した4取引について、ImportsにCompaniesとContainersをそれぞれINNER JOINし、会社名・取引ID・保管エリア・コンテナ番号を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
        最終照合では、会社・輸入記録・コンテナ保管記録の3テーブルをINNER JOINでつなぎます。

        ・Imports に Companies を company_id で INNER JOIN
        ・Imports に Containers を trade_id で INNER JOIN
        ・23番と同じ2つの切り口を使い、C004のTECH-26に限定

        アオバ・マイクロの怪しいコンテナは、BヤードのCNT-204、CNT-205、CNT-214、CNT-215です。`,
        clearFeedback: {
            dialogue: "上司：よし、怪しいコンテナを特定できた。これから押収に向かおう！\nS∀O　お疲れさまでした。一緒に学んでくださってありがとうございました。Thank you for playing!",
            learned: ["複数のINNER JOIN：company_idとtrade_idで3つの表をつなぐ", "切り口①と②を統合して対象を4件に確定する"]
        },
        expectedSql: `SELECT Companies.company_name, Imports.trade_id, Containers.container_area, Containers.container_number
FROM Imports
INNER JOIN Companies ON Imports.company_id = Companies.company_id
INNER JOIN Containers ON Imports.trade_id = Containers.trade_id
WHERE Imports.company_id = 'C004'
  AND Imports.model_number = 'TECH-26'
  AND ((Imports.received_quantity < Imports.quantity AND Imports.actual_weight_kg > Imports.declared_weight_kg)
        OR Imports.actual_capacity < Imports.advertised_capacity);`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "最後は「どの会社か」「どの取引か」「どのコンテナに入っているか」を1つの結果に出すため、3つの表をそれぞれの共通IDでつなぎます。"
            },
            {
                level: 2,
                type: "使う構文",
                text: "INNER JOINを2回使います。会社とは会社IDで、コンテナとは取引IDで結びつけるのがポイントです。"
            },
            {
                level: 3,
                type: "組み立て方",
                text: "FROM 表A → INNER JOIN 表B ON 表A.共通キー = 表B.共通キー → INNER JOIN 表C ON 表A.共通キー = 表C.共通キー → WHERE 表A.カラム = '値' AND (条件A OR 条件B) の形で組み立てましょう。"
            }
        ],
        dialogue: "上司：最後に保管記録をつなごう。統合した条件に当てはまる4件のコンテナを特定してくれ。",
        group: "🎯 最終章：異常の切り分けとコンテナ特定",
        glossary: {
            title: "最終照合に使うテーブルとキー",
            html: `
- <span class='badge'>Companies</span> 会社マスター<br>
- <span class='badge'>Imports</span> 輸入・受入数量・USB容量の記録<br>
- <span class='badge'>Containers</span> コンテナ保管記録<br>
- <span class='badge'>company_id / trade_id</span> テーブルをつなぐ共通ID<br>
- <span class='badge'>container_area / container_number</span> 保管エリアとコンテナ番号
            `
        }
    }
];
