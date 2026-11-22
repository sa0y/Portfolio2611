const missions = [
    {
        id: 0,
        title: "プロローグ：押収資料の全体把握",
        desc: "テックゲート港で押収された資料タブを切り替え、各テーブルの全体像と共通IDを確認せよ。",
        isBriefing: true,
        dialogue: "主任監査官：テックゲート港の取引データに不審な影がある。まずは押収した資料を『全部見せ』で確認しよう。どんな表があり、どの項目があるかを頭に入れておくんだ。",
        explanation: `捜査の第一歩は、資料の中身を丸ごと確認することです。

・まずは各タブを押して、どんな列（カラム）があるか見てみましょう。
・表どうしをつなぐ手がかりになる「共通のID（company_id や trade_id）」にも目を向けておきます。

確認が終わったら、「資料の確認を完了する」ボタンを押して捜査に進みましょう。`,
        expectedSql: "",
        hints: [
            "【ヒント1】まずは「会社情報」や「輸入記録」などのタブをクリックして、表の中身を見てみましょう。",
            "【ヒント2】「輸入記録」にある company_id や trade_id が、ほかの表とどうつながっているか意識してみてください。",
            "【ヒント3】資料を確認したら、「資料の確認を完了する」ボタンを押して進みましょう。"
        ],
        group: "🌱 プロローグ：事件資料の確認",
        glossary: {
            title: "序章1で確認する資料",
            html: `
- <span class="badge">Company_Information_Records</span> 会社情報（company_id / company_name / address）<br>
- <span class="badge">Import_Records</span> 輸入・取引記録（trade_id / company_id / model_number / quantity / declared_value）<br>
- <span class="badge">Customs_Inspection_Records</span> 税関検査記録（trade_id / declared_quantity / inspected_quantity）<br>
- <span class="badge">Port_Trade_Records</span> 港湾地域別取引記録（trade_id / region / declared_value）
            `
        }
    },
    // ==========================================
    // 第1章：不審な輸入取引の発見（01〜04）
    // ==========================================
    {
        id: 1,
        title: "01. 輸入記録の全体像を把握せよ",
        desc: "Import_Records テーブルの全データを取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
SELECT * FROM テーブル名; は、指定したテーブルのすべての列とすべての行を取得する基本のSQLです。

・SELECT *：すべての列を取り出す
・FROM テーブル名：どのテーブルから取るか指定する
・（末尾の ; はあってもなくても大丈夫です）

まずはどんな項目やデータが入っているか、全体を見渡しましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：よし、輸入取引記録の全体像が見えてきたな。次は怪しい型番に絞って調べてみよう。",
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
                text: "今回は特定の条件で絞り込まず、テーブルに保存されている情報をすべて確認します。"
            },
            {
                level: 2,
                type: "構文",
                text: "すべての列を取得するには SELECT * を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT * FROM 対象テーブル の型に当てはめてみましょう（末尾の ; はあってもなくても大丈夫です）。"
            }    
        ],
        dialogue: "主任監査官：まずは押収された輸入取引データを出して、どんな項目や記録が入っているか全体を確認してみよう。",
        group: "🔍 第1章：不審な輸入取引の発見",
        glossary: {
            title: "対象テーブル・カラム",
            html: "• <span class='badge'>Import_Records</span> 輸入・取引記録の全データ（すべての列）"
        }
    },
    {
        id: 2,
        title: "02. 異常な型番の記録を絞り込め",
        desc: "Import_Records テーブルから、型番（model_number）が「CT-400」の記録だけを取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
WHERE 句を使うと、条件に合う行だけを絞り込めます。

・WHERE model_number = 'CT-400'：型番が CT-400 の行だけを選ぶ

文字列を指定するときは、シングルクォーテーション（' '）で囲むのがポイントです。`,
        clearFeedback: {
            dialogue: "主任監査官：CT-400 の記録を特定できたな。次は取引の金額や数量に不自然な点がないか確認しよう。",
            learned: [
                "WHERE：条件でデータを絞り込む",
                "=：値が一致するか比較する",
                "'CT-400'：文字列を指定する（シングルクォーテーションで囲む）"
            ]
        },
        expectedSql: "SELECT * FROM Import_Records WHERE model_number = 'CT-400';",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "今回は特定の型番に一致する記録だけを調べます。条件を指定してデータを絞り込みましょう。"
            },
            {
                level: 2,
                type: "構文",
                text: "条件で絞り込むには WHERE 句を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE 型番のカラム = '対象の型番' と指定します。"
            }
        ],
        dialogue: "主任監査官：現場の箱に『CT-400』という型番が印字されていたという連絡が入った。まずはその型番の取引記録だけを絞り込んで見てみよう。",
        group: "🔍 第1章：不審な輸入取引の発見",
        glossary: {
            title: "対象カラムの意味",
            html: "• <span class='badge'>model_number</span> 製品の型番"
        }
    },
    {
        id: 3,
        title: "03. 取引金額と数量の不自然さを暴け",
        desc: "Import_Records テーブルから、型番（model_number）が「CT-400」の記録を、申告額（declared_value）が安い順（昇順）に並べよ。",
        orderSensitive: true,
        explanation: `【解説】
ORDER BY 列名 を使うと、指定した列の値が小さい順（昇順・安い順）に並べ替えられます。

・ORDER BY declared_value：申告額が安い順に並べる
・※ ASC をつけて ORDER BY declared_value ASC と書いても同じ意味になります

まずはすべての列（*）を表示したまま、数量と申告額を見比べて不自然に安い取引がないか確認しましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：やはり C001 の取引は、数量に対して申告額が不自然に低いぞ。C001 の最新の動きを追ってみよう。",
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
                text: "02で作った「CT-400を絞り込むSQL」の後ろに、申告額が安い順に並べる命令を足します。"
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
FROM Import_Records
WHERE model_number = 'CT-400'
ORDER BY declared_value;
の形を試してみましょう。`
            }
        ],
        dialogue: "主任監査官：CT-400 の取引を申告額が安い順に並べてみよう。ほかの企業と比べて、数量に対して申告額が不自然に低い取引がないか確認するんだ。",
        group: "🔍 第1章：不審な輸入取引の発見",
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
        title: "04. ターゲット企業の最新動向を追え",
        desc: "Import_Records テーブルから、会社ID（company_id）が「C001」かつ型番（model_number）が「CT-400」の取引を対象に、申告日（declaration_date）が最も新しい記録を1件取得せよ。",
        orderSensitive: true,
        explanation: `【解説】
複数条件の組み合わせ、降順並び替え、件数制限を組み合わせて「最新の1件」を取り出します。

・AND：2つの条件を両方満たす行に絞る
・ORDER BY declaration_date DESC：新しい日付が上に来るよう並べる
・LIMIT 1：先頭の1件だけを取得する`,
        clearFeedback: {
            dialogue: "主任監査官：C001 の最新取引を確認できたな。次は税関の検査記録と照らし合わせて矛盾を探ろう。",
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
                text: "今回は会社IDと型番の2つの条件を満たす記録を探し、その中から最新の1件を取得します。"
            },
            {
                level: 2,
                type: "構文",
                text: "複数条件には AND、新しい順の並び替えには DESC、取得件数の制限には LIMIT を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: `WHERE 条件1
  AND 条件2
ORDER BY 申告日のカラム DESC
LIMIT 1
の型に当てはめてみましょう。`
            }
        ],
        dialogue: "主任監査官：会社ID『C001』の取引は申告額が低く目立つね。C001 の CT-400 取引のうち、申告日が最も新しい記録を1件だけ出して最新の動向を確認しよう。",
        group: "🔍 第1章：不審な輸入取引の発見",
        glossary: {
            title: "対象カラムの意味",
            html: `
- <span class='badge'>company_id</span> 会社ID（'C001'を指定）<br>
- <span class='badge'>declaration_date</span> 申告日（並び替えに利用）
            `
        }
    },

    // ==========================================
    // 第2章：税関検査の矛盾（05〜08）
    // ==========================================
    {
        id: 5,
        title: "05. 数量が一致しない貨物を探せ",
        desc: "Customs_Inspection_Records テーブルから、申告数量（declared_quantity）と実際の検査数量（inspected_quantity）が一致しない記録をすべて取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "!="],
        difficulty: 2,
        explanation: `【解説】
!=（または <>）を使うと、2つの値が「等しくない」行を取り出せます。

・declared_quantity != inspected_quantity：申告数量と検査数量が違う行を探す

まずは一致していない記録を洗い出して、どんなズレがあるか見てみましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：申告数量と検査数量が一致していない記録を発見できたな。単なる入力ミスなのか、それとも意図的な数量のごまかしなのか。次は数量が不足している記録に絞ってみよう。",
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
                text: "今回は申告数量と実際の検査数量を比較し、2つの数値が異なる記録を探します。"
            },
            {
                level: 2,
                type: "構文",
                text: "2つの値が等しくないことを判定するには != 演算子を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE 比較元 != 比較先 と指定します。"
            }
        ],
        dialogue: "主任監査官：C001の動きが気になるところだ。今度は税関の検査記録を確認して、申告数量と実際の検査数量が一致していない記録を探してみよう。",
        group: "📦 第2章：税関検査の矛盾",
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
        title: "06. 数量不足の貨物を特定せよ",
        desc: "Customs_Inspection_Records テーブルから、実際の検査数量（inspected_quantity）が申告数量（declared_quantity）を下回っている記録だけを取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "<"],
        difficulty: 2,
        explanation: `【解説】
< を使うと、左側の値が右側の値より「小さい」行を絞り込めます。

・inspected_quantity < declared_quantity：検査数量が申告数量より少ない行を探す

書類上の数より実際の数が少ない記録だけを抜き出してみましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：申告数量より実際の検査数量が少ない貨物が見つかったな。次は、それぞれの貨物で何個不足しているのか計算してみよう。",
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
                text: "申告された数量よりも、実際に検査した数量が少ない記録を探しましょう。"
            },
            {
                level: 2,
                type: "構文",
                text: "左側の値が右側の値より小さいことを判定するには < 演算子を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE 比較元 < 比較先 と指定します。"
            }
        ],
        dialogue: "主任監査官：今度は検査数量が申告数量より少ない、つまり数量が不足している記録だけに絞り込んで確認してみよう。",
        group: "📦 第2章：税関検査の矛盾",
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
        title: "07. 消えた荷物の数を計算せよ",
        desc: "Customs_Inspection_Records テーブルから、取引ID（trade_id）と、申告数量から検査数量を引いた不足数を missing_quantity という名前で取得せよ。",
        orderSensitive: false,
        concept: ["SELECT", "-", "AS"],
        difficulty: 3,
        explanation: `【解説】
