const missions = [
    {
        title: "00. 事件資料を確認する",
        desc: "テックゲート港で押収された電子記録および関連するデータベースを確認せよ。",
        isBriefing: true,
        dialogue: "主任監査官：テックゲート港で電子部品の取引記録に不審な点が見つかった。君に捜査に協力してほしい。まずは主要なデータベースの構成を確認して、捜査の準備を整えよう。",
        explanation: "【チュートリアル】このミッションではSQLを入力しません。画面上のタブを切り替えて、各捜査資料を確認してください。",
        expectedSql: "",
        hints: [
            "【ヒント1】まずは「会社情報」や「輸入記録」のタブをクリックしてみましょう。",
            "【ヒント2】それぞれの表にどのような項目（カラム）があるか確認します。",
            "【ヒント3】資料を確認したら、下のボタンを押して捜査を開始します。"
        ],
        group: "🌱 第0章：事件資料の確認",
        glossary: {
            title: "対象データベース構造",
            html: `
                • <span class="badge">companies</span> 会社マスターデータ<br>
                • <span class="badge">external_storage_trade_records</span> 輸入・取引記録<br>
                • <span class="badge">customs_inspection_records</span> 税関検査記録<br>
                • <span class="badge">port_trade_records</span> 港湾地域別取引記録（trade_id連携）<br>
                <small class="text-muted">※ほか、解析中の極秘データが存在する模様……？</small>
            `
        }
    },
    // ==========================================
    // 第1章：不審な輸入取引の発見（01〜04）
    // ==========================================
    {
        title: "01. 輸入記録の全体像を把握せよ",
        desc: "external_storage_trade_records からすべてのデータを取得し、輸入された電子部品の記録を調べる。",
        orderSensitive: false,
        explanation: "【解説】テーブルのすべての行と列を呼び出す、最も基本的な SELECT 文の書き方です。",
        expectedSql: "SELECT * FROM external_storage_trade_records;",
        hints: [
            "【ヒント1】すべての列を指定するには専用の記号を使います。",
            "【ヒント2】対象となるテーブル名を確認して構文を組み立てましょう。"
        ],
        dialogue: "主任監査官：まずは押収された輸入取引データを出して、どんな項目や記録が入っているか全体を確認してみよう。",
        group: "🔍 第1章：不審な輸入取引の発見",
        glossary: { 
            title: "対象テーブル・カラム", 
            html: "• <span class='badge'>external_storage_trade_records</span> 輸入・取引記録の全データ（すべての列）" 
        }
    },
    {
        title: "02. 異常な型番の記録を絞り込め",
        desc: "数ある輸入記録の中から、密輸グループが頻繁に使用している型番「CT-400」の記録だけを抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】WHERE句を使うことで、特定の条件に一致するデータだけを絞り込むことができます。",
        expectedSql: "SELECT * FROM external_storage_trade_records WHERE model_number = 'CT-400';",
        hints: [
            "【ヒント1】特定の条件でデータを絞り込むには `WHERE` 句を使用します。",
            "【ヒント2】型番を表すカラム名と、探している文字列（'CT-400'）をイコールで結びます。"
        ],
        dialogue: "主任監査官：現場の箱に『CT-400』という型番が印字されていたという連絡が入ったよ。まずはその型番の取引記録だけを絞り込んで見てみよう。",
        group: "🔍 第1章：不審な輸入取引の発見",
        glossary: { 
            title: "対象カラムの意味", 
            html: "• <span class='badge'>model_number</span> 製品の型番（条件判定に利用）" 
        }
    },
    {
        title: "03. 取引金額と数量の不自然さを暴け",
        desc: "CT-400の取引記録について、会社ID、モデル番号、数量、申告額を取得し、申告額（declared_value）が安い順（昇順）に並べよ。",
        orderSensitive: true,
        explanation: "【解説】ORDER BY 句を使い、最後に ASC（昇順）を指定することで、金額が安い順に並べ替えることができます。",
        expectedSql: "SELECT company_id, model_number, quantity, declared_value FROM external_storage_trade_records WHERE model_number = 'CT-400' ORDER BY declared_value ASC;",
        hints: [
            "【ヒント1】必要な4つの列名をカンマで区切って `SELECT` の直後に並べます。",
            "【ヒント2】安い順（小さい順）に並べるには、列名の後ろに `ASC` を指定します（例: `ORDER BY 列名 ASC`）。"
        ],
        dialogue: "主任監査官：CT-400の取引データを、申告額が安い順に並べてみよう。会社ID『C001』の申告額がほかの取引と比べて低めに見えるので、詳しく確認してみよう。",
        group: "🔍 第1章：不審な輸入取引の発見",
        glossary: { 
            title: "対象カラムの意味", 
            html: `
                • <span class='badge'>company_id</span> 取引を行った会社のID<br>
                • <span class='badge'>model_number</span> 製品の型番（CT-400）<br>
                • <span class='badge'>quantity</span> 輸入数量（比較の基準）<br>
                • <span class='badge'>declared_value</span> 申告された取引金額
            ` 
        }
    },
    {
        title: "04. ターゲット企業の最新動向を追え",
        desc: "最も不審な取引を行っている会社ID 'C001' のCT-400取引から、日付が一番新しい直近の最新記録を1件だけ取得せよ。",
        orderSensitive: true,
        explanation: "【解説】日付が新しい順（降順）にするには DESC を使います。LIMIT 1 と組み合わせることで、最新の1件だけを取得できます。",
        expectedSql: "SELECT * FROM external_storage_trade_records WHERE company_id = 'C001' AND model_number = 'CT-400' ORDER BY declaration_date DESC LIMIT 1;",
        hints: [
            "【ヒント1】「C001かつCT-400」という複数条件は `AND` でつなぎます。",
            "【ヒント2】一番新しい日付を上にするため、日付カラムを `DESC`（降順）で並べ替え、最後に `LIMIT 1` をつけます。"
        ],
        dialogue: "主任監査官：金額が安い順に並べた結果を見てみると、会社ID『C001』の取引だけ、申告額が他の企業よりかなり低く記録されているね。このC001のCT-400取引のうち、日付が一番新しい記録を1件だけ出して確認してみよう。",
        group: "🔍 第1章：不審な輸入取引の発見",
        glossary: { 
            title: "対象カラムの意味", 
            html: `
                • <span class='badge'>company_id</span> 会社ID（'C001'を指定）<br>
                • <span class='badge'>declaration_date</span> 申告日（並び替えに利用）
            ` 
        }
    },

    // ==========================================
    // 第2章：税関検査の矛盾（05〜08）
    // ==========================================
    {
        title: "05. 数量が一致しない貨物を探せ",
        desc: "customs_inspection_records から、申告数量（declared_quantity）と実際の検査数量（inspected_quantity）が食い違っている記録をすべて抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】!= 演算子（または <>）を使うことで、「等しくない」条件のデータを抽出できます。",
        expectedSql: "SELECT * FROM customs_inspection_records WHERE declared_quantity != inspected_quantity;",
        hints: [
            "【ヒント1】『等しくない』状態を表す比較演算子を思い出しましょう。",
            "【ヒント2】2つの数量カラムをその演算子で比較します。"
        ],
        dialogue: "主任監査官：C001の動きが気になったね。今度は税関の検査記録を確認して、申告数量と実際の検査数量が一致していない記録を探してみよう。",
        group: "📦 第2章：税関検査の矛盾",
        glossary: { 
            title: "対象カラムの意味", 
            html: `
                • <span class='badge'>declared_quantity</span> 書類上の申告数量<br>
                • <span class='badge'>inspected_quantity</span> 税関が実際に数えた検査数量
            ` 
        }
    },
    {
        title: "06. 抜き取り・数量不足の傾向を掴め",
        desc: "検査数量が申告数量を下回っている（不足している）貨物だけを customs_inspection_records から抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】< 演算子を使うことで、より小さい値のデータを絞り込むことができます。",
        expectedSql: "SELECT * FROM customs_inspection_records WHERE inspected_quantity < declared_quantity;",
        hints: [
            "【ヒント1】『より少ない（未満）』を判定する不等号を使います。",
            "【ヒント2】実際の検査数量が申告数量より小さい関係式を作ります。"
        ],
        dialogue: "主任監査官：今度は検査数量が申告数量より少ない『不足している』記録だけに絞り込んで確認してみよう。",
        group: "📦 第2章：税関検査の矛盾",
        glossary: { 
            title: "対象カラムの意味", 
            html: "• <span class='badge'>inspected_quantity</span> < <span class='badge'>declared_quantity</span> の条件に利用" 
        }
    },
    {
        title: "07. 消えた荷物の数を計算せよ",
        desc: "各取引の trade_id と、申告数量から検査数量を引いた不足数を missing_quantity という名前で customs_inspection_records から表示せよ。",
        orderSensitive: false,
        explanation: "【解説】算術演算子（-）で列同士を引き算し、AS 句で計算結果に新しい列名を付けることができます。",
        expectedSql: "SELECT trade_id, declared_quantity - inspected_quantity AS missing_quantity FROM customs_inspection_records;",
        hints: [
            "【ヒント1】数値同士を引き算する算術演算子を使用します。",
            "【ヒント2】計算結果に別名（エイリアス）を付けるキーワード `AS` を活用しましょう。"
        ],
        dialogue: "主任監査官：それぞれの記録で、申告数量と検査数量の差（不足数）を計算して一覧にしてみよう。",
        group: "📦 第2章：税関検査の矛盾",
        glossary: { 
            title: "対象カラムの意味", 
            html: `
                • <span class='badge'>trade_id</span> 取引ID<br>
                • <span class='badge'>declared_quantity - inspected_quantity</span> 不足数の引き算式
            ` 
        }
    },
    {
    title: "08. コンテナ単位の巨大な隠蔽工作を暴け",
    desc: "customs_inspection_records から、申告数量から実際の検査数量を引いた不足数が200個以上ある、組織的犯行の疑いが強い重大な貨物をすべて抽出せよ。",
    orderSensitive: false,
    explanation: "【解説】AND 演算子を使うことで、複数の条件（不足していること、かつ不足数が200以上であること）を同時に満たすデータを絞り込めます。",
    expectedSql: "SELECT * FROM customs_inspection_records WHERE inspected_quantity < declared_quantity AND declared_quantity - inspected_quantity >= 200;",
    hints: [
        "【ヒント1】不足している条件に加えて、差額が一定数以上である条件を組み込みます。",
        "【ヒント2】複数の条件を同時に満たすために AND でつなぎましょう。"
    ],
    dialogue: "主任監査官：不足数が200個以上になっている記録もあるみたいだね。大きめの差が出ている記録を絞り込んで確認してみよう。",
    group: "📦 第2章：税関検査の矛盾",
    glossary: {
        title: "対象カラムの意味",
        html: "• <span class='badge'>declared_quantity</span> と <span class='badge'>inspected_quantity</span> の差分判定（200個以上の大規模な不足）"
    }
},

    // ==========================================
    // 第3章：不正ルートの追跡（09〜12）
    // ==========================================
    {
    title: "09. 港湾エリアの種類を特定せよ",
    desc: "port_trade_records から、すべての取引における港湾地域（region）を重複なしで取得せよ。",
    orderSensitive: false,
    explanation: "【解説】DISTINCT を使うことで、結果の重複行を取り除き、ユニークな値のリストを取得できます。",
    expectedSql: "SELECT DISTINCT region FROM port_trade_records;",
    hints: [
        "【ヒント1】同じ地域名が何度も表示されないようにするには DISTINCT を使います。",
        "【ヒント2】SELECT DISTINCT の後ろに取得したいカラム名を指定しましょう。"
    ],
    dialogue: "主任監査官：まずは調査対象となる港湾地域を確認しよう。記録に出てくる地域名を重複なしで一覧にしてみよう。",
    group: "🚢 第3章：不正ルートの追跡",
    glossary: {
        title: "対象カラムの意味",
        html: "• <span class='badge'>region</span> 通過した港湾地域名"
    }
},
{
    title: "10. 地域ごとの取扱件数を集計せよ",
    desc: "port_trade_records から地域（region）ごとにグループ化し、地域名と各地域の取引件数（trade_count）を集計せよ。",
    orderSensitive: false,
    explanation: "【解説】GROUP BY 句で同じ地域のデータをグループにまとめ、COUNT(*) で各グループの行数を集計できます。また、07で学んだ AS を使って、集計結果に trade_count という名前を付けます。",
    expectedSql: "SELECT region, COUNT(*) AS trade_count FROM port_trade_records GROUP BY region;",
    hints: [
        "【ヒント1】同じ地域のデータをまとめるには GROUP BY を使います。",
        "【ヒント2】COUNT(*) で件数を数え、07で学んだ AS を使って trade_count という別名を付けましょう。"
    ],
    dialogue: "主任監査官：次は地域ごとの取引件数を数えてみよう。GROUP BY で地域ごとにまとめて件数を出してみてね。",
    group: "🚢 第3章：不正ルートの追跡",
    glossary: {
        title: "対象カラム・関数の意味",
        html: `
            • <span class='badge'>region</span> 地域名（グループ化の基準）<br>
            • <span class='badge'>COUNT(*)</span> 各グループの件数を数える関数<br>
            • <span class='badge'>AS</span> 集計結果に別名を付けるキーワード
        `
    }
},
    {
    title: "11. 地域ごとの申告額を集計せよ",
    desc: "port_trade_records から地域（region）ごとにグループ化し、地域名と各地域の申告額の合計（total_value）を計算せよ。",
    orderSensitive: false,
    explanation: "【解説】10では COUNT(*) を使って地域ごとの取引件数を集計しました。今回は SUM(declared_value) に置き換えることで、地域ごとの申告額の合計を算出できます。また、07で学んだ AS を使って、集計結果に total_value という名前を付けます。GROUP BY region は10と同じです。",
    expectedSql: "SELECT region, SUM(declared_value) AS total_value FROM port_trade_records GROUP BY region;",
    hints: [
        "【ヒント1】10では COUNT(*) で件数を数えました。今回は金額を合計する SUM(カラム名) を使います。",
        "【ヒント2】SUM(declared_value) の後ろに AS total_value と指定し、10と同じ GROUP BY region を組み合わせましょう。"
    ],
    dialogue: "主任監査官：取引件数に加えて、地域ごとの申告額の合計も見ておきたいね。SUM を使って合計金額を出してみよう。",
    group: "🚢 第3章：不正ルートの追跡",
    glossary: {
        title: "対象カラム・関数の意味",
        html: `
            • <span class='badge'>region</span> 地域名（グループ化の基準）<br>
            • <span class='badge'>declared_value</span> 個々の取引の申告額<br>
            • <span class='badge'>SUM()</span> 各グループの金額を合計する関数<br>
            • <span class='badge'>AS</span> 集計結果に別名を付けるキーワード
        `
    }
},
    {
    title: "12. 密輸のハブ拠点を発見せよ",
    desc: "port_trade_records から地域（region）ごとに取引件数を集計し、300件以上の地域だけを抽出して、取引件数が多い順に並べよ。",
    orderSensitive: true,
    explanation: "【解説】10では GROUP BY と COUNT(*) を使って地域ごとの取引件数を集計しました。今回はその集計結果に対して HAVING 句で300件以上という条件を指定します。さらに ORDER BY と DESC を組み合わせることで、取引件数が多い順に並べられます。",
    expectedSql: "SELECT region, COUNT(*) AS trade_count FROM port_trade_records GROUP BY region HAVING COUNT(*) >= 300 ORDER BY trade_count DESC;",
    hints: [
        "【ヒント1】GROUP BY で集計した結果に条件を付けるには HAVING を使います。WHERE ではなく HAVING を使う点に注意しましょう。",
        "【ヒント2】300件以上という条件は HAVING COUNT(*) >= 300、件数が多い順への並び替えは ORDER BY trade_count DESC と指定します。"
    ],
    dialogue: "主任監査官：最後に、取引件数が300件以上ある地域だけを絞り込んで、多い順に並べてみよう。件数の多い拠点を整理しておこう。",
    group: "🚢 第3章：不正ルートの追跡",
    glossary: {
        title: "対象カラム・句の意味",
        html: `
            • <span class='badge'>region</span> 地域名<br>
            • <span class='badge'>COUNT(*)</span> 地域ごとの取引件数<br>
            • <span class='badge'>HAVING</span> 集計後の条件指定<br>
            • <span class='badge'>ORDER BY</span> 結果の並び替え<br>
            • <span class='badge'>DESC</span> 降順（大きい順）
        `
    }
},

    // ==========================================
    // 第4章：偽装USBの証拠（13〜17）
    // ==========================================
    {
        title: "13. 実容量の割合を算出せよ",
        desc: "usb_inspection_records から商品名と、実容量の割合（actual_capacity * 100.0 / advertised_capacity）を計算した capacity_rate（小数第1位まで四捨五入）を表示せよ。",
        orderSensitive: false,
        explanation: "【解説】ROUND(値, 桁数) 関数を使うことで、数値を指定した小数第何位までに丸めることができます。",
        expectedSql: "SELECT product_name, ROUND(actual_capacity * 100.0 / advertised_capacity, 1) AS capacity_rate FROM usb_inspection_records;",
        hints: [
            "【ヒント1】数値を四捨五入して丸めるための関数を活用します。",
            "【ヒント2】割合を求める割り算の式を関数の中に組み込みましょう。"
        ],
        dialogue: "主任監査官：解析チームから『usb_inspection_records（USB容量検査記録）』のデータが追加されたよ。表示容量に対して実測容量が何％になっているか計算して確認してみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: { 
            title: "対象カラムの意味（追加されたUSB検査ログ）", 
            html: `
                • <span class='badge'>usb_id</span> USB検査ID<br>
                • <span class='badge'>trade_id</span> 取引ID<br>
                • <span class='badge'>product_name</span> 商品名<br>
                • <span class='badge'>advertised_capacity</span> 表示容量<br>
                • <span class='badge'>actual_capacity</span> 実測容量
            ` 
        }
    },
    {
        title: "14. 大容量モデルの不正を追跡せよ",
        desc: "usb_inspection_records から、表示容量（advertised_capacity）が 128 から 512 までの商品をすべて抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】BETWEEN 最小値 AND 最大値 を使うことで、指定した数値範囲内のデータを効率よく抽出できます。",
        expectedSql: "SELECT * FROM usb_inspection_records WHERE advertised_capacity BETWEEN 128 AND 512;",
        hints: [
            "【ヒント1】指定した数値の範囲内にあるデータを絞り込む便利な演算子を使用します。",
            "【ヒント2】最小値と最大値を指定して範囲を限定しましょう。"
        ],
        dialogue: "主任監査官：表示容量が128から512までの記録に絞って確認してみよう。範囲指定の使い方に慣れていこう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "対象カラムの意味",
            html: "• <span class='badge'>advertised_capacity</span> 表示容量（範囲指定の対象）"
        }
    },
    {
        title: "15. USB関連の検査記録を網羅せよ",
        desc: "usb_inspection_records から、商品名（product_name）に「USB」という文字が含まれている検査記録をすべて抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】LIKE 演算子とワイルドカード `%` を組み合わせることで、部分一致する文字列を検索できます。",
        expectedSql: "SELECT * FROM usb_inspection_records WHERE product_name LIKE '%USB%';",
        hints: [
            "【ヒント1】部分一致検索を行うための演算子とワイルドカードを組み合わせます。",
            "【ヒント2】検索したい文字の前後に特殊文字を配置しましょう。"
        ],
        dialogue: "主任監査官：商品名に『USB』が含まれる検査記録を抽出して、対象データを一覧で確認してみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "対象カラムの意味",
            html: "• <span class='badge'>product_name</span> 商品名（一部一致の検索対象）"
        }
    },
    {
        title: "16. 判定結果を表示せよ",
        desc: "usb_inspection_records から商品名（product_name）を取得し、CASE WHEN を使って、すべての商品に「調査対象」という文字を表示する status という列を追加せよ。",
        orderSensitive: false,
        explanation: "【解説】CASE WHEN は、条件に応じて表示する内容を切り替える構文です。今回は 1 = 1 が必ず成立するため、THEN 側の「調査対象」が表示されます。基本形では ELSE と END まで書きます。",
        expectedSql: "SELECT product_name, CASE WHEN 1 = 1 THEN '調査対象' ELSE '対象外' END AS status FROM usb_inspection_records;",
        hints: [
            "【ヒント1】CASE WHEN を使って、新しい表示列を追加します。",
            "【ヒント2】CASE WHEN 1 = 1 THEN '調査対象' ELSE '対象外' END という形を使います。",
            "【ヒント3】追加した列の名前は AS status で指定します。"
        ],
        dialogue: "主任監査官：まずは条件分岐の基本形を覚えよう。今回はすべての商品に「調査対象」と表示してみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "今回覚える構文",
            html: `
                • <span class='badge'>CASE WHEN</span> 条件分岐の開始<br>
                • <span class='badge'>THEN</span> 条件成立時の表示<br>
                • <span class='badge'>ELSE</span> 条件不成立時の表示<br>
                • <span class='badge'>END</span> 条件分岐の終了
            `
        }
    },
    {
        title: "17. 悪質な容量詐称を判定せよ",
        desc: "usb_inspection_records から商品名、表示容量、実容量を取得し、実容量の2倍が表示容量以下なら「重大な偽装」、それ以外なら「要確認」とする investigation_status を表示せよ。",
        orderSensitive: false,
        explanation: "【解説】16番で覚えた CASE WHEN の基本形に、実際の比較条件を入れます。",
        expectedSql: "SELECT product_name, advertised_capacity, actual_capacity, CASE WHEN actual_capacity * 2 <= advertised_capacity THEN '重大な偽装' ELSE '要確認' END AS investigation_status FROM usb_inspection_records;",
        hints: [
            "【ヒント1】WHEN の後ろに actual_capacity * 2 <= advertised_capacity を指定します。",
            "【ヒント2】条件成立時は '重大な偽装'、それ以外は '要確認' と表示します。",
            "【ヒント3】列名は AS investigation_status で指定します。"
        ],
        dialogue: "主任監査官：実測容量の2倍が表示容量以下になっているものを『重大な偽装』、それ以外を『要確認』として分類してみよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: {
            title: "対象カラムの意味",
            html: `
                • <span class='badge'>advertised_capacity</span> 表示容量<br>
                • <span class='badge'>actual_capacity</span> 実測容量<br>
                • <span class='badge'>CASE WHEN</span> 容量詐称の判定に利用
            `
        }
    },
    

