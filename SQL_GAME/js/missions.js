const missions = [
    {
        id: 0,
        title: "プロローグ：匿名の告発と押収資料の確認",
        desc: "2026年4月に届いた匿名メールの手がかりをもとに、押収された各テーブルの全体像と共通IDを確認せよ。",
        isBriefing: true,
        dialogue: "上司：2026年4月、監査部門に匿名メールが届いた。『大容量USBメモリの輸入取引を調べてください。記録を消される前に調べてください。』とのことだ。まずは輸入データを含む資料全体を見てみよう。",
        explanation: `まずは調査の土台となる各テーブルを確認しましょう。

・各タブを切り替えて、どんなテーブルと列（カラム）があるか確認します。
・表どうしをつなぐ手がかりになる「共通のID（company_id や trade_id）」にも目を向けておきましょう。

確認が終わったら、「資料の確認を完了する」ボタンを押して捜査に進みます。`,
        expectedSql: "",
        hints: [
            "【ヒント1】まずは「会社情報」や「輸入記録」などのタブをクリックして、どんなデータが入っているか見てみましょう。",
            "【ヒント2】「輸入記録」にある company_id や trade_id が、ほかのテーブルとどう結びついているか意識してみてください。",
            "【ヒント3】資料を確認したら、「資料の確認を完了する」ボタンを押して第1章へ進みましょう。"
        ],
        group: "🌱 プロローグ：匿名の告発",
        glossary: {
            title: "プロローグで確認する押収資料",
            html: `
- <span class="badge">Company_Information_Records</span> 会社マスター（company_id / company_name / address）<br>
- <span class="badge">Import_Records</span> 輸入・取引記録1,000件（trade_id / company_id / model_number / product_name / quantity / declared_value / declaration_date）<br>
- <span class="badge">Customs_Inspection_Records</span> 税関検査記録（trade_id / declared_quantity / inspected_quantity）<br>
- <span class="badge">Port_Trade_Records</span> 港湾地域別取引記録（trade_id / region / declared_value）<br>
- <span class="badge">USB_Inspection_Records</span> USB容量検査記録（trade_id / product_name / advertised_capacity / actual_capacity）
            `
        }
    },

    // ==========================================
    // 第1章：不自然な申告金額（01〜04）
    // ==========================================
    {
        id: 1,
        title: "01. 輸入記録1,000件の全体像を確認せよ",
        desc: "Import_Records テーブルの全データを取得し、取引記録の全体像を確認せよ。",
        orderSensitive: false,
        explanation: `【解説】
SELECT * FROM テーブル名; は、指定したテーブルのすべての列とすべての行を取得する基本のSQLです。

・SELECT *：すべての列を取り出す
・FROM テーブル名：どのテーブルから取るか指定する
・（末尾の ; はあってもなくても大丈夫です）

まずは1,000件の輸入取引記録にどんな項目と値が入っているか確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：よし、1,000件の輸入取引記録の全体像が見えてきたな。次はUSBメモリの取引に絞り込んでみよう。",
            learned: [
                "SELECT *：すべての列を取得する",
                "FROM テーブル名：データを取得するテーブルを指定する"
            ]
        },
        expectedSql: "SELECT * FROM Import_Records;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "まずは条件で絞り込まず、対象テーブルに保存されている全データを確認します。"
            },
            {
                level: 2,
                type: "構文",
                text: "すべての列を取得するには SELECT * を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT * FROM テーブル名; の形を試してみましょう。"
            }
        ],
        dialogue: "上司：まずはデータを見てくれ。何が問題なのか、そこから調べよう。まずは Import_Records の全記録を出して全体を確認してみよう。",
        group: "🔍 第1章：不自然な申告金額",
        glossary: {
            title: "対象テーブル・カラム",
            html: "• <span class='badge'>Import_Records</span> 輸入・取引記録の全データ（1,000件・すべての列）"
        }
    },
    {
        id: 2,
        title: "02. USBメモリの取引に絞り込め",
        desc: "Import_Records テーブルから、カテゴリ（category）が「USBメモリ」の取引記録だけを取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
WHERE 句を使うと、条件に合う行だけを絞り込めます。

・WHERE category = 'USBメモリ'：カテゴリが USBメモリ の行だけを選ぶ

文字列を指定するときは、シングルクォーテーション（' '）で囲むのがポイントです。`,
        clearFeedback: {
            dialogue: "上司：USBメモリの取引に絞り込めたな。その中でも、同じ型番なのに申告金額に違いがないか見てみよう。",
            learned: [
                "WHERE：条件でデータを絞り込む",
                "=：値が一致するか比較する",
                "'USBメモリ'：文字列を指定する（シングルクォーテーションで囲む）"
            ]
        },
        expectedSql: "SELECT * FROM Import_Records WHERE category = 'USBメモリ';",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "今回は特定のカテゴリに一致する記録だけを調べます。条件を指定してデータを絞り込みましょう。"
            },
            {
                level: 2,
                type: "構文",
                text: "条件で絞り込むには WHERE 句を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE カテゴリのカラム = '対象の文字列' と指定します。"
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
        title: "03. 申告金額の偏りを並べ替えて確認せよ",
        desc: "Import_Records テーブルから、型番（model_number）が「CT-400」の記録を、申告額（declared_value）が安い順（昇順）に並べよ。",
        orderSensitive: true,
        explanation: `【解説】
ORDER BY 列名 を使うと、指定した列の値が小さい順（昇順・安い順）に並べ替えられます。

・ORDER BY declared_value：申告額が安い順に並べる
・※ ASC をつけて ORDER BY declared_value ASC と書いても同じ意味になります

同じ型番・似た数量でも、申告額が極端に低い取引がないか見比べてみましょう。`,
        clearFeedback: {
            dialogue: "上司：同じ型番なのに申告額が大きく異なる取引が見つかったぞ。特に C001 の取引は数量に対して申告額が不自然に低い。C001 の最新の動きを確認してみよう。",
            learned: [
                "ORDER BY 列名：指定した列の小さい順（昇順・安い順）に並べ替える",
                "ASC：昇順を明示したいときに使うキーワード（省略しても昇順になる）"
            ]
        },
        expectedSql: `SELECT *
FROM Import_Records
WHERE model_number = 'CT-400'
ORDER BY declared_value;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "02で作った「型番で絞り込むSQL」の後ろに、指定した列の小さい順に並べる命令を足します。"
            },
            {
                level: 2,
                type: "構文",
                text: "並び替えには ORDER BY を使います。列名だけ書いても小さい順（昇順）になります。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT *
FROM テーブル名
WHERE 条件のカラム = '値'
ORDER BY 並べ替えるカラム;
の形を試してみましょう。`
            }
        ],
        dialogue: "上司：CT-400 の取引を申告額が安い順に並べてみよう。同じ型番なのに申告金額が大きく異なる取引がないか確かめるんだ。",
        group: "🔍 第1章：不自然な申告金額",
        glossary: {
            title: "対象カラムの意味",
            html: `
- <span class='badge'>model_number</span> 製品の型番（CT-400）<br>
- <span class='badge'>quantity</span> 輸入数量（比較の基準）<br>
- <span class='badge'>declared_value</span> 申告された取引金額（並び替えの対象）
            `
        }
    },
    {
        id: 4,
        title: "04. 不審な取引の最新記録を1件取得せよ",
        desc: "Import_Records テーブルから、会社ID（company_id）が「C001」かつ型番（model_number）が「CT-400」の取引を対象に、申告日（declaration_date）が最も新しい記録を1件取得せよ。",
        orderSensitive: true,
        explanation: `【解説】
複数条件の組み合わせ、降順並び替え、件数制限を組み合わせて「最新の1件」を取り出します。

・AND：2つの条件を両方満たす行に絞る
・ORDER BY declaration_date DESC：新しい日付が上に来るよう並べる
・LIMIT 1：先頭の1件だけを取得する

申告金額だけでは判断しきれないため、次の第2章では貨物の数量にも異常がないか調べていきます。`,
        clearFeedback: {
            dialogue: "上司：C001 の最新取引を確認できたな。金額だけでは判断できない。貨物の数量にも異常がないか確認してくれ。",
            learned: [
                "AND：複数の条件をすべて満たすデータを絞り込む",
                "ORDER BY 列名 DESC：降順（大きい順・新しい順）に並べ替える",
                "LIMIT 1：取得する件数を1件に制限する"
            ]
        },
        expectedSql: `SELECT *
FROM Import_Records
WHERE company_id = 'C001'
  AND model_number = 'CT-400'
ORDER BY declaration_date DESC
LIMIT 1;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "今回は2つの条件を満たす記録を探し、その中から最新の1件を取得します。"
            },
            {
                level: 2,
                type: "構文",
                text: "複数条件には AND、新しい順の並び替えには DESC、取得件数の制限には LIMIT を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: `WHERE カラム1 = '値1'
  AND カラム2 = '値2'
ORDER BY 日付のカラム DESC
LIMIT 1
の型に当てはめてみましょう。`
            }
        ],
        dialogue: "上司：会社ID『C001』の CT-400 取引は申告額の低さが目立つ。申告日が最も新しい記録を1件だけ出して最新の状況を確認しよう。",
        group: "🔍 第1章：不自然な申告金額",
        glossary: {
            title: "対象カラムの意味",
            html: `
- <span class='badge'>company_id</span> 会社ID（'C001'を指定）<br>
- <span class='badge'>declaration_date</span> 申告日（並び替えに利用）
            `
        }
    },

    // ==========================================
    // 第2章：一致しない数量（05〜08）
    // ==========================================
    {
        id: 5,
        title: "05. 申告数量と検査数量が異なる記録を抽出せよ",
        desc: "Customs_Inspection_Records テーブルから、申告数量（declared_quantity）と実際の検査数量（inspected_quantity）が一致しない記録をすべて取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "!="],
        difficulty: 2,
        explanation: `【解説】
!=（または <>）を使うと、2つの値が「等しくない」行を取り出せます。

・declared_quantity != inspected_quantity：申告数量と検査数量が違う行を探す

まずは税関検査記録を確認し、数量が一致していない記録を洗い出しましょう。`,
        clearFeedback: {
            dialogue: "上司：申告数量と検査数量が一致しない記録が見つかったな。次は検査数量が申告数量を下回っている、つまり数量が不足している記録だけに絞ってみよう。",
            learned: [
                "WHERE：条件に一致するデータを絞り込む",
                "!=：2つの値が等しくないことを判定する",
                "<>：!= と同じく、等しくないことを判定する"
            ]
        },
        expectedSql: "SELECT * FROM Customs_Inspection_Records WHERE declared_quantity != inspected_quantity;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "今回は2つの数量カラムを比較し、数値が異なる記録を探します。"
            },
            {
                level: 2,
                type: "構文",
                text: "2つの値が等しくないことを判定するには != 演算子を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE 数量カラム1 != 数量カラム2 と指定します。"
            }
        ],
        dialogue: "上司：貨物の数量にも異常がないか確認しよう。まずは税関検査記録から、申告数量と実際の検査数量が異なる記録を抽出してみよう。",
        group: "📦 第2章：一致しない数量",
        glossary: {
            title: "対象テーブル・カラム",
            html: `
- <span class='badge'>Customs_Inspection_Records</span> 税関の検査記録<br>
- <span class='badge'>declared_quantity</span> 書類上の申告数量<br>
- <span class='badge'>inspected_quantity</span> 税関が実際に数えた検査数量
            `
        }
    },
    {
        id: 6,
        title: "06. 検査数量が申告数量を下回る記録を抽出せよ",
        desc: "Customs_Inspection_Records テーブルから、実際の検査数量（inspected_quantity）が申告数量（declared_quantity）を下回っている記録だけを取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "<"],
        difficulty: 2,
        explanation: `【解説】
< を使うと、左側の値が右側の値より「小さい」行を絞り込めます。

・inspected_quantity < declared_quantity：検査数量が申告数量より少ない行を探す

書類上の数より実際の数が少ない記録だけを抜き出してみましょう。`,
        clearFeedback: {
            dialogue: "上司：申告数量より検査数量が少ない記録が絞れたな。次はそれぞれの取引で何個不足しているのか計算してみよう。",
            learned: [
                "<：左側の値が右側の値より小さいことを判定する",
                "WHERE：指定した条件に一致する記録だけを取得する"
            ]
        },
        expectedSql: "SELECT * FROM Customs_Inspection_Records WHERE inspected_quantity < declared_quantity;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "基準となる数量よりも、もう一方の数量が少ない記録を探しましょう。"
            },
            {
                level: 2,
                type: "構文",
                text: "左側の値が右側の値より小さいことを判定するには < 演算子を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE 小さい方のカラム < 大きい方のカラム と指定します。"
            }
        ],
        dialogue: "上司：今度は検査数量が申告数量より少ない、つまり数量が不足している記録だけに絞り込んでみよう。",
        group: "📦 第2章：一致しない数量",
        glossary: {
            title: "対象テーブル・カラム",
            html: `
- <span class='badge'>inspected_quantity</span> 実際の検査数量<br>
- <span class='badge'>declared_quantity</span> 書類上の申告数量<br>
- <span class='badge'><</span> 左側が右側より小さいことを表す
            `
        }
    },
    {
        id: 7,
        title: "07. 数量の差を計算して異常の規模を確認せよ",
        desc: "Customs_Inspection_Records テーブルから、取引ID（trade_id）と、申告数量から検査数量を引いた不足数を missing_quantity という名前で取得せよ。",
        orderSensitive: false,
        concept: ["SELECT", "-", "AS"],
        difficulty: 3,
        explanation: `【解説】
SQLでは列同士を引き算し、その結果に AS で別名を付けられます。

・declared_quantity - inspected_quantity：数量の差（不足数）を計算する
・AS missing_quantity：計算結果の列名を missing_quantity にする

それぞれの取引でどれくらいの数量が消えているのか確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：取引ごとの数量の差がはっきりしたな。T005 では350個もの数量不足が見つかっている。次は特に不足数が大きい記録に絞ってみよう。",
            learned: [
                "-：数値の引き算を行う算術演算子",
                "AS：取得した列や計算結果に別名を付ける",
                "missing_quantity：今回の不足数を表す列名"
            ]
        },
        expectedSql: "SELECT trade_id, declared_quantity - inspected_quantity AS missing_quantity FROM Customs_Inspection_Records;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "今回はある数量から別の数量を引き算し、取引ごとの差を計算します。"
            },
            {
                level: 2,
                type: "構文",
                text: "数値の引き算には - を使います。また、計算結果に名前を付けるには AS を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT IDカラム, 数値カラム1 - 数値カラム2 AS 別名 FROM テーブル名; の形にします。"
            }
        ],
        dialogue: "上司：数量の差を計算して、異常の規模を確認しよう。申告数量から検査数量を引いた差を missing_quantity として出してみてくれ。",
        group: "📦 第2章：一致しない数量",
        glossary: {
            title: "対象テーブル・カラム",
            html: `
- <span class='badge'>trade_id</span> 取引ID<br>
- <span class='badge'>declared_quantity</span> 申告数量<br>
- <span class='badge'>inspected_quantity</span> 検査数量<br>
- <span class='badge'>missing_quantity</span> 計算した不足数の別名
            `
        }
    },
    {
        id: 8,
        title: "08. 200個以上の大きな数量不足を特定せよ",
        desc: "Customs_Inspection_Records テーブルから、実際の検査数量（inspected_quantity）が申告数量（declared_quantity）を下回り、さらに申告数量と検査数量の差が200個以上ある記録をすべて取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "AND", "()", ">=", "-"],
        difficulty: 3,
        explanation: `【解説】
2つの条件を AND でつなぎ、それぞれを ( ) で囲んで分かりやすくします。

・(inspected_quantity < declared_quantity)：検査数量が申告数量より少ない
・(declared_quantity - inspected_quantity >= 200)：不足数が200個以上

T005 の350個不足をはじめ、大きな数量のズレが起きている記録を特定しましょう。`,
        clearFeedback: {
            dialogue: "上司：T005 では350個もの数量不足が見つかったな。しかし、気になることがある。数量の不一致は、特定の会社に集中しているのではないか？ 次は会社や地域ごとの傾向を調べてみよう。",
            learned: [
                "AND：複数の条件をすべて満たすデータを取得する",
                "()：条件のまとまりを分かりやすくする",
                ">=：左側の値が右側の値以上であることを判定する",
                "-：2つの数値カラムの差を計算する",
                "WHERE：指定した条件に一致する記録を抽出する"
            ]
        },
        expectedSql: `SELECT *
FROM Customs_Inspection_Records
WHERE (inspected_quantity < declared_quantity)
  AND (declared_quantity - inspected_quantity >= 200);`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "今回は2つの条件を両方満たす記録を探します。数量が不足していることと、その差が基準以上であることを組み合わせましょう。"
            },
            {
                level: 2,
                type: "構文",
                text: "条件を2つ用意し、AND でつなぎます。それぞれの条件は ( ) で囲みましょう。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE (数量条件) AND (差の計算式 >= 基準値) の形にします。"
            }
        ],
        dialogue: "上司：数量の差が200個以上ある大きな異常を絞り込んでみよう。T005 を含む不審な記録を一覧にして確認するんだ。",
        group: "📦 第2章：一致しない数量",
        glossary: {
            title: "今回使う構文・カラム",
            html: `
- <span class='badge'>declared_quantity</span> 書類上の申告数量<br>
- <span class='badge'>inspected_quantity</span> 実際の検査数量<br>
- <span class='badge'>AND</span> 2つの条件を両方満たす<br>
- <span class='badge'>( )</span> 条件のまとまりを表す<br>
- <span class='badge'>>=</span> 200以上であることを判定する
            `
        }
        },