SQLでは列同士を引き算し、その結果に AS で別名を付けられます。

・declared_quantity - inspected_quantity：不足数を計算する
・AS missing_quantity：計算結果の列名を missing_quantity にする

計算結果に名前を付けておくと、あとから見やすくなります。`,
        clearFeedback: {
            dialogue: "主任監査官：不足数を一覧にできたな。中にはかなり大量の数量が不足している貨物もあるようだ。次は特に不足数が大きい記録を調べよう。",
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
                text: "今回は申告数量から実際の検査数量を引き算し、貨物ごとの不足数を計算します。"
            },
            {
                level: 2,
                type: "構文",
                text: "数値の引き算には - を使います。また、計算結果に名前を付けるには AS を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT ○○, 数値列1 - 数値列2 AS missing_quantity FROM 対象テーブル; の形にします。"
            }
        ],
        dialogue: "主任監査官：それぞれの記録で、申告数量と検査数量の差を計算して一覧にしてみよう。実際に何個不足しているのかを把握するんだ。",
        group: "📦 第2章：税関検査の矛盾",
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
        title: "08. 大量の数量不足が発生した貨物を特定せよ",
        desc: "Customs_Inspection_Records テーブルから、実際の検査数量（inspected_quantity）が申告数量（declared_quantity）を下回り、さらに申告数量と検査数量の差が200個以上ある記録をすべて取得せよ。",
        orderSensitive: false,
        concept: ["WHERE", "AND", "()", ">=", "-"],
        difficulty: 3,
        explanation: `【解説】
2つの条件を AND でつなぎ、それぞれを ( ) で囲んで分かりやすくします。

・(inspected_quantity < declared_quantity)：検査数量が申告数量より少ない
・(declared_quantity - inspected_quantity >= 200)：不足数が200個以上