// ==========================================
// 第5章：関係企業のネットワーク（18〜20）
// ==========================================
{
    title: "18. 取引記録と税関検査記録をつなげろ",
    desc: "external_storage_trade_records をメインにして customs_inspection_records を trade_id で結合し、取引ID（trade_id）を表示せよ。",
    orderSensitive: false,
    explanation: `【解説】いよいよ、複数のテーブルをつなげる JOIN を学びます。

これまでは1つのテーブルからデータを取り出していました。
しかし、実際のデータベースでは、情報が複数のテーブルに分かれて保存されていることがあります。

例えば今回は、

① external_storage_trade_records
輸入取引の記録

② customs_inspection_records
税関検査の記録

という2つのテーブルを使います。

【まずは、どちらをメインにするか考えよう】

今回は輸入取引の記録をメインにします。

FROM の後ろに書いたテーブルが、最初に使うテーブルです。

【テーブルをつなげる順番】

FROM external_storage_trade_records
↓
まず、輸入取引の記録を用意する

INNER JOIN customs_inspection_records
↓
そこに税関検査の記録を結びつける

ON external_storage_trade_records.trade_id
 = customs_inspection_records.trade_id

↓
両方のテーブルにある trade_id を目印にする

【今回覚える3つ】

・FROM：最初に使うメインのテーブルを指定する
・INNER JOIN：もう1つのテーブルを結びつける
・ON：何を目印にして結びつけるか指定する

【INNER JOINのポイント】

今回は両方のテーブルに同じ trade_id が存在するデータを結びつけます。

まずは、2つのテーブルをつなげる基本の形を覚えましょう。

まだ数量の比較などは行いません。
今回は取引IDを表示するだけで大丈夫です。`,
    expectedSql: "SELECT external_storage_trade_records.trade_id FROM external_storage_trade_records INNER JOIN customs_inspection_records ON external_storage_trade_records.trade_id = customs_inspection_records.trade_id;",
    hints: [
        "【ヒント1】今回は輸入取引の記録をメインにします。FROM の後ろに external_storage_trade_records を指定しましょう。",
        "【ヒント2】次に税関検査の記録を追加します。INNER JOIN customs_inspection_records と書きます。",
        "【ヒント3】ON の後ろで、両方のテーブルの trade_id を = で結びつけます。"
    ],
    dialogue: "主任監査官：これまでは一つの資料だけを調べてきたけれど、実際の捜査では複数の資料を照らし合わせる必要があるんだ。まずは輸入取引の記録をメインにして、税関検査の記録を取引IDでつなげてみよう。",
    group: "🔗 第5章：関係企業のネットワーク",
    glossary: {
        title: "今回使う構文とテーブル",
        html: `
            • <span class='badge'>FROM</span> 最初に使うメインのテーブル<br>
            • <span class='badge'>external_storage_trade_records</span> 輸入取引の記録（メイン）<br>
            • <span class='badge'>INNER JOIN</span> 追加するテーブルを結びつける<br>
            • <span class='badge'>customs_inspection_records</span> 税関検査の記録（追加）<br>
            • <span class='badge'>ON</span> 結合する条件を指定する<br>
            • <span class='badge'>trade_id</span> 2つのテーブルに共通する取引ID
        `
    }
},
{
    title: "19. 申告数量と検査数量の矛盾を暴け",
    desc: "external_storage_trade_records をメインにして customs_inspection_records を trade_id で結合し、取引ID、申告数量（quantity）、検査数量（inspected_quantity）を表示せよ。",
    orderSensitive: false,
    explanation: `【解説】18番では、2つのテーブルを INNER JOIN で結びつけました。

今回は、その結合方法をもう一度使います。

ただし、今回は表示する情報を増やしてみましょう。

【まずは、メインのテーブルを確認】

今回もメインは external_storage_trade_records です。

ここには輸入時の申告数量 quantity が記録されています。

一方、税関検査の記録 customs_inspection_records には、実際に検査した数量 inspected_quantity が記録されています。

【どこから何を取得する？】

① 輸入取引の記録
・trade_id：取引ID
・quantity：申告数量

② 税関検査の記録
・inspected_quantity：実際の検査数量

【テーブル名.カラム名 という書き方】

別々のテーブルから列を取り出す場合は、

テーブル名.カラム名

と書きます。

例えば、

external_storage_trade_records.quantity

と書くと、輸入取引の記録にある quantity を指定できます。

【今回のポイント】

18番と同じように、

FROM：メインのテーブル
INNER JOIN：追加するテーブル
ON：結びつける目印

という順番で書きます。

今回は WHERE による絞り込みは行いません。

まずは2つの資料から必要な情報を取り出して、並べて表示してみましょう。`,
    expectedSql: "SELECT external_storage_trade_records.trade_id, external_storage_trade_records.quantity, customs_inspection_records.inspected_quantity FROM external_storage_trade_records INNER JOIN customs_inspection_records ON external_storage_trade_records.trade_id = customs_inspection_records.trade_id;",
    hints: [
        "【ヒント1】18番と同じように、FROM の後ろにはメインとなる external_storage_trade_records を指定します。",
        "【ヒント2】SELECT の後ろに、trade_id、quantity、inspected_quantity の3つをカンマで区切って指定します。",
        "【ヒント3】quantity は external_storage_trade_records、inspected_quantity は customs_inspection_records の列です。それぞれテーブル名を付けて指定しましょう。"
    ],
    dialogue: "主任監査官：資料をつなげることができたね。今度は輸入時の申告数量と、実際の検査数量を並べて確認しよう。2つの資料を照らし合わせれば、数量の矛盾が見つかるかもしれない。",
    group: "🔗 第5章：関係企業のネットワーク",
    glossary: {
        title: "今回使うテーブルとカラム",
        html: `
            • <span class='badge'>external_storage_trade_records</span> メイン：輸入取引の記録<br>
            • <span class='badge'>trade_id</span> 取引ID<br>
            • <span class='badge'>quantity</span> 輸入時の申告数量<br>
            • <span class='badge'>customs_inspection_records</span> 追加：税関検査の記録<br>
            • <span class='badge'>inspected_quantity</span> 税関での検査数量<br>
            • <span class='badge'>テーブル名.カラム名</span> どのテーブルの列かを指定する書き方
        `
    }
},
{
    title: "20. 検査記録が存在しない隠し貨物を暴け",
    desc: "external_storage_trade_records をメインにして customs_inspection_records を LEFT JOIN し、税関検査記録が存在しない取引のIDとモデル番号を抽出せよ。",
    orderSensitive: false,
    explanation: `【解説】18番・19番では INNER JOIN を使いました。

今回は LEFT JOIN を学びます。

【まずは、メインのテーブルを確認】

今回もメインは external_storage_trade_records です。

輸入取引の記録をすべて残したいからです。

追加するテーブルは customs_inspection_records です。
こちらには税関検査の記録が入っています。

【INNER JOIN と LEFT JOIN の違い】

INNER JOIN：
両方のテーブルに一致するデータがある場合に表示する。

LEFT JOIN：
FROM の後ろに書いた左側のテーブルをすべて残す。
右側に一致するデータがなければ、右側の列は NULL になる。

【今回のデータのイメージ】

輸入記録：T001、T002、T003
検査記録：T001、T002

LEFT JOIN すると、

T001 → 検査記録あり
T002 → 検査記録あり
T003 → 検査記録なし（NULL）

となります。

【NULLとは？】

NULL は、データが存在しないことを表します。

今回は検査記録がない取引だけを見つけたいので、

WHERE customs_inspection_records.trade_id IS NULL

と指定します。

【今回覚えること】

① FROM：メインのテーブルを指定する
② LEFT JOIN：追加するテーブルを結びつける。ただし左側はすべて残す
③ ON：結びつける目印を指定する
④ WHERE：必要なデータだけに絞り込む
⑤ IS NULL：データが存在しないものを探す

18番と20番では、メインのテーブルは同じです。

変わったのは INNER JOIN が LEFT JOIN になったところです。

この違いを意識してみましょう。`,
    expectedSql: "SELECT external_storage_trade_records.trade_id, external_storage_trade_records.model_number FROM external_storage_trade_records LEFT JOIN customs_inspection_records ON external_storage_trade_records.trade_id = customs_inspection_records.trade_id WHERE customs_inspection_records.trade_id IS NULL;",
    hints: [
        "【ヒント1】今回も輸入取引の記録をメインにします。FROM の後ろに external_storage_trade_records を指定しましょう。",
        "【ヒント2】今回は一致しない輸入記録も残したいので、INNER JOIN ではなく LEFT JOIN を使います。",
        "【ヒント3】ON で両方の trade_id を結びつけた後、WHERE customs_inspection_records.trade_id IS NULL で検査記録がないものを探します。"
    ],
    dialogue: "主任監査官：数量の矛盾だけではないようだね。さらに調べると、輸入記録は残っているのに税関検査の記録が見当たらない貨物がある。今回は輸入記録をすべて残す LEFT JOIN を使って、検査を受けていない疑いのある取引を探してみよう。",
    group: "🔗 第5章：関係企業のネットワーク",
    glossary: {
        title: "今回使う構文とテーブル",
        html: `
            • <span class='badge'>FROM</span> メインのテーブルを指定する<br>
            • <span class='badge'>external_storage_trade_records</span> 左側：輸入取引の記録<br>
            • <span class='badge'>LEFT JOIN</span> 左側のテーブルをすべて残す<br>
            • <span class='badge'>customs_inspection_records</span> 右側：税関検査の記録<br>
            • <span class='badge'>ON</span> 結びつける条件を指定する<br>
            • <span class='badge'>IS NULL</span> 対応するデータがない状態を調べる
        `
    }
},