// ==========================================
    // 第3章：疑わしい会社とルート（09〜13）
    // ==========================================
    {
        id: 9,
        title: "09. 会社IDごとの取引件数を集計せよ",
        desc: "Import_Records テーブルから、会社ID（company_id）ごとにグループ化し、会社IDと各会社の取引件数（別名：trade_count）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
GROUP BY で同じ値ごとにまとめ、COUNT(*) で各グループの件数を数えます。

・GROUP BY company_id：会社IDごとにグループ化する
・COUNT(*) AS trade_count：会社ごとの取引件数を trade_count という名前で出す

まずは取引件数が特定の会社に偏っていないか確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：会社IDごとの取引件数が見えてきたな。次は会社ごとの申告金額の合計や平均も比べてみよう。",
            learned: [
                "GROUP BY 列名：指定した列の値ごとにグループ化する",
                "COUNT(*)：各グループの行数を数える",
                "AS 別名：集計結果に別名を付ける"
            ]
        },
        expectedSql: "SELECT company_id, COUNT(*) AS trade_count FROM Import_Records GROUP BY company_id;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "会社IDごとにデータをひとまとめにし、それぞれの会社で何件の取引があるかを数えます。"
            },
            {
                level: 2,
                type: "構文",
                text: "グループ化には GROUP BY、件数の集計には COUNT(*)、別名付けには AS を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT グループ化する列名, COUNT(*) AS trade_count FROM テーブル名 GROUP BY グループ化する列名; の型に当てはめてみましょう。"
            }
        ],
        dialogue: "上司：数量の不一致は特定の会社に集中しているのではないか？ まずは Import_Records で会社IDごとの取引件数を集計してみよう。",
        group: "🏢 第3章：疑わしい会社とルート",
        glossary: {
            title: "対象カラム・関数の意味",
            html: `
- <span class='badge'>Import_Records</span> 輸入・取引記録<br>
- <span class='badge'>company_id</span> 会社ID（グループ化の基準）<br>
- <span class='badge'>COUNT(*)</span> 各グループの件数を数える関数
            `
        }
    },
   {
        id: 10,
        title: "10. 会社ごとの申告金額の合計と平均を比較せよ",
        desc: "Import_Records テーブルから、会社ID（company_id）ごとに申告額（declared_value）の合計（別名：total_value）と、小数点以下を四捨五入して丸めた平均（別名：avg_value）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
SUM(列名) で合計を、AVG(列名) で平均を計算できます。
さらに ROUND(数値, 0) を使うと、小数点以下を四捨五入して整数に丸められます。

・SUM(declared_value) AS total_value：会社ごとの申告額の合計を計算する
・ROUND(AVG(declared_value), 0) AS avg_value：平均申告額を計算し、見やすく丸める
・GROUP BY company_id：会社IDごとにまとめる

取引件数が多いのに平均申告額が低い会社など、金額の偏りに注目してみましょう。`,
        clearFeedback: {
            dialogue: "上司：会社ごとの合計と平均を比べると、金額の偏りがよりはっきりするな。次は一定以上の取引件数がある会社に絞り込んでみよう。",
            learned: [
                "SUM(列名)：グループごとの数値を合計する",
                "AVG(列名)：グループごとの数値の平均を計算する",
                "ROUND(数値, 0)：小数点以下を四捨五入して整数に丸める",
                "GROUP BY 列名：集計する単位を指定する"
            ]
        },
        expectedSql: `SELECT
    company_id,
    SUM(declared_value) AS total_value,
    ROUND(AVG(declared_value), 0) AS avg_value
FROM Import_Records
GROUP BY company_id;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "会社IDごとにまとめ、金額の合計と、丸めた平均金額を計算します。"
            },
            {
                level: 2,
                type: "構文",
                text: "合計は SUM(列名)、平均を整数に丸めるには ROUND(AVG(列名), 0) を使い、AS で別名を付けます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    グループ化する列名,
    SUM(数値カラム) AS 別名1,
    ROUND(AVG(数値カラム), 0) AS 別名2
FROM テーブル名
GROUP BY グループ化する列名;`
            }
        ],
        dialogue: "上司：会社ごとの申告金額の合計と平均を出してみよう。平均は ROUND で丸めて見やすくするんだ。",
        group: "🏢 第3章：疑わしい会社とルート",
        glossary: {
            title: "対象カラム・関数の意味",
            html: `
- <span class='badge'>declared_value</span> 申告額
- <span class='badge'>SUM()</span> 各グループの合計を計算する関数
- <span class='badge'>AVG()</span> 各グループの平均を計算する関数
- <span class='badge'>ROUND(数値, 0)</span> 小数点以下を四捨五入して整数に丸める関数
            `
        }
    },
    {
        id: 11,
        title: "11. 取引件数が多い会社を抽出せよ",
        desc: "Import_Records テーブルから、会社ID（company_id）ごとに取引件数（別名：trade_count）を集計し、100件以上の会社だけを対象に、取引件数が多い順（降順）に並べよ。",
        orderSensitive: true,
        explanation: `【解説】
集計した結果に条件を付けるときは WHERE ではなく HAVING を使います。

・HAVING COUNT(*) >= 100：集計後の件数が100件以上のグループに絞る
・ORDER BY trade_count DESC：件数が多い順（降順）に並べる

「行を絞る WHERE」「集計後を絞る HAVING」の違いを押さえましょう。`,
        clearFeedback: {
            dialogue: "上司：取引件数が多い会社が絞れたな。次は港湾地域ごとの申告額も集計して、ルートの傾向を確認しておこう。",
            learned: [
                "HAVING 条件：GROUP BY で集計した後の結果に条件を付ける",
                "ORDER BY 列名 DESC：降順（大きい順・多い順）に並べ替える"
            ]
        },
        expectedSql: `SELECT
    company_id,
    COUNT(*) AS trade_count
FROM Import_Records
GROUP BY company_id
HAVING COUNT(*) >= 100
ORDER BY trade_count DESC;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "会社ごとの件数を出したあと、一定件数以上の会社だけに絞り込み、多い順に並べます。"
            },
            {
                level: 2,
                type: "構文",
                text: "集計結果の絞り込みには HAVING、多い順の並び替えには ORDER BY と DESC を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: `GROUP BY グループ化する列名
HAVING COUNT(*) >= 基準値
ORDER BY 別名 DESC
の型に当てはめてみましょう。`
            }
        ],
        dialogue: "上司：取引件数が100件以上ある会社だけを絞り込んで、多い順に並べてみよう。偏りのある会社を洗い出すんだ。",
        group: "🏢 第3章：疑わしい会社とルート",
        glossary: {
            title: "対象カラム・句の意味",
            html: `
- <span class='badge'>company_id</span> 会社ID<br>
- <span class='badge'>COUNT(*)</span> 会社ごとの取引件数<br>
- <span class='badge'>HAVING</span> 集計後の条件指定<br>
- <span class='badge'>ORDER BY ... DESC</span> 多い順（降順）の並び替え
            `
        }
    },
    {
        id: 12,
        title: "12. 港湾地域別の取引金額を集計せよ",
        desc: "Port_Trade_Records テーブルから、港湾地域（region）ごとにグループ化し、地域名と各地域の申告額の合計（別名：total_value）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
Port_Trade_Records テーブルを使い、港湾地域（region）ごとの申告額合計を計算します。

・SUM(declared_value) AS total_value：地域ごとの申告額の合計を求める
・GROUP BY region：港湾地域ごとにグループ化する

どの港湾地域に大きな取引金額が集まっているか確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：港湾地域ごとの申告額の合計も確認できたな。次は取引件数が200件以上ある主要拠点を絞ってみよう。",
            learned: [
                "Port_Trade_Records：港湾地域別の取引記録を扱うテーブル",
                "SUM(列名) + GROUP BY：地域ごとの金額合計を集計する"
            ]
        },
        expectedSql: "SELECT region, SUM(declared_value) AS total_value FROM Port_Trade_Records GROUP BY region;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "港湾地域ごとにデータをまとめ、それぞれの地域で申告された金額の合計を出します。"
            },
            {
                level: 2,
                type: "構文",
                text: "合計を求めるには SUM(列名) を使い、GROUP BY で地域ごとにまとめます。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT 地域列名, SUM(金額列名) AS total_value FROM テーブル名 GROUP BY 地域列名; の型に当てはめてみましょう。"
            }
        ],
        dialogue: "上司：会社だけでなく、港湾地域別の取引金額も確認しておこう。Port_Trade_Records で地域ごとの申告額合計を出してみてくれ。",
        group: "🏢 第3章：疑わしい会社とルート",
        glossary: {
            title: "対象テーブル・カラム",
            html: `
- <span class='badge'>Port_Trade_Records</span> 港湾地域別取引記録<br>
- <span class='badge'>region</span> 港湾地域名<br>
- <span class='badge'>declared_value</span> 申告額
            `
        }
    },
    {
        id: 13,
        title: "13. 取引件数が200件以上の港湾拠点を特定せよ",
        desc: "Port_Trade_Records テーブルから、港湾地域（region）ごとに取引件数（別名：trade_count）を集計し、200件以上の地域だけを対象に、取引件数が多い順（降順）に並べよ。",
        orderSensitive: true,
        explanation: `【解説】
GROUP BY で地域ごとの件数を集計したあと、HAVING で200件以上の地域に絞り込み、ORDER BY ... DESC で多い順に並べます。

・HAVING COUNT(*) >= 200：取引件数が200件以上の地域に絞る
・ORDER BY trade_count DESC：件数が多い順に並べる

取引件数や申告金額に偏りがある会社・地域が見つかりましたが、会社IDだけでは実際の会社名や所在地が分かりません。次の第4章では別々に保存されている記録を照合していきます。`,
        clearFeedback: {
            dialogue: "上司：取引件数や申告金額に偏りがある会社・地域が見つかったな。しかし、会社IDだけでは実際の会社名や所在地が分からない。ここから先は、別々に保存されている記録を照合する必要がある。",
            learned: [
                "HAVING COUNT(*) >= 200：集計後の件数条件で地域を絞り込む",
                "第3章のまとめ：会社ID・港湾地域ごとの偏りを把握し、次の照合（JOIN）へつなげる"
            ]
        },
        expectedSql: `SELECT
    region,
    COUNT(*) AS trade_count
FROM Port_Trade_Records
GROUP BY region
HAVING COUNT(*) >= 200
ORDER BY trade_count DESC;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "港湾地域ごとの取引件数を集計したあと、200件以上の地域だけに絞り込み、多い順に並べます。"
            },
            {
                level: 2,
                type: "構文",
                text: "集計後の絞り込みには HAVING、多い順の並び替えには ORDER BY と DESC を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: `GROUP BY 地域列名
HAVING COUNT(*) >= 基準件数
ORDER BY 別名 DESC
の型に当てはめてみましょう。`
            }
        ],
        dialogue: "上司：最後に、取引件数が200件以上ある港湾地域だけを絞り込んで、多い順に並べてみよう。偏りのある拠点を整理しておこう。",
        group: "🏢 第3章：疑わしい会社とルート",
        glossary: {
            title: "対象カラム・句の意味",
            html: `
- <span class='badge'>region</span> 港湾地域名<br>
- <span class='badge'>COUNT(*)</span> 地域ごとの取引件数<br>
- <span class='badge'>HAVING</span> 集計後の条件指定<br>
- <span class='badge'>ORDER BY ... DESC</span> 多い順（降順）の並び替え
            `
        }
    },
// ==========================================
    // 第4章：つながる記録、浮かび上がる疑惑（14〜18）
    // ==========================================
    {
        id: 14,
        title: "14. 会社マスターと輸入記録を JOIN でつなげよ",
        desc: "Import_Records テーブルと Company_Information_Records テーブルを company_id で JOIN し、取引ID（trade_id）・会社名（company_name）・所在地（address）・申告額（declared_value）を取得せよ。",
        prologue: "押収した資料を調べると、輸入記録には会社ID、会社マスターには会社名や所在地が別々に保存されている。記録を単独で見るだけでは、取引を行った企業の実態までは分からない。共通するIDを手がかりに複数の表を照合し、断片的な情報を一つの証拠としてつなげよう。",
        orderSensitive: false,
        explanation: `【解説】
まずは JOIN で「2つの表を共通のIDで横につなぐ練習」をしましょう。

・JOIN Company_Information_Records：会社情報をつなぐ表を指定する
・ON Import_Records.company_id = Company_Information_Records.company_id：同じ company_id の行どうしをくっつける目印

どの表の列か分かりやすくするため、「テーブル名.列名」と書きます。まずはどの会社がどんな申告額で取引しているか確認しましょう。`,
        clearFeedback: {
            dialogue: "上司：会社名や所在地が見えるようになったな。次は INNER JOIN を使って、輸入記録と税関検査記録を trade_id でつないでみよう。",
            learned: [
                "JOIN 〜 ON 〜：共通のIDが一致する行どうしを横につなぐ基本の書き方",
                "テーブル名.列名：どの表の列かをはっきりさせる書き方"
            ]
        },
        expectedSql: `SELECT
    Import_Records.trade_id,
    Company_Information_Records.company_name,
    Company_Information_Records.address,
    Import_Records.declared_value
FROM Import_Records
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "輸入記録と会社マスターを、両方に共通する company_id を目印にして横につなぎます。"
            },
            {
                level: 2,
                type: "構文",
                text: "JOIN でつなぐ表を書き、ON で「表1.company_id = 表2.company_id」とつなぐ目印を指定します。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Import_Records.trade_id,
    Company_Information_Records.company_name
FROM Import_Records
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id;`
            }
        ],
        dialogue: "上司：まずはつなげる練習だ。会社マスターと輸入記録を JOIN でつないで、会社名と所在地を出してみよう。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "会社情報と輸入記録をつなぐ項目",
            html: `
- <span class='badge'>Company_Information_Records</span> 会社マスター（company_name / address）<br>
- <span class='badge'>Import_Records</span> 輸入・取引記録（trade_id / declared_value）<br>
- <span class='badge'>company_id</span> 2つの表をつなぐ共通の会社ID
            `
        }
    },
    {
        id: 15,
        title: "15. 輸入記録と税関検査記録を INNER JOIN で結びつけよ",
        desc: "Import_Records テーブルと Customs_Inspection_Records テーブルを trade_id で INNER JOIN し、取引ID（trade_id）・申告数量（declared_quantity）・検査数量（inspected_quantity）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
つなぐ感覚がつかめたところで、今度は INNER JOIN を使ってみましょう。

・INNER JOIN Customs_Inspection_Records：取引IDが一致する検査記録をつなぐ
・ON Import_Records.trade_id = Customs_Inspection_Records.trade_id：同じ trade_id の行どうしを合わせる

INNER JOIN は、両方の表に一致するデータがあるものだけを表示します。つまり「検査記録そのものが載っていない取引」は、この時点ではまだ見えません。`,
        clearFeedback: {
            dialogue: "上司：検査記録がある取引は並べて見られたな。でも、検査記録が抜けている取引はないだろうか？ LEFT JOIN で確かめてみよう。",
            learned: [
                "INNER JOIN 〜 ON 〜：両方の表に一致する行どうしを結びつける",
                "trade_id：取引記録と税関検査記録をつなぐ共通の取引ID"
            ]
        },
        expectedSql: `SELECT
    Import_Records.trade_id,
    Customs_Inspection_Records.declared_quantity,
    Customs_Inspection_Records.inspected_quantity
FROM Import_Records
INNER JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "今度は company_id ではなく trade_id を目印にして、輸入記録と税関検査記録を INNER JOIN します。"
            },
            {
                level: 2,
                type: "構文",
                text: "INNER JOIN Customs_Inspection_Records のあとに、ON で trade_id 同士を結びつけます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Import_Records.trade_id,
    Customs_Inspection_Records.inspected_quantity
FROM Import_Records
INNER JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id;`
            }
        ],
        dialogue: "上司：次は INNER JOIN を使って、輸入記録と税関検査記録を trade_id でつないでみよう。申告数と検査数が合っているか見るんだ。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "取引記録と検査記録をつなぐ項目",
            html: `
- <span class='badge'>Customs_Inspection_Records</span> 税関検査記録<br>
- <span class='badge'>trade_id</span> 取引ID（つなぐ目印）<br>
- <span class='badge'>declared_quantity / inspected_quantity</span> 申告数量と検査数量
            `
        }
    },
    {
        id: 16,
        title: "16. LEFT JOIN で全取引の検査記録の有無を確認せよ",
        desc: "Import_Records テーブルを基準に Customs_Inspection_Records テーブルを LEFT JOIN し、取引ID（trade_id）・型番（model_number）・検査数量（inspected_quantity）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
ここからは LEFT JOIN を使います。LEFT JOIN は「左側（FROM に書いた Import_Records）の行をぜんぶ残したまま、右側の表をつなぐ」書き方です。

・LEFT JOIN Customs_Inspection_Records：右側に検査記録がなくても、左側の取引は消さずに残す
・NULL：右側の表に対応するデータがないことを表す空っぽの状態

「検査記録が抜けている取引」がないか、まずは全体を見てみましょう。`,
        clearFeedback: {
            dialogue: "上司：inspected_quantity が NULL になっている行があるぞ！ 検査記録が抜けている取引だけを絞り込んでみよう。",
            learned: [
                "LEFT JOIN：左側の表をぜんぶ残しながら右側の表をつなぐ",
                "NULL：対応するデータが存在しない状態"
            ]
        },
        expectedSql: `SELECT
    Import_Records.trade_id,
    Import_Records.model_number,
    Customs_Inspection_Records.inspected_quantity
FROM Import_Records
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "輸入記録の行をぜんぶ残したまま税関検査記録をつなぎ、検査数量が NULL になっている行がないか確認します。"
            },
            {
                level: 2,
                type: "構文",
                text: "LEFT JOIN を使うと、左側の表の行が残ります。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Import_Records.trade_id,
    Customs_Inspection_Records.inspected_quantity
FROM Import_Records
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id;`
            }
        ],
        dialogue: "上司：検査記録がない取引が隠れていないかな。LEFT JOIN を使って、輸入記録をぜんぶ残したまま検査記録をつないでみよう。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "LEFT JOIN と NULL",
            html: `
- <span class='badge'>LEFT JOIN</span> 左側の表をぜんぶ残す結合<br>
- <span class='badge'>inspected_quantity</span> 税関での検査数量<br>
- <span class='badge'>NULL</span> 検査記録が存在しない状態
            `
        }
    },
    {
        id: 17,
        title: "17. 検査記録が存在しない取引を発見せよ",
        desc: "Import_Records テーブルを基準に Customs_Inspection_Records テーブルを LEFT JOIN し、税関検査記録が存在しない取引の取引ID（trade_id）と型番（model_number）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
LEFT JOIN でつないだあとに、右側の表に記録がない（NULL の）行だけを絞り込みます。

・LEFT JOIN Customs_Inspection_Records：検査記録がない取引も残す
・WHERE Customs_Inspection_Records.trade_id IS NULL：検査記録側に一致する取引IDがない行だけを選ぶ

ここで T008 が見つかります。ただし、検査記録がない＝即犯人とは限りません。単なる「記録の登録漏れ（抜け）」の可能性もあるので、どの会社の取引か確認してみましょう。NULL の判定には必ず IS NULL を使います。`,
        clearFeedback: {
            dialogue: "上司：T008 の検査記録が抜けているな。ただ、記録の漏れ（事務的な抜け）かもしれない。どの会社の取引か、会社情報とつないで確かめよう。",
            learned: [
                "IS NULL：値が入っていない（NULL の）行を探す条件",
                "T008 の確認：検査記録が未登録の取引を見つける（記録漏れの可能性も含めて確認する）"
            ]
        },
        expectedSql: `SELECT
    Import_Records.trade_id,
    Import_Records.model_number
FROM Import_Records
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Customs_Inspection_Records.trade_id IS NULL;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "16番の LEFT JOIN に、右側の検査記録が存在しない（NULL である）という条件を足します。"
            },
            {
                level: 2,
                type: "構文",
                text: "NULL を探すときは「= NULL」ではなく「IS NULL」と書きます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Import_Records.trade_id
FROM Import_Records
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Customs_Inspection_Records.inspected_quantity IS NULL;`
            }
        ],
        dialogue: "上司：記録が抜けている取引に注目してくれ。検査記録が存在しない取引だけを IS NULL で絞り込み、未登録の取引を突き止めよう。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "未検査取引を絞り込む構文",
            html: `
- <span class='badge'>IS NULL</span> 値が存在しない（NULL）行を絞り込む<br>
- <span class='badge'>T008</span> 税関検査記録が登録されていない取引（記録漏れの可能性）
            `
        }
    },
    {
        id: 18,
        title: "18. 検査記録が未登録の取引を行った企業を確認せよ",
        desc: "Import_Records テーブルを基準に Company_Information_Records を JOIN、Customs_Inspection_Records を LEFT JOIN し、税関検査記録が存在しない取引について、会社名（company_name）・取引ID（trade_id）・型番（model_number）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
ここでは「三陸フロンティア（T008）」の検査記録が抜けていることがわかります。

・JOIN Company_Information_Records：会社名をくっつける
・LEFT JOIN Customs_Inspection_Records：検査記録がない取引も消さずに残す
・WHERE Customs_Inspection_Records.trade_id IS NULL：検査記録が抜けている取引だけに絞る

三陸フロンティア（T008）は「検査記録の登録漏れ」のようにも見えます。1つの抜けや異常だけで決めつけず、次の第5章ではUSB容量の検査結果も見ていきましょう。`,
        clearFeedback: {
            dialogue: "上司：T008 は三陸フロンティアか。どうやらここは単なる検査記録の登録漏れ（抜け）の可能性が高いな。決めつけず、USB容量や金額の異常とあわせて本当の不正を突き止めよう。",
            learned: [
                "JOIN と LEFT JOIN の組み合わせ：会社名を出すための JOIN と、抜けを探すための LEFT JOIN を併用できる",
                "捜査の視点：1つの抜けや異常だけで決めつけず、複数の証拠を照らし合わせる"
            ]
        },
        expectedSql: `SELECT
    Company_Information_Records.company_name,
    Import_Records.trade_id,
    Import_Records.model_number
FROM Import_Records
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Customs_Inspection_Records.trade_id IS NULL;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "Import_Records を真ん中に置いて会社マスターをつなぎ、さらに税関検査記録を LEFT JOIN して IS NULL で絞ります。"
            },
            {
                level: 2,
                type: "構文",
                text: "14番の JOIN と17番の LEFT JOIN + IS NULL を組み合わせるイメージです。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Company_Information_Records.company_name,
    Import_Records.trade_id
FROM Import_Records
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Customs_Inspection_Records.trade_id IS NULL;`
            }
        ],
        dialogue: "上司：検査記録が抜けている取引はどの会社のものだ？ 会社情報とつないで確かめよう。",
        group: "🔗 第4章：つながる記録、浮かび上がる疑惑",
        glossary: {
            title: "会社情報と未登録取引を照合する項目",
            html: `
- <span class='badge'>company_name</span> 会社名<br>
- <span class='badge'>三陸フロンティア（T008）</span> 検査記録が抜けている取引（登録漏れの可能性）<br>
- <span class='badge'>IS NULL</span> 検査記録が存在しない取引の絞り込み
            `
        }
    },

    // ==========================================
    // 第5章：異常取引の分類と照合（19〜21）
    // ==========================================
    {
        id: 19,
        title: "19. USB容量の異常を3段階に分類せよ",
        desc: "USB_Inspection_Records テーブルから、取引ID（trade_id）・商品名（product_name）・広告容量（advertised_capacity）・実容量（actual_capacity）と、実容量が広告容量の50%未満なら「重大な異常」、それ以外で実容量が広告容量未満なら「要確認」、それ以外は「正常」とする inspection_result を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
CASE WHEN を使うと、条件に応じて3段階の分類ラベルを付けられます。

・WHEN actual_capacity < advertised_capacity * 0.5 THEN '重大な異常'：実容量が広告容量の50%未満
・WHEN actual_capacity < advertised_capacity THEN '要確認'：50%以上100%未満（広告容量より少ない）
・ELSE '正常'：広告容量と一致（それ以外）

上から順に評価されるので、最も厳しい「50%未満」を最初に書くのがポイントです。`,
        clearFeedback: {
            dialogue: "上司：USB容量を3段階に分類できたな。そういえば、さっき検査記録が抜けていた三陸フロンティア（T008）はどうなっている？ ピンポイントで確かめてみよう。",
            learned: [
                "CASE WHEN 〜 THEN 〜 WHEN 〜 THEN 〜 ELSE 〜 END：複数条件で3段階以上に分類する",
                "AS inspection_result：分類結果の列に別名を付ける"
            ]
        },
        expectedSql: `SELECT
    trade_id,
    product_name,
    advertised_capacity,
    actual_capacity,
    CASE
        WHEN actual_capacity < advertised_capacity * 0.5
            THEN '重大な異常'
        WHEN actual_capacity < advertised_capacity
            THEN '要確認'
        ELSE '正常'
    END AS inspection_result
FROM USB_Inspection_Records;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "広告容量と実容量を比べ、「50%未満」→「広告容量未満（50%以上100%未満）」→「それ以外（正常）」の順に分類します。"
            },
            {
                level: 2,
                type: "構文",
                text: "CASE の中に WHEN 〜 THEN 〜 を複数並べ、最後に ELSE 〜 END AS inspection_result と書きます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    trade_id,
    CASE
        WHEN actual_capacity < advertised_capacity * 0.8 THEN '少ない'
        ELSE '十分'
    END AS status_label
FROM USB_Inspection_Records;`
            }
        ],
        dialogue: "上司：USBメモリの広告容量と実容量に差がある商品があるらしい。3段階（重大な異常・要確認・正常）に分類して見てみよう。",
        group: "💾 第5章：異常取引の分類と照合",
        glossary: {
            title: "USB容量検査記録の項目と分類基準",
            html: `
- <span class='badge'>USB_Inspection_Records</span> USB容量検査記録<br>
- <span class='badge'>advertised_capacity</span> 広告容量（表示容量）<br>
- <span class='badge'>actual_capacity</span> 実容量（実測容量）<br>
- <span class='badge'>inspection_result</span> 重大な異常 / 要確認 / 正常 の判定結果
            `
        }
    },
    {
        id: 20,
        title: "20. 気になる取引IDのUSB容量をピンポイントで確認せよ",
        desc: "USB_Inspection_Records テーブルから、取引ID（trade_id）が「T008」の取引について、取引ID（trade_id）・広告容量（advertised_capacity）・実容量（actual_capacity）・検査結果（inspection_result）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
件数が多い一覧の中から探すのではなく、WHERE trade_id = 'T008' でピンポイントに絞り込みます。

・T008 を確認すると、広告容量 1024 に対して実容量も 1024 で「正常」になっています。
・つまり T008 は容量のごまかしはなく、税関検査記録の「登録漏れ」だった可能性が高いと判断できます。

T008 の容量は正常と切り分けできたので、次の21番では複数 JOIN を使って、本当に「重大な異常」がある取引と会社を絞り込みましょう。`,
        clearFeedback: {
            dialogue: "上司：T008 は 1024 で「正常」か。容量に異常はないな。やはり税関検査記録の登録漏れで間違いなさそうだ。次は複数 JOIN を使って、本当に容量に重大な異常がある取引と会社を絞り込もう。",
            learned: [
                "ピンポイント確認：WHERE で特定の取引IDに絞ると、容量の判定をすぐ確かめられる",
                "切り分け：T008 は容量正常のため登録漏れと整理し、次の複数 JOIN へ進む"
            ]
        },
        expectedSql: `SELECT
    trade_id,
    advertised_capacity,
    actual_capacity,
    CASE
        WHEN actual_capacity < advertised_capacity * 0.5
            THEN '重大な異常'
        WHEN actual_capacity < advertised_capacity
            THEN '要確認'
        ELSE '正常'
    END AS inspection_result
FROM USB_Inspection_Records
WHERE trade_id = 'T008';`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "19番の USB容量の分類 SQL に、取引IDが 'T008' という条件を追加します。"
            },
            {
                level: 2,
                type: "構文",
                text: "FROM USB_Inspection_Records のあとに WHERE trade_id = 'T008' を書きます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    trade_id,
    advertised_capacity,
    actual_capacity
FROM USB_Inspection_Records
WHERE trade_id = 'T001';`
            }
        ],
        dialogue: "上司：さっき未検査だった取引、本当に容量も正常なのか？ WHERE で T008 に絞って確かめてみよう。",
        group: "💾 第5章：異常取引の分類と照合",
        glossary: {
            title: "取引IDを指定して確認するポイント",
            html: `
- <span class='badge'>trade_id = 'T008'</span> 未検査だった取引ID<br>
- <span class='badge'>1024 / 1024（正常）</span> 広告容量と実容量が一致しており容量異常はない<br>
- <span class='badge'>登録漏れ</span> 検査記録が抜けていただけの可能性が高い
            `
        }
    },
    {
        id: 21,
        title: "21. 複数 JOIN で容量が大きく足りない取引と会社を調べよ",
        desc: "USB_Inspection_Records・Import_Records・Company_Information_Records をつなぎ、実容量（actual_capacity）が広告容量（advertised_capacity）の半分未満である取引について、会社名（company_name）・取引ID（trade_id）・商品名（product_name）・申告額（declared_value）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
ここでは2つの JOIN を使って、3つの表を順番につなぎます。

・JOIN Import_Records ON USB_Inspection_Records.trade_id = Import_Records.trade_id：取引IDで輸入記録をつなぐ
・JOIN Company_Information_Records ON Import_Records.company_id = Company_Information_Records.company_id：会社IDで会社マスターをつなぐ
・WHERE USB_Inspection_Records.actual_capacity < USB_Inspection_Records.advertised_capacity / 2：実容量が広告容量の半分未満の行に絞る

容量が大きく足りない取引を出した会社と、その申告額を確認しましょう。次の最終章では平均申告金額とも比べて、さらに絞り込んでいきます。`,
        clearFeedback: {
            dialogue: "上司：容量が大きく足りない取引と、その会社名・申告額が見えてきたな。アオバ・マイクロの名前も出てきているぞ。次は最終章だ。平均申告金額とも比べて、決定的な証拠を固めよう！",
            learned: [
                "複数 JOIN：JOIN 〜 ON 〜 を続けて3つの表を結びつける",
                "わかりやすい条件絞り込み：実容量が広告容量の半分未満（/ 2）の取引を抽出する"
            ]
        },
        expectedSql: `SELECT
    Company_Information_Records.company_name,
    USB_Inspection_Records.trade_id,
    USB_Inspection_Records.product_name,
    Import_Records.declared_value
FROM USB_Inspection_Records
JOIN Import_Records
    ON USB_Inspection_Records.trade_id = Import_Records.trade_id
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
WHERE USB_Inspection_Records.actual_capacity < USB_Inspection_Records.advertised_capacity / 2;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "USB検査記録から輸入記録をつなぎ、さらに会社マスターをつないで、実容量が広告容量の半分未満の取引を探します。"
            },
            {
                level: 2,
                type: "構文",
                text: "JOIN 〜 ON 〜 を2回書き、最後に WHERE で実容量 < 広告容量 / 2 と指定します。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Company_Information_Records.company_name,
    Import_Records.trade_id
FROM USB_Inspection_Records
JOIN Import_Records
    ON USB_Inspection_Records.trade_id = Import_Records.trade_id
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
WHERE Import_Records.declared_value > 10000;`
            }
        ],
        dialogue: "上司：三陸フロンティアは登録漏れと切り分けられた。次は複数 JOIN を使って、容量が大きく足りない取引を出している会社と申告額を調べてみよう。",
        group: "💾 第5章：異常取引の分類と照合",
        glossary: {
            title: "複数 JOIN で確認する項目",
            html: `
- <span class='badge'>company_name</span> 取引を行った会社名<br>
- <span class='badge'>trade_id / product_name</span> 取引IDと商品名<br>
- <span class='badge'>declared_value</span> 申告額
            `
        }
    },

    // ==========================================
    // 最終章：隠された取引の全貌（22〜24）
    // ==========================================
    {
        id: 22,
        title: "22. サブクエリで平均申告金額より低い取引を抽出せよ",
        desc: "Import_Records テーブルから、全取引の平均申告金額（AVG(declared_value)）をサブクエリで求め、それより申告額（declared_value）が低い取引の取引ID（trade_id）・会社ID（company_id）・商品名（product_name）・申告額（declared_value）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
SQLの中に別の SELECT 文を入れる書き方を「サブクエリ（副問い合わせ）」と呼びます。

・(SELECT AVG(declared_value) FROM Import_Records)：全体の平均申告金額を計算するサブクエリ
・WHERE declared_value < (...)：平均申告金額より低い取引だけを絞り込む

「そもそも、この金額や数量は通常の取引と比べてどれほど異常なのか？」を基準値（平均）と比べることで、極端に低い取引を浮かび上がらせることができます。`,
        clearFeedback: {
            dialogue: "上司：平均申告金額より極端に低い取引が見えてきたな。次は金額だけでなく、数量のズレやUSB容量の異常とも照らし合わせて絞り込んでみよう。",
            learned: [
                "サブクエリ：(SELECT ...) のように条件の中で別の集計結果を求める書き方",
                "通常との比較：全体の平均値と比べることで、不自然な金額の取引を特定する"
            ]
        },
        expectedSql: `SELECT
    trade_id,
    company_id,
    product_name,
    declared_value
FROM Import_Records
WHERE declared_value < (
    SELECT AVG(declared_value)
    FROM Import_Records
);`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "まずは全体の平均申告金額をカッコ内の SELECT 文で計算し、それより申告額が小さい取引を探します。"
            },
            {
                level: 2,
                type: "構文",
                text: "WHERE 金額カラム < (SELECT AVG(金額カラム) FROM テーブル名) のようにサブクエリを書きます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    trade_id,
    declared_value
FROM Import_Records
WHERE declared_value > (
    SELECT AVG(declared_value)
    FROM Import_Records
);`
            }
        ],
        dialogue: "上司：そもそも、この金額や数量は通常の取引と比べてどれほど異常なのか？ サブクエリを使って平均申告金額より低い取引を抜き出してみよう。",
        group: "🎯 最終章：隠された取引の全貌",
        glossary: {
            title: "サブクエリで使う項目と構文",
            html: `
- <span class='badge'>サブクエリ</span> (SELECT ...) の形で条件内に組み込む問い合わせ<br>
- <span class='badge'>AVG(declared_value)</span> 平均申告金額を計算する集計関数<br>
- <span class='badge'>declared_value</span> 比較対象となる申告額
            `
        }
    },
    {
        id: 23,
        title: "23. 金額・数量・USB容量の異常を照合して絞り込め",
        desc: "Import_Records・Company_Information_Records・Customs_Inspection_Records・USB_Inspection_Records を結びつけ、平均申告金額より低く、かつ検査数量が申告数量未満で、さらにUSB実容量が広告容量の50%未満である取引の会社名（company_name）・取引ID（trade_id）・商品名（product_name）・申告額（declared_value）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
これまで学んだ JOIN・サブクエリ・AND 条件を組み合わせ、複数の異常が重なる取引を絞り込みます。

・JOIN で会社情報・税関検査記録・USB容量検査記録を取引IDや会社IDでつなぐ
・declared_value < (SELECT AVG(declared_value) FROM Import_Records)：平均申告金額より低い
・inspected_quantity < declared_quantity：検査数量が申告数量より少ない（数量の不一致・不足）
・actual_capacity < advertised_capacity * 0.5：USB容量が広告容量の50%未満（重大な異常）

金額・数量・容量の異常がすべて重なる取引を特定しましょう。`,
        clearFeedback: {
            dialogue: "上司：金額・数量・容量の異常が重なる取引が絞り込めたな。いよいよ最後の最終調査報告だ！",
            learned: [
                "複数テーブルの結合と条件の組み合わせ：金額・数量・容量の証拠を1つの条件で照合する",
                "サブクエリと通常条件の併用：平均との比較に、数量や容量の異常条件を重ねる"
            ]
        },
        expectedSql: `SELECT
    Company_Information_Records.company_name,
    Import_Records.trade_id,
    Import_Records.product_name,
    Import_Records.declared_value
FROM Import_Records
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
JOIN USB_Inspection_Records
    ON Import_Records.trade_id = USB_Inspection_Records.trade_id
WHERE Import_Records.declared_value < (
    SELECT AVG(declared_value)
    FROM Import_Records
)
  AND Customs_Inspection_Records.inspected_quantity < Customs_Inspection_Records.declared_quantity
  AND USB_Inspection_Records.actual_capacity < USB_Inspection_Records.advertised_capacity * 0.5;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "輸入記録を中心に会社・税関検査・USB検査をつなぎ、平均より低い申告額・数量不足・USB容量の重大な異常をすべて満たす取引を探します。"
            },
            {
                level: 2,
                type: "構文",
                text: "複数の JOIN 〜 ON 〜 でつないだあと、WHERE でサブクエリ比較と複数の条件を AND で結びます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Company_Information_Records.company_name,
    Import_Records.trade_id
FROM Import_Records
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Import_Records.declared_value < (
    SELECT AVG(declared_value)
    FROM Import_Records
)
  AND Customs_Inspection_Records.inspected_quantity = Customs_Inspection_Records.declared_quantity;`
            }
        ],
        dialogue: "上司：平均申告金額との比較だけでなく、数量の不一致やUSB容量の異常もあわせて確認しよう。複数の証拠を照合して怪しい取引を絞り込むんだ。",
        group: "🎯 最終章：隠された取引の全貌",
        glossary: {
            title: "複数証拠を照合するテーブルと条件",
            html: `
- <span class='badge'>Company_Information_Records</span> 会社名<br>
- <span class='badge'>Customs_Inspection_Records</span> 申告数量・検査数量<br>
- <span class='badge'>USB_Inspection_Records</span> 広告容量・実容量<br>
- <span class='badge'>サブクエリ + AND</span> 平均金額との比較と各異常条件の組み合わせ
            `
        }
    },
    {
        id: 24,
        title: "24. 最終調査報告：疑わしい取引と会社を特定せよ",
        desc: "Import_Records を基準に Company_Information_Records を JOIN、Customs_Inspection_Records を LEFT JOIN、USB_Inspection_Records を JOIN し、平均申告金額より低く、かつ（税関検査記録が存在しない、または検査数量が申告数量未満）で、USB実容量が広告容量の50%未満である取引の会社名（company_name）・所在地（address）・取引ID（trade_id）・申告額（declared_value）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
最終調査報告として、途中の三陸フロンティア（T008）のような未検査（LEFT JOIN + IS NULL）や数量不足も含め、金額・数量・容量の証拠を総合して疑わしい取引と本命の企業（アオバ・マイクロ）を特定します。

・JOIN Company_Information_Records：会社名と所在地を取得する
・LEFT JOIN Customs_Inspection_Records：未検査（NULL）の取引も逃さず残す
・JOIN USB_Inspection_Records：USB容量の検査結果と結びつける
・WHERE ...：平均申告金額より低く、未検査または数量不足で、USB容量が50%未満の取引に絞る

金額、数量、容量。それぞれ別々に見えていた異常が、ひとつの取引関係としてつながります。`,
        clearFeedback: {
            dialogue: "上司：なるほど……！ 途中の検査記録の抜けに惑わされず、金額・数量・容量の証拠をつないだことで、本命のアオバ・マイクロが見えてきたな。よくやった、調査完了だ！",
            learned: [
                "総合分析：SELECT / WHERE / GROUP BY / HAVING / JOIN / CASE WHEN / サブクエリの集大成",
                "全体像の解明：断片的な異常を結びつけ、疑わしい取引と本命の企業を特定する調査フロー"
            ]
        },
        expectedSql: `SELECT
    Company_Information_Records.company_name,
    Company_Information_Records.address,
    Import_Records.trade_id,
    Import_Records.declared_value
FROM Import_Records
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
JOIN USB_Inspection_Records
    ON Import_Records.trade_id = USB_Inspection_Records.trade_id
WHERE Import_Records.declared_value < (
    SELECT AVG(declared_value)
    FROM Import_Records
)
  AND (
        Customs_Inspection_Records.trade_id IS NULL
     OR Customs_Inspection_Records.inspected_quantity < Customs_Inspection_Records.declared_quantity
  )
  AND USB_Inspection_Records.actual_capacity < USB_Inspection_Records.advertised_capacity * 0.5;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "平均申告金額より低い取引のうち、未検査（IS NULL）または数量不足があり、さらにUSB容量が50%未満になっている取引の会社情報と取引情報をまとめます。"
            },
            {
                level: 2,
                type: "構文",
                text: "LEFT JOIN で検査記録をつなぎ、IS NULL と数量条件を ( ... OR ... ) でまとめて、サブクエリや容量条件と AND でつなぎます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Company_Information_Records.company_name,
    Import_Records.trade_id
FROM Import_Records
JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Import_Records.declared_value < (
    SELECT AVG(declared_value)
    FROM Import_Records
)
  AND (
        Customs_Inspection_Records.trade_id IS NULL
     OR Customs_Inspection_Records.inspected_quantity = Customs_Inspection_Records.declared_quantity
  );`
            }
        ],
        dialogue: "上司：すべての調査結果をまとめ、疑わしい取引と本命の会社を特定しよう。最終調査報告を頼む！",
        group: "🎯 最終章：隠された取引の全貌",
        glossary: {
            title: "最終調査報告の重要ポイント",
            html: `
- <span class='badge'>LEFT JOIN + IS NULL / OR</span> 未検査取引や数量不足を逃さない条件<br>
- <span class='badge'>サブクエリ（AVG）</span> 通常の平均申告金額との比較<br>
- <span class='badge'>総合分析</span> 金額・数量・容量の異常をつなぐ最終確認
            `
        }
    },
];