両方満たす行だけを絞り込み、大きな不足が起きている貨物を特定しましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：申告数量と検査数量に大きな食い違いがある貨物を発見できたな。しかし、気になることがある。検査された貨物にこれだけの数量の矛盾があるなら、そもそも税関の検査記録すら存在しない貨物もあるのではないか？ 次は港湾ルートの動きを追ってみよう。",
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
                text: "今回は2つの条件を両方満たす貨物を探します。まずは数量が不足している条件を考えましょう。"
            },
            {
                level: 2,
                type: "構文",
                text: "条件を2つ用意し、AND でつなぎます。それぞれの条件は ( ) で囲みましょう。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE (条件1) AND (条件2) の形にします。"
            }
        ],
        dialogue: "主任監査官：不足数が200個以上になっている記録もあるようだ。まずは数量の差が特に大きい貨物を絞り込んで確認してみよう。",
        group: "📦 第2章：税関検査の矛盾",
        glossary: {
            title: "今回覚える構文・カラム",
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
    // 第3章：不正ルートの追跡（09〜12）
    // ==========================================
    {
        id: 9,
        title: "09. 大口取引があった港湾エリアを特定せよ",
        desc: "Port_Trade_Records テーブルから、申告額（declared_value）が 100000000（1億円）以上の取引がある港湾地域（region）を重複なしで取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
WHERE で条件を絞り込んだあと、SELECT DISTINCT を使うと「その条件に当てはまる地域の種類」だけを重複なく取り出せます。

・WHERE declared_value >= 100000000：1億円以上の取引に絞る
・SELECT DISTINCT region：該当する港湾地域の重複をなくして一覧表示する

大口取引がどの港湾エリアに集中しているか確認しましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：1億円以上の取引がある港湾エリアが絞れたな。次は地域ごとの取引件数を数えてみよう。",
            learned: [
                "SELECT DISTINCT 列名：重複を除いて一意の値を取得する",
                "WHERE と DISTINCT の組み合わせ：条件に合うデータの種類を絞り込む"
            ]
        },
        expectedSql: "SELECT DISTINCT region FROM Port_Trade_Records WHERE declared_value >= 100000000;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "すべての地域ではなく、「申告額が1億円以上」という条件に合う取引の地域だけを重複なしで出します。"
            },
            {
                level: 2,
                type: "構文",
                text: "重複を除くには DISTINCT、条件で絞り込むには WHERE と >= を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT DISTINCT 地域列名 FROM 対象テーブル WHERE 金額列名 >= 基準額; の型を試してみましょう。"
            }
        ],
        dialogue: "主任監査官：まずは大口取引の動きを掴みたい。申告額が1億円以上の取引がある港湾地域を、重複なしで一覧にしてみよう。",
        group: "🚢 第3章：不正ルートの追跡",
        glossary: {
            title: "対象カラムの意味",
            html: `
- <span class='badge'>region</span> 通過した港湾地域名<br>
- <span class='badge'>declared_value</span> 申告額（100000000＝1億円以上で判定）
            `
        }
    },
    {
        id: 10,
        title: "10. 地域ごとの取扱件数を集計せよ",
        desc: "Port_Trade_Records テーブルから、地域（region）ごとにグループ化し、地域名と各地域の取引件数（別名：trade_count）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
GROUP BY で同じ値ごとにまとめ、COUNT(*) で各グループの件数を数えます。

・GROUP BY region：地域ごとにグループ化する
・COUNT(*) AS trade_count：グループごとの件数を trade_count という名前で出す

SELECT に書くグループ化していない列は、基本的に GROUP BY にも指定します。`,
        clearFeedback: {
            dialogue: "主任監査官：地域ごとの取引件数が把握できたな。次は申告額の合計も地域ごとに確認してみよう。",
            learned: [
                "GROUP BY 列名：指定した列の値ごとにグループ化する",
                "COUNT(*)：各グループの行数を数える",
                "AS 別名：集計結果に列名（エイリアス）を付ける"
            ]
        },
        expectedSql: "SELECT region, COUNT(*) AS trade_count FROM Port_Trade_Records GROUP BY region;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "地域ごとにデータをひとまとめにし、それぞれの地域で何件の取引があるかを数えます。"
            },
            {
                level: 2,
                type: "構文",
                text: "グループ化には GROUP BY、件数の集計には COUNT(*)、別名付けには AS を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT グループ化する列名, COUNT(*) AS trade_count FROM 対象テーブル GROUP BY グループ化する列名; の型に当てはめてみましょう。"
            }
        ],
        dialogue: "主任監査官：次は地域ごとの取引件数を数えてみよう。GROUP BY で地域ごとにまとめて件数を出してほしい。",
        group: "🚢 第3章：不正ルートの追跡",
        glossary: {
            title: "対象カラム・関数の意味",
            html: `
- <span class='badge'>region</span> 地域名（グループ化の基準）<br>
- <span class='badge'>COUNT(*)</span> 各グループの件数を数える関数<br>
- <span class='badge'>AS</span> 集計結果に別名を付けるキーワード
            `
        }
    },
    {
        id: 11,
        title: "11. 地域ごとの申告額を集計せよ",
        desc: "Port_Trade_Records テーブルから、地域（region）ごとにグループ化し、地域名と各地域の申告額の合計（別名：total_value）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
件数ではなく金額を合計したいときは、COUNT(*) の代わりに SUM(列名) を使います。

・SUM(declared_value) AS total_value：地域ごとの申告額の合計を計算する
・GROUP BY region：地域ごとにまとめる

件数とあわせて金額の偏りも確認してみましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：地域ごとの申告額の合計も見えてきたな。次は取引件数が多い主要拠点を絞り込んでみよう。",
            learned: [
                "SUM(列名)：グループごとの数値を合計する",
                "GROUP BY 列名：合計を計算する単位（グループ）を指定する"
            ]
        },
        expectedSql: "SELECT region, SUM(declared_value) AS total_value FROM Port_Trade_Records GROUP BY region;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "件数ではなく、各地域で申告された金額の合計を計算します。"
            },
            {
                level: 2,
                type: "構文",
                text: "合計を求めるには SUM(列名) を使い、GROUP BY で地域ごとにまとめます。"
            },
            {
                level: 3,
                type: "具体例",
                text: "SELECT グループ化する列名, SUM(合計する列名) AS total_value FROM 対象テーブル GROUP BY グループ化する列名; の型に当てはめてみましょう。"
            }
        ],
        dialogue: "主任監査官：取引件数に加えて、地域ごとの申告額の合計も見ておきたいね。SUM を使って合計金額を出してみよう。",
        group: "🚢 第3章：不正ルートの追跡",
        glossary: {
            title: "対象カラム・関数の意味",
            html: `
- <span class='badge'>region</span> 地域名（グループ化の基準）<br>
- <span class='badge'>declared_value</span> 個々の取引の申告額<br>
- <span class='badge'>SUM()</span> 各グループの金額を合計する関数<br>
- <span class='badge'>AS</span> 集計結果に別名を付けるキーワード
            `
        }
    },
    {
        id: 12,
        title: "12. 密輸のハブ拠点を発見せよ",
        desc: "Port_Trade_Records テーブルから、地域（region）ごとに取引件数（別名：trade_count）を集計し、200件以上の地域だけを対象に、取引件数が多い順（降順）に並べよ。",
        orderSensitive: true,
        explanation: `【解説】
集計した結果に条件を付けるときは WHERE ではなく HAVING を使います。

・HAVING COUNT(*) >= 200：集計後の件数が200件以上のグループに絞る
・ORDER BY trade_count DESC：件数が多い順（降順）に並べる

「行を絞る WHERE」「集計後を絞る HAVING」の違いを押さえましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：取引件数が特に多い拠点がはっきりしたな。次は押収されたストレージ機器の検査記録を調べてみよう。",
            learned: [
                "HAVING 条件：GROUP BY で集計した後の結果に条件を付ける",
                "ORDER BY 列名 DESC：降順（大きい順・多い順）に並べ替える"
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
                text: "地域ごとの件数を出したあと、一定件数以上の地域だけに絞り込み、多い順に並べます。"
            },
            {
                level: 2,
                type: "構文",
                text: "集計結果の絞り込みには HAVING、多い順の並び替えには ORDER BY と DESC を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: `GROUP BY 地域列名
HAVING COUNT(*) >= 基準件数
ORDER BY trade_count DESC
の型に当てはめてみましょう。`
            }
        ],
        dialogue: "主任監査官：最後に、取引件数が200件以上ある地域だけを絞り込んで、多い順に並べてみよう。件数の多い拠点を整理しておこう。",
        group: "🚢 第3章：不正ルートの追跡",
        glossary: {
            title: "対象カラム・句の意味",
            html: `
- <span class='badge'>region</span> 地域名<br>
- <span class='badge'>COUNT(*)</span> 地域ごとの取引件数<br>
- <span class='badge'>HAVING</span> 集計後の条件指定<br>
- <span class='badge'>ORDER BY</span> 結果の並び替え<br>
- <span class='badge'>DESC</span> 降順（大きい順）
            `
        }
    },

    // ==========================================
    // 第4章：偽装USBの証拠（13〜18）
    // ==========================================
    {
        id: 13,
        title: "13. USB関連の検査記録を網羅せよ",
        desc: "Usb_inspection_Records テーブルから、商品名（product_name）に「USB」を含む記録をすべて取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
LIKE と % を使うと、文字列の一部が含まれるデータを検索できます。

・LIKE '%USB%'：商品名の中に「USB」が含まれる行を探す

% は「0文字以上のどんな文字」を表すワイルドカードです。`,
        clearFeedback: {
            dialogue: "主任監査官：USB 関連の検査記録が一覧できたな。次は特定の容量範囲に絞って確認してみよう。",
            learned: [
                "LIKE：パターン（部分一致など）で文字列を検索する",
                "%：0文字以上の任意の文字列を表すワイルドカード"
            ]
        },
        expectedSql: "SELECT * FROM Usb_inspection_Records WHERE product_name LIKE '%USB%';",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "商品名の中に特定の文字列が含まれている記録を部分一致で探します。"
            },
            {
                level: 2,
                type: "構文",
                text: "部分一致検索には LIKE と %（ワイルドカード）を組み合わせます。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE 商品名のカラム LIKE '%検索文字%' と指定します。"
            }
        ],
        dialogue: "主任監査官：商品名に『USB』が含まれる検査記録を抽出して、対象データを一覧で確認してみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "対象カラムの意味",
            html: "• <span class='badge'>product_name</span> 商品名（一部一致の検索対象）"
        }
    },
    {
        id: 14,
        title: "14. 大容量モデルの不正を追跡せよ",
        desc: "Usb_inspection_Records テーブルから、表示容量（advertised_capacity）が 256 から 1024 までの記録をすべて取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
BETWEEN 値1 AND 値2 を使うと、指定した範囲内（両端の値を含む）のデータを絞り込めます。

・advertised_capacity BETWEEN 256 AND 1024：表示容量が256〜1024（256GB〜1TB）の行を探す

>= と <= をANDでつなぐのと同じ意味を、短く書けます。`,
        clearFeedback: {
            dialogue: "主任監査官：256〜1024 の大容量範囲に絞れたな。次は表示容量に対して実測容量がどれくらいの割合か計算してみよう。",
            learned: [
                "BETWEEN 値1 AND 値2：値1以上〜値2以下の範囲内のデータを取得する",
                "advertised_capacity：パッケージなどに表示されている容量"
            ]
        },
        expectedSql: "SELECT * FROM Usb_inspection_Records WHERE advertised_capacity BETWEEN 256 AND 1024;",
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "表示容量が指定した下限（256）から上限（1024）までの範囲に入っている記録を絞り込みます。"
            },
            {
                level: 2,
                type: "構文",
                text: "範囲指定には BETWEEN 〜 AND 〜 を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: "WHERE 数値カラム BETWEEN 下限 AND 上限 と指定します。"
            }
        ],
        dialogue: "主任監査官：表示容量が256から1024までの大容量記録に絞って確認してみよう。範囲指定の使い方に慣れていこう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "対象カラムの意味",
            html: "• <span class='badge'>advertised_capacity</span> 表示容量（範囲指定の対象）"
        }
    },
    {
        id: 15,
        title: "15. 実容量の割合を算出せよ",
        desc: "Usb_inspection_Records テーブルから、商品名（product_name）と、実測容量の割合を小数第1位まで四捨五入し、別名：capacity_rate として取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
ROUND(計算式, 1) を使うと、計算結果を小数第1位までに四捨五入できます。

・actual_capacity * 100.0 / advertised_capacity：実測容量の割合（％）を計算する
・ROUND(..., 1) AS capacity_rate：小数第1位に丸めて capacity_rate と名付ける

100.0 のように小数点をつけると、割り算で小数が切り捨てられずに計算できます。`,
        clearFeedback: {
            dialogue: "主任監査官：実測容量の割合が算出できたな。次は条件によって表示ラベルを分ける CASE WHEN を学んでみよう。",
            learned: [
                "ROUND(値, 桁数)：数値を指定した小数桁数に四捨五入する",
                "100.0：小数計算を行うための数値（整数除算の切り捨て防止）"
            ]
        },
        expectedSql: `SELECT
    product_name,
    ROUND(actual_capacity * 100.0 / advertised_capacity, 1) AS capacity_rate
FROM Usb_inspection_Records;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "実測容量が表示容量の何％にあたるかを計算し、小数第1位までに丸めます。"
            },
            {
                level: 2,
                type: "構文",
                text: "四捨五入には ROUND(計算式, 1) を使い、AS で列名を付けます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    商品名のカラム,
    ROUND(分子 * 100.0 / 分母, 1) AS capacity_rate
FROM 対象テーブル;
の型に当てはめてみましょう。`
            }
        ],
        dialogue: "主任監査官：解析チームから『Usb_inspection_Records（USB容量検査記録）』のデータが追加された。表示容量に対して実測容量が何％になっているか計算して確認してみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "対象カラムの意味（追加されたUSB検査ログ）",
            html: `
- <span class='badge'>usb_id</span> USB検査ID<br>
- <span class='badge'>trade_id</span> 取引ID<br>
- <span class='badge'>product_name</span> 商品名<br>
- <span class='badge'>advertised_capacity</span> 表示容量<br>
- <span class='badge'>actual_capacity</span> 実測容量
            `
        }
    },
    {
        id: 16,
        title: "16. 大容量モデルとそれ以外で割合条件を分けて抽出せよ",
        desc: "Usb_inspection_Records テーブルから、大容量モデル（256〜1024）は割合50.0未満、256未満は割合20.0未満となる記録を ( ... AND ... ) OR ( ... AND ... ) で取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
14番で注目した大容量モデル（256〜1024）と、それより小さいモデル（256未満）で、割合の基準を変えて抽出する例です。

・(advertised_capacity BETWEEN 256 AND 1024 AND ROUND(actual_capacity * 100.0 / advertised_capacity, 1) < 50.0)：256〜1024で割合50.0%未満
・OR：どちらかの条件グループを満たせば対象にする
・(advertised_capacity < 256 AND ROUND(actual_capacity * 100.0 / advertised_capacity, 1) < 20.0)：256未満で割合20.0%未満

( ... AND ... ) OR ( ... AND ... ) で囲むことで、条件のまとまりがはっきりします。`,
        clearFeedback: {
            dialogue: "主任監査官：大容量モデル（256〜1024）とそれ以外で、怪しい記録を絞り込めたな。次はアドバンス・プロローグで CASE WHEN の書き方を練習してみよう。",
            learned: [
                "WHERE での計算式利用：ROUND(actual_capacity * 100.0 / advertised_capacity, 1) を条件に組み込む",
                "( ... AND ... ) OR ( ... AND ... )：条件グループごとに基準を変えて OR でつなぐ"
            ]
        },
        expectedSql: `SELECT *
FROM Usb_inspection_Records
WHERE (advertised_capacity BETWEEN 256 AND 1024 AND ROUND(actual_capacity * 100.0 / advertised_capacity, 1) < 50.0)
   OR (advertised_capacity < 256 AND ROUND(actual_capacity * 100.0 / advertised_capacity, 1) < 20.0);`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "14番で見た大容量モデル（256〜1024）は割合50.0未満、256未満のモデルは割合20.0未満を基準にして、どちらか一方に当てはまる行を探します。"
            },
            {
                level: 2,
                type: "構文",
                text: "(容量条件 AND ROUND(actual_capacity * 100.0 / advertised_capacity, 1) < 基準値) の形を OR でつなぎます。"
            },
            {
                level: 3,
                type: "型",
                text: `WHERE (advertised_capacity BETWEEN 256 AND 1024 AND 割合の式 < 50.0)
   OR (advertised_capacity < 256 AND 割合の式 < 20.0)`
            }
        ],
        dialogue: "主任監査官：14番で目をつけた大容量モデル（256〜1024）は割合50.0未満、256未満は割合20.0未満を目安に、( ... AND ... ) OR ( ... AND ... ) で怪しい記録を抜き出してみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "今回使う条件と計算式",
            html: `
- <span class='badge'>ROUND(actual_capacity * 100.0 / advertised_capacity, 1)</span> 実測容量の割合（小数第1位）<br>
- <span class='badge'>( ... AND ... )</span> グループ内の条件を両方満たす<br>
- <span class='badge'>OR</span> カッコで囲んだ条件グループのどちらかを満たす
            `
        }
    },
   {
        id: 16.5,
        title: "アドバンス・プロローグ：CASE WHEN で条件分岐を書いてみよう",
        desc: "CASE WHEN 〜 THEN 〜 ELSE 〜 END を使って、実測容量（actual_capacity）が 0 より大きければ「通電OK」、それ以外なら「要確認」と表示する書き方を練習します。",
        isPractice: true,
        explanation: `【CASE WHEN の基本】
CASE WHEN は、「条件に応じて表示する値を作る」ための構文です。
WHERE が「行そのものを減らす（絞り込む）」のに対し、CASE WHEN は「行を残したまま、新しい判定列を追加する」イメージで使います。

CASE WHEN = 条件によって結果を変える命令
    WHEN：もし〇〇なら（例：actual_capacity > 0）
    THEN：△△とする（例：'通電OK'）
    ELSE：それ以外なら□□とする（例：'要確認'）
    END：判定を終了する

まずは実測容量（actual_capacity）が 0 より大きいかで「通電OK」と「要確認」に分ける形を試してみましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：CASE WHEN の基本形が書けたね。次は17番で実際の容量比較に挑戦してみよう。",
            learned: [
                "CASE WHEN 〜 THEN 〜 ELSE 〜 END：条件に応じて表示する値を切り替える",
                "WHERE と CASE WHEN の違い：行を除外するか、行を残して表示を変えるか",
                "AS status：判定結果の列に名前を付ける"
            ]
        },
        expectedSql: `SELECT
    product_name,
    CASE
        WHEN actual_capacity > 0 THEN '通電OK'
        ELSE '要確認'
    END AS status
FROM Usb_inspection_Records;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "行を絞り込むのではなく、すべての行を残したまま実測容量（actual_capacity）に応じた判定列を追加します。"
            },
            {
                level: 2,
                type: "構文",
                text: "CASE WHEN 条件 THEN 成立時の値 ELSE それ以外の値 END AS 列名 の形を使います。"
            },
            {
                level: 3,
                type: "型",
                text: `SELECT
    product_name,
    CASE
        WHEN 判定する条件 THEN '条件に合うときの文字'
        ELSE 'それ以外のときの文字'
    END AS status