// ==========================================
// 最終章：事件の全容解明（21）
// ==========================================
{
    title: "21. 事件の全容解明と総合捜査報告",
    desc: "companies をメインにして external_storage_trade_records と customs_inspection_records を結合し、会社名、取引ID、申告数量、検査数量を一覧表示せよ。税関検査記録がない輸入取引も残すこと。",
    orderSensitive: false,
    explanation: `【解説】いよいよ最後の総合問題です。

今回は3つのテーブルを使います。

これまでの問題では2つのテーブルを結合してきました。
今回は、その結合をもう一度行い、3つのテーブルをつなげます。

【最初に、メインのテーブルを決めよう】

今回は companies をメインにします。

companies には会社名や会社IDなどの会社情報が入っています。

まず会社情報を用意して、そこに輸入取引の記録を追加していきます。

【結合の順番】

① companies（メイン）
会社情報を用意する。

② external_storage_trade_records（追加）
会社ID（company_id）を目印にして、輸入取引の記録を結びつける。

ここでは INNER JOIN を使います。

③ customs_inspection_records（さらに追加）
取引ID（trade_id）を目印にして、税関検査の記録を結びつける。

ここでは LEFT JOIN を使います。

【なぜ最後だけ LEFT JOIN なの？】

今回の目的は、すべての輸入取引を一覧にすることです。

税関検査の記録がない取引も、報告書から消えてしまってはいけません。

そのため、最後の結合では LEFT JOIN を使います。

【今回の結合の流れ】

companies
↓ company_id で結合
external_storage_trade_records
↓ trade_id で結合
customs_inspection_records

【今回のポイント】

・最初のテーブルは FROM で指定する
・2つ目以降のテーブルは JOIN で追加する
・それぞれのテーブルを結ぶ目印は ON で指定する
・INNER JOIN と LEFT JOIN は目的に応じて使い分ける

18〜20番で学んだことを思い出しながら、最後の総合報告書を完成させましょう。`,
    expectedSql: "SELECT companies.company_name, external_storage_trade_records.trade_id, external_storage_trade_records.quantity, customs_inspection_records.inspected_quantity FROM companies INNER JOIN external_storage_trade_records ON companies.company_id = external_storage_trade_records.company_id LEFT JOIN customs_inspection_records ON external_storage_trade_records.trade_id = customs_inspection_records.trade_id;",
    hints: [
        "【ヒント1】今回は companies をメインにします。FROM の後ろに指定しましょう。",
        "【ヒント2】次に external_storage_trade_records を INNER JOIN で追加します。会社ID（company_id）を使って結びつけます。",
        "【ヒント3】最後に customs_inspection_records を LEFT JOIN で追加します。取引ID（trade_id）を使って結びつけましょう。",
        "【ヒント4】SELECT には会社名、取引ID、申告数量、検査数量の4つを指定します。"
    ],
    dialogue: "主任監査官：ここまでよく頑張ったね。最後は会社情報をメインに、輸入記録、税関検査記録の順番で3つの資料を結びつけよう。検査記録がない貨物も含めて一覧にすれば、事件の全体像が明らかになるはずだ。これが最後の総合捜査になる。",
    group: "🎯 最終章：事件の全容解明",
    glossary: {
        title: "今回使うテーブルと結合の順番",
        html: `
            • <span class='badge'>companies</span> メイン：会社情報<br>
            • <span class='badge'>external_storage_trade_records</span> 追加：輸入取引の記録<br>
            • <span class='badge'>customs_inspection_records</span> 追加：税関検査の記録<br>
            • <span class='badge'>INNER JOIN</span> 会社IDで会社と輸入記録を結合<br>
            • <span class='badge'>LEFT JOIN</span> 取引IDで検査記録を追加し、検査記録がなくても輸入記録を残す<br>
            • <span class='badge'>ON</span> テーブル同士を結びつける目印を指定する
        `
    }
}
];