FROM Usb_inspection_Records;`
            }
        ],
        dialogue: "主任監査官：まずは条件分岐の基本形を覚えよう。実測容量（actual_capacity）が 0 より大きければ『通電OK』、それ以外なら『要確認』と表示してみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "今回覚える構文・カラム",
            html: `
- <span class='badge'>actual_capacity</span> 判定に使う実測容量カラム<br>
- <span class='badge'>CASE WHEN</span> 条件分岐の開始<br>
- <span class='badge'>THEN</span> 条件成立時の表示<br>
- <span class='badge'>ELSE</span> 条件不成立時の表示<br>
- <span class='badge'>END</span> 条件分岐の終了
            `
        }
    },
    {
        id: 17,
        title: "17. 偽装の深刻度を段階分けせよ",
        desc: "Usb_inspection_Records テーブルから、商品名・表示容量・実測容量と、実測割合が50%未満なら「重大偽装」、それ以外で実測容量が表示容量未満なら「要確認」、それ以外は「正常」とする risk_rank を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
CASE WHEN は WHEN を複数並べることで、深刻度や条件に応じた段階分けができます。

・WHEN actual_capacity * 100.0 / advertised_capacity < 50 THEN '重大偽装'：50%未満を最優先で判定
・WHEN actual_capacity < advertised_capacity THEN '要確認'：50%以上でも表示容量に満たないものを判定
・ELSE '正常'：それ以外（表示容量どおりあるもの）

CASE WHEN は上から順に判定され、最初に当てはまった条件が採用されるのがポイントです。`,
        clearFeedback: {
            dialogue: "主任監査官：複数の WHEN で深刻度を段階分けできたな。次は『重大偽装』に該当する取引IDを抜き出して、どの取引か特定しよう！",
            learned: [
                "複数 WHEN による段階分け：条件の厳しい順・優先度の高い順に並べて判定する",
                "CASE WHEN の評価順：上から順に評価され、最初に一致した THEN が使われる"
            ]
        },
        expectedSql: `SELECT
    product_name,
    advertised_capacity,
    actual_capacity,
    CASE
        WHEN actual_capacity * 100.0 / advertised_capacity < 50 THEN '重大偽装'
        WHEN actual_capacity < advertised_capacity THEN '要確認'
        ELSE '正常'
    END AS risk_rank
FROM Usb_inspection_Records;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "「50%未満」→「表示容量より少ない」→「それ以外」の順に、WHEN を増やして判定します。"
            },
            {
                level: 2,
                type: "構文",
                text: "CASE の中に WHEN 〜 THEN 〜 を複数並べ、最後に ELSE 〜 END AS risk_rank と書きます。"
            },
            {
                level: 3,
                type: "型",
                text: `CASE
    WHEN actual_capacity * 100.0 / advertised_capacity < 50 THEN '重大偽装'
    WHEN actual_capacity < advertised_capacity THEN '要確認'
    ELSE '正常'
END AS risk_rank`
            }
        ],
        dialogue: "主任監査官：実測が半分未満の『重大偽装』だけでなく、表示容量より少ない『要確認』も拾っておこう。WHEN を増やして段階分けしてみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "今回使う CASE WHEN の形",
            html: `
- <span class='badge'>WHEN ... THEN ...</span> 条件に合うときのラベルを指定（上から順に判定）<br>
- <span class='badge'>ELSE ...</span> どの WHEN にも当てはまらないときのラベル
            `
        }
    },
{
  id: 18.5,
    title: "アドバンス・プロローグ：バラバラの情報を trade_id でつなげよう",
 desc: "別々のテーブルにある情報を、共通のカラム（ID）でつなげる考え方を学びます。",
 isPractice: true,
dialogue: "主任監査官：怪しい取引や数量の違い、容量偽装USBなどの手がかりが集まったな。情報は別々のテーブルに分かれているから、共通のIDカラムでつないで全体像を暴くぞ！",
 explanation: `
【第5章の準備：別々のテーブルをつなげよう】

USB検査記録だけでは「どの取引か・どの会社か・税関検査はどうだったか」までは分かりません。
そこで、別々のテーブルにある情報を共通カラムでつなぎます。

■ つなぐための共通カラム
・trade_id カラム（取引ID）：取引どうしをつなぐ共通カラム

■ JOINとONの基本
-- 【メインテーブル】基準になるテーブルを指定
FROM Import_Records

-- 【追加するテーブル】つなげるテーブルを指定
JOIN Customs_Inspection_Records

-- 【つなげる条件】共通カラムが同じ行をつなぐ
ON Import_Records.trade_id
 = Customs_Inspection_Records.trade_id;

確認できたら「資料の確認を完了する」を押して、19番から実際にSQLを書いてみましょう！
`,
expectedSql: `SELECT *
FROM Import_Records
JOIN Customs_Inspection_Records
    ON Import_Records.trade_id
     = Customs_Inspection_Records.trade_id;`,
hints: [
        {
            level: 1,
            type: "共通カラムとは？",
            text: "複数のテーブルに同じ値が入るIDカラム（trade_id や company_id）が、情報をつなぐ目印になります。"
        },
        {
            level: 2,
            type: "結合の書き方",
            text: "FROM の後に基準になる輸入記録、INNER JOIN の後に税関検査記録を書きます。"
        },
        {
            level: 3,
            type: "具体例",
            text: "ON Import_Records.trade_id = Customs_Inspection_Records.trade_id と指定します。"
        }
    ],
    group: "🔗 第5章：関係企業のネットワーク",
    glossary: {
        title: "第5章で覚える基本用語",
        html: `
- <span class="badge">trade_id</span> 取引ごとにつけられたIDカラム（例：T001）<br>
- <span class="badge">JOIN</span> 別々のテーブルをつなげる命令<br>
- <span class="badge">ON</span> つなげる条件（共通カラムの一致）を指定する部分
        `
    }
},
    {
        id: 19,
        title: "19. trade_idで取引記録と税関検査記録をつなぐ",
        desc: "Import_Records テーブルと Customs_Inspection_Records テーブルを trade_id で INNER JOIN し、取引ID（trade_id）を取得せよ。",
        orderSensitive: false,
        explanation: `【JOINの考え方：複数の表を横につなぐ】
これまで1つの表だけを調べてきましたが、輸入記録（Import_Records）と税関検査記録（Customs_Inspection_Records）は別々の表に分かれています。
この2つを「同じ取引ID（trade_id）」を目印に横へ並べてつなぐのが JOIN です。

【基本の書き方】
SELECT テーブル名.カラム名
FROM メインの表
INNER JOIN つなぐ表
    ON メインの表.共通列 = つなぐ表.共通列;

・SELECT Import_Records.trade_id：取り出すカラムを指定します。両方のテーブルに trade_id があるので、「どのテーブルの trade_id か」を テーブル名.カラム名 の形で明示します
・FROM Import_Records：土台にするメインのテーブル
・INNER JOIN Customs_Inspection_Records：つなげるテーブル（両方のテーブルで一致する行をつなぐ）
・ON Import_Records.trade_id = Customs_Inspection_Records.trade_id：どのカラムが同じときに合体させるかのルール
まずは2つの表を trade_id でつなぎ、照合できる取引IDを出してみましょう。迷ったら「JOIN図解を見る」ボタンも開いてみてください。`,
        clearFeedback: {
            dialogue: "主任監査官：初めてのJOIN成功だ！2つの資料を取引IDでつなげる仕組みがわかったな。次は第4章で見つけた容量偽装の取引を、輸入記録とつなぎ合わせてみよう。",
            learned: [
                "JOINの役割：別々の表にある情報を、共通のID（今回は trade_id）で横につなげる",
                "INNER JOIN 〜 ON 〜：両方の表で条件が一致するデータ同士を結びつける"
            ]
        },
        expectedSql: `SELECT
    Import_Records.trade_id
FROM Import_Records
INNER JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "2つの表を「trade_id（取引ID）」が同じもの同士で合体させます。INNER JOIN では両方の表に存在する取引IDがつながります。"
            },
            {
                level: 2,
                type: "構文",
                text: "「どの表の列か」をはっきりさせるため、SELECT の後ろは テーブル名.trade_id と書き、ON の後ろには両方の trade_id が一致する条件を書きます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Import_Records.trade_id
FROM Import_Records
INNER JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id;`
            }
        ],
        dialogue: "主任監査官：ここから『JOIN（表の結合）』の捜査に入るぞ。まずは輸入取引の記録を土台にして、税関検査の記録を trade_id でつなげてみよう。",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: {
            title: "JOINの基本用語",
            html: `
- <span class='badge'>FROM</span> 土台（メイン）にする表<br>
- <span class='badge'>INNER JOIN</span> 共通する行同士をつなぐ結合<br>
- <span class='badge'>ON</span> どの列が一致したらつなぐかの指定<br>
- <span class='badge'>テーブル名.カラム名</span> 複数表を扱うときの列の指定方法
            `
        }
    },
    {
        id: 20,
        title: "20. 容量偽装の取引を輸入記録とつなぐ",
        desc: "Usb_inspection_Records テーブルと Import_Records テーブルを trade_id で INNER JOIN し、17〜18番と同じ CASE WHEN で「容量偽装」と判定された取引について、取引ID（trade_id）・商品名（product_name）・会社ID（company_id）・申告額（declared_value）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
第4章（17〜18番）で作った CASE WHEN の容量偽装判定を、輸入取引の記録（Import_Records）と trade_id でつなぎます。

・INNER JOIN Import_Records ON Usb_inspection_Records.trade_id = Import_Records.trade_id：取引IDで両方の表を結びつける
・WHERE CASE WHEN Usb_inspection_Records.actual_capacity < Usb_inspection_Records.advertised_capacity THEN '容量偽装' ELSE '正常' END = '容量偽装'：容量偽装の取引だけに絞る

第4章の判定ロジックを生かしつつ、その取引の会社IDや申告額を取引記録から引き出します。`,
        clearFeedback: {
            dialogue: "主任監査官：容量偽装のUSB取引と、その取引の company_id・申告額がつながったな。次は company_id を合鍵にして会社名まで特定しよう！",
            learned: [
                "第4章の活用：CASE WHEN による容量偽装判定を JOIN と組み合わせて使う",
                "trade_id：USB容量検査記録と輸入取引記録を結ぶ合鍵"
            ]
        },
        expectedSql: `SELECT
    Usb_inspection_Records.trade_id,
    Usb_inspection_Records.product_name,
    Import_Records.company_id,
    Import_Records.declared_value
FROM Usb_inspection_Records
INNER JOIN Import_Records
    ON Usb_inspection_Records.trade_id = Import_Records.trade_id
WHERE CASE
    WHEN Usb_inspection_Records.actual_capacity < Usb_inspection_Records.advertised_capacity THEN '容量偽装'
    ELSE '正常'
END = '容量偽装';`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "容量偽装のUSB記録と輸入取引記録を trade_id でつなぎ、17〜18番と同じ CASE WHEN で「容量偽装」になる取引だけを取り出します。"
            },
            {
                level: 2,
                type: "構文",
                text: "INNER JOIN ... ON ... でつないだあと、WHERE の後ろに CASE WHEN ... END = '容量偽装' を書きます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Usb_inspection_Records.trade_id,
    Usb_inspection_Records.product_name,
    Import_Records.company_id,
    Import_Records.declared_value
FROM Usb_inspection_Records
INNER JOIN Import_Records
    ON Usb_inspection_Records.trade_id = Import_Records.trade_id
WHERE CASE
    WHEN Usb_inspection_Records.actual_capacity < Usb_inspection_Records.advertised_capacity THEN '容量偽装'
    ELSE '正常'
END = '容量偽装';`
            }
        ],
        dialogue: "主任監査官：第4章で絞り込んだ容量偽装の取引を、輸入記録とつなぎ直そう。どの会社ID・どの申告額の取引なのか確認するんだ。",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: {
            title: "容量偽装取引と結合する項目",
            html: `
- <span class='badge'>Usb_inspection_Records.trade_id</span> 容量偽装記録の取引ID<br>
- <span class='badge'>product_name</span> 商品名<br>
- <span class='badge'>Import_Records.company_id</span> 関係会社を特定する会社ID<br>
- <span class='badge'>declared_value</span> 申告額
            `
        }
    },
    {
        id: 21,
        title: "21. 容量偽装に関わった会社を特定せよ",
        desc: "Usb_inspection_Records・Import_Records・Company_Information_Records をつなぎ、17〜18番と同じ CASE WHEN で「容量偽装」と判定された取引について、会社名（company_name）と取引ID（trade_id）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
20番でつないだUSB記録と輸入取引記録に、さらに Company_Information_Records をつなぐと会社名まで特定できます。

・Usb_inspection_Records.trade_id = Import_Records.trade_id：USBと取引を結ぶ
・Import_Records.company_id = Company_Information_Records.company_id：取引と会社を結ぶ
・WHERE CASE WHEN ... END = '容量偽装'：容量偽装の取引だけに絞る

複数のテーブルをそれぞれの合鍵（trade_id と company_id）でつなぐ捜査の応用です。`,
        clearFeedback: {
            dialogue: "主任監査官：容量偽装に関わった会社まで特定できたな！次は税関検査記録とつなぎ、検査記録がない不審な取引がないか確認しよう。",
            learned: [
                "複数テーブルの結合：trade_id と company_id という異なる合鍵をつないで情報を集める",
                "CASE WHEN の再利用：同じ判定ルールで別テーブルの会社情報と結びつける"
            ]
        },
        expectedSql: `SELECT
    Company_Information_Records.company_name,
    Usb_inspection_Records.trade_id
FROM Usb_inspection_Records
INNER JOIN Import_Records
    ON Usb_inspection_Records.trade_id = Import_Records.trade_id
INNER JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
WHERE CASE
    WHEN Usb_inspection_Records.actual_capacity < Usb_inspection_Records.advertised_capacity THEN '容量偽装'
    ELSE '正常'
END = '容量偽装';`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "USB記録から輸入取引記録をつなぎ、さらに輸入取引記録から会社名をつなぎます。容量偽装の行だけに絞り込みます。"
            },
            {
                level: 2,
                type: "構文",
                text: "trade_id で1回目の INNER JOIN、company_id で2回目の INNER JOIN を行います。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Company_Information_Records.company_name,
    Usb_inspection_Records.trade_id
FROM Usb_inspection_Records
INNER JOIN Import_Records
    ON Usb_inspection_Records.trade_id = Import_Records.trade_id
INNER JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
WHERE CASE
    WHEN Usb_inspection_Records.actual_capacity < Usb_inspection_Records.advertised_capacity THEN '容量偽装'
    ELSE '正常'
END = '容量偽装';`
            }
        ],
        dialogue: "主任監査官：容量偽装の取引を会社名まで追ってみよう。trade_id と company_id の合鍵をつなげば関係企業が浮かび上がるはずだ。",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: {
            title: "3つのテーブルをつなぐ合鍵",
            html: `
- <span class='badge'>Usb_inspection_Records</span> USB容量検査記録<br>
- <span class='badge'>trade_id</span> USB記録と輸入取引記録を結ぶ合鍵<br>
- <span class='badge'>company_id</span> 輸入取引記録と会社情報を結ぶ合鍵<br>
- <span class='badge'>Company_Information_Records.company_name</span> 特定する会社名
            `
        }
    },
    {
        id: 22,
        title: "22. LEFT JOIN で全取引の検査状況を確認せよ",
        desc: "Import_Records テーブルを基準に Customs_Inspection_Records テーブルを LEFT JOIN し、取引ID（trade_id）・型番（model_number）・検査数量（inspected_quantity）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
INNER JOIN は両方の表に一致する行だけを残しますが、LEFT JOIN は左側（FROM 側）の表にある行をすべて残します。
右側の検査記録が一致しないときは inspected_quantity に NULL が表示されます。

・LEFT JOIN Customs_Inspection_Records：検査記録がなくても取引を残す
・ON Import_Records.trade_id = Customs_Inspection_Records.trade_id：取引IDで結びつける

まずは全取引の検査状況を確認し、検査記録がない行（NULL）がどう見えるか確かめましょう。`,
        clearFeedback: {
            dialogue: "主任監査官：LEFT JOIN でつないだことで、検査数量が NULL になっている怪しい行が見えてきたな。次はその中から検査記録がない行だけを絞り込もう。",
            learned: [
                "LEFT JOIN：左側のテーブルの行をすべて残し、一致する右側データがない部分は NULL にする",
                "NULL：対応するデータが存在しないことを表す特別な値"
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
                text: "輸入取引をすべて残した状態で税関検査記録をつなぎ、検査数量（inspected_quantity）がどう表示されるか確認します。"
            },
            {
                level: 2,
                type: "構文",
                text: "左側の表を残す結合には LEFT JOIN を使い、結びつける条件は ON で指定します。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Import_Records.trade_id,
    Import_Records.model_number,
    Customs_Inspection_Records.inspected_quantity
FROM Import_Records
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id;`
            }
        ],
        dialogue: "主任監査官：数量のズレだけでなく、そもそも税関の検査記録すらない隠し貨物があるかもしれない。まずは LEFT JOIN で全取引の検査状況を確認してみよう。",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: {
            title: "LEFT JOINとNULL",
            html: `
- <span class='badge'>LEFT JOIN</span> 左側の取引をすべて残す結合<br>
- <span class='badge'>inspected_quantity</span> 税関での検査数量<br>
- <span class='badge'>NULL</span> 一致する検査記録がない状態
            `
        }
    },
    {
        id: 23,
        title: "23. 検査記録が存在しない隠し貨物を暴け",
        desc: "Import_Records テーブルを基準に Customs_Inspection_Records テーブルを LEFT JOIN し、税関検査記録が存在しない取引の取引ID（trade_id）と型番（model_number）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
22番の LEFT JOIN 結果から、検査記録が存在しない行だけを WHERE ... IS NULL で絞り込みます。

・LEFT JOIN Customs_Inspection_Records：検査記録がなくても取引を残す
・WHERE Customs_Inspection_Records.trade_id IS NULL：右側に一致する記録がない行だけを選ぶ

値が NULL かどうかを調べるときは = NULL ではなく、必ず IS NULL と書きます。`,
        clearFeedback: {
            dialogue: "主任監査官：税関検査の記録がない怪しい取引を絞り込めたな。いよいよ最終ミッションでは、この取引を扱っている会社を特定しよう！",
            learned: [
                "IS NULL：値が存在しない（NULL）の行を絞り込む",
                "LEFT JOIN + IS NULL：片方の表にしかないデータを抽出する定番パターン"
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
                text: "LEFT JOIN でつないだあと、右側の検査記録が存在しない（NULL の）取引だけに絞り込みます。"
            },
            {
                level: 2,
                type: "構文",
                text: "存在しないデータの判定には WHERE 右側テーブル.列名 IS NULL を使います。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Import_Records.trade_id,
    Import_Records.model_number
FROM Import_Records
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Customs_Inspection_Records.trade_id IS NULL;`
            }
        ],
        dialogue: "主任監査官：検査記録がない貨物が見つかりそうだね。IS NULL を使って、税関検査の記録が存在しない取引だけを抜き出してみよう。",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: {
            title: "未検査取引を絞り込む構文",
            html: `
- <span class='badge'>IS NULL</span> 値が存在しない（NULL）行を絞り込む<br>
- <span class='badge'>LEFT JOIN + IS NULL</span> 片方の表にしかないデータを抽出する
            `
        }
    },
    {
        id: 24,
        title: "24. 未検査貨物を扱う企業を特定せよ",
        desc: "Import_Records テーブルを基準に Company_Information_Records を INNER JOIN、Customs_Inspection_Records を LEFT JOIN し、税関検査記録が存在しない取引について、会社名（company_name）・取引ID（trade_id）・型番（model_number）を取得せよ。",
        orderSensitive: false,
        explanation: `【解説】
最終ミッションでは、輸入取引を基準に会社情報を INNER JOIN、税関検査記録を LEFT JOIN でつなぎます。
その後、検査記録がない取引だけを IS NULL で絞り込みます。

・INNER JOIN Company_Information_Records ON Import_Records.company_id = Company_Information_Records.company_id：会社名を取得するため会社テーブルとつなぐ
・LEFT JOIN Customs_Inspection_Records ON Import_Records.trade_id = Customs_Inspection_Records.trade_id：検査記録がなくても取引を残す
・WHERE Customs_Inspection_Records.trade_id IS NULL：未検査の取引だけに絞る

これまでの捜査がつながり、検査記録のない取引を行っている企業を特定できます。`,
        clearFeedback: {
            dialogue: "主任監査官：見事だ！数量のズレや容量偽装、そして未検査の隠し貨物まで、点在していた証拠がすべてつながったな。君の捜査のおかげで事件の全容が解明された！",
            learned: [
                "INNER JOIN と LEFT JOIN の組み合わせ：必須の情報は INNER JOIN、ない場合も残したい情報は LEFT JOIN でつなぐ",
                "総合捜査：複数の表をつなぎ合わせて条件で絞り込み、原因となる対象を特定する"
            ]
        },
        expectedSql: `SELECT
    Company_Information_Records.company_name,
    Import_Records.trade_id,
    Import_Records.model_number
FROM Import_Records
INNER JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Customs_Inspection_Records.trade_id IS NULL;`,
        hints: [
            {
                level: 1,
                type: "考え方",
                text: "輸入記録を基準に会社情報と税関検査記録をつなぎ、検査記録が存在しない取引の会社名・取引ID・型番を出します。"
            },
            {
                level: 2,
                type: "構文",
                text: "会社情報は INNER JOIN、税関検査記録は LEFT JOIN でつなぎ、WHERE ... IS NULL で絞り込みます。"
            },
            {
                level: 3,
                type: "具体例",
                text: `SELECT
    Company_Information_Records.company_name,
    Import_Records.trade_id,
    Import_Records.model_number
FROM Import_Records
INNER JOIN Company_Information_Records
    ON Import_Records.company_id = Company_Information_Records.company_id
LEFT JOIN Customs_Inspection_Records
    ON Import_Records.trade_id = Customs_Inspection_Records.trade_id
WHERE Customs_Inspection_Records.trade_id IS NULL;`
            }
        ],
        dialogue: "主任監査官：いよいよ最終捜査だ。税関検査の記録がない隠し貨物を、いったいどの会社が扱っているのか突き止めよう！",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: {
            title: "最終捜査でつなぐテーブル",
            html: `
- <span class='badge'>Import_Records</span> 基準：輸入・取引記録（company_id / trade_id / model_number）<br>
- <span class='badge'>Company_Information_Records</span> 結合：会社情報（company_id / company_name）<br>
- <span class='badge'>Customs_Inspection_Records</span> 結合：税関検査記録（trade_id）<br>
- <span class='badge'>IS NULL</span> 検査記録が存在しない取引の絞り込み
            `
        }
    }
];
