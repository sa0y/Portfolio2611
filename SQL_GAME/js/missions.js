const missions = [
    {
        title: "00. 事件資料を確認する",
        desc: "テックゲート港で押収された電子記録および関連するデータベースを確認せよ。",
        isBriefing: true,
        dialogue: "主任監査官：テックゲート港で不審な電子部品の密輸・偽装の疑いが浮上した。まずは主要なデータベースの構造を確認し、捜査の準備を整えよう。",
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
        dialogue: "主任監査官：まずは押収されたすべての輸入取引データを引っ張ってくれ。全体にどんなデータが入っているか、まずは一望してみよう。",
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
        dialogue: "主任監査官：さっき税関の現場から連絡が入った。押収されたコンテナの箱に『CT-400』という型番が印字されていたらしい。まずはその型番の取引記録だけを絞り込んで確認しよう。",
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
        dialogue: "主任監査官：CT-400の取引データを、申告額が安い順に並べてみよう。……おっ、一覧を見てくれ。どの企業も同じ数量（ロット）で輸入しているはずなのに、会社ID『C001』の申告額だけが異様に安い。これは客観的に見ても明らかな価格偽装の証拠になりそうだね。詳しく調べてみよう！",
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
        dialogue: "主任監査官：金額が安い順に並べた結果を見てみろ……会社ID『C001』の取引だけ、他の企業とは比べ物にならないほど異常な安値で申告されている。何か裏の取引があるはずだ。このC001の直近の取引記録を1件だけ特定して裏を取ってくれ！",
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
        dialogue: "主任監査官：第1章でC001の不審な動きが見えてきた。今度は税関の検査記録全体を確認し、書類上の数量と実際の数量が一致しない『ごまかし』を洗い出すぞ。",
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
        dialogue: "主任監査官：単なる記載ミスではなく、意図的に荷物が消えている『数量不足』の記録だけに絞り込んでくれ。",
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
        dialogue: "主任監査官：それぞれの貨物で、一体どれだけの荷物が消えているのか（不足数）を計算してリスト化してくれ。",
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
        desc: "輸入記録と税関検査記録を比較し、申告数量から実際の検査数量を引いた不足数が 200個以上 ある、組織的犯行の疑いが強い重大な貨物を customs_inspection_records からすべて抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】AND 演算子を使うことで、複数の条件（不足していること、かつ不足数が200以上であること）を同時に満たすデータを絞り込めます。",
        expectedSql: "SELECT * FROM customs_inspection_records WHERE inspected_quantity < declared_quantity AND declared_quantity - inspected_quantity >= 200;",
        hints: [
            "【ヒント1】不足している条件に加えて、差額が一定数以上である条件を組み込みます。",
            "【ヒント2】複数の条件を同時に満たすために `AND` でつなぎましょう。"
        ],
        dialogue: "主任監査官：「新任捜査官、ただの数え間違いレベルじゃない。200個、300個単位で貨物が消えているコンテナが見つかった……これは単なるミスではなく、港湾を巻き込んだ組織的な抜き取り・隠蔽工作に違いない。SQLでその巨大な証拠をあぶり出してくれ！」",
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
        title: "09. 港湾エリア別の輸送状況を追え",
        desc: "port_trade_records から、すべての取引における港湾地域（region）を重複なしで取得せよ。",
        orderSensitive: false,
        explanation: "【解説】DISTINCT を使うことで、結果の重複行を取り除き、ユニークな値のリストを取得できます。",
        expectedSql: "SELECT DISTINCT region FROM port_trade_records;",
        hints: [
            "【ヒント1】同じ名前が何度も重複して表示されないようにするには `DISTINCT` というキーワードを使います。",
            "【ヒント2】`SELECT DISTINCT [列名] FROM [テーブル名];` のように、SELECT のすぐ後ろに記述しましょう。"
        ],
        dialogue: "主任監査官：第3章からは輸送ルートの解明に入る。港湾記録から、物品がどのような地域（ターミナル）を経由しているか重複なしで確認しよう。",
        group: "🚢 第3章：不正ルートの追跡",
        glossary: { 
            title: "対象カラムの意味", 
            html: "• <span class='badge'>region</span> 通過した港湾地域名" 
        }
    },
    {
        title: "10. 地域ごとの取扱件数を集計せよ",
        desc: "port_trade_records から地域（region）ごとにグループ化し、地域名と取引件数（trade_count）を集計せよ。",
        orderSensitive: false,
        explanation: "【解説】GROUP BY 句でデータをグループにまとめ、COUNT(*) でそれぞれの行数を集計できます。",
        expectedSql: "SELECT region, COUNT(*) AS trade_count FROM port_trade_records GROUP BY region;",
        hints: [
            "【ヒント1】データをグループにまとめる `GROUP BY` 句を活用します。",
            "【ヒント2】件数を数える集計関数と `AS` による別名付与を組み合わせましょう。"
        ],
        dialogue: "主任監査官：どのエリアが最も多くの貨物を扱っているのか、地域ごとの取引件数を集計してみよう。",
        group: "🚢 第3章：不正ルートの追跡",
        glossary: { 
            title: "対象カラムの意味", 
            html: `
                • <span class='badge'>region</span> 地域名（グループ化の基準）<br>
                • <span class='badge'>COUNT(*)</span> 件数の集計用関数
            ` 
        }
    },
    {
        title: "11. 地域ごとのマネーフローを調べよ",
        desc: "port_trade_records から地域ごとにグループ化し、地域名と申告額の合計（total_value）を計算せよ。",
        orderSensitive: false,
        explanation: "【解説】SUM(declared_value) 関数を使うことで、グループごとの金額の合計値を算出し、AS total_value で列名を分かりやすく変更できます。",
        expectedSql: "SELECT region, SUM(declared_value) AS total_value FROM port_trade_records GROUP BY region;",
        hints: [
            "【ヒント1】金額の合計を出すには `SUM(カラム名)` という集計関数を使い、後ろに `AS total_value` と名前を付けます。",
            "【ヒント2】地域ごとにまとめる `GROUP BY region` と組み合わせることで、地域ごとの合計金額が計算できます。"
        ],
        dialogue: "主任監査官：どの地域に莫大な資金が動いているのか突き止めるため、地域ごとの申告額の合計を計算してくれ。",
        group: "🚢 第3章：不正ルートの追跡",
        glossary: { 
            title: "対象カラムの意味", 
            html: `
                • <span class='badge'>region</span> 地域名<br>
                • <span class='badge'>declared_value</span> 申告額（合計を算出）
            ` 
        }
    },
    {
        title: "12. 密輸のハブ拠点を発見せよ",
        desc: "port_trade_records から地域ごとにグループ化し、取引件数が10件以上の地域だけを表示して、件数が多い順（降順）に並べよ。",
        orderSensitive: true,
        explanation: "【解説】集計後の条件指定には HAVING 句を用い、多い順に並べ替えるには ORDER BY [集計名] DESC を使います。",
        expectedSql: "SELECT region, COUNT(*) AS trade_count FROM port_trade_records GROUP BY region HAVING COUNT(*) >= 10 ORDER BY trade_count DESC;",
        hints: [
            "【ヒント1】集計した件数に対する条件（10件以上）には `HAVING` 句を使います。",
            "【ヒント2】件数が多い順（大きい順）にするには、並び替えの最後に `DESC` を指定します。"
        ],
        dialogue: "主任監査官：取引件数が10件以上ある主要な地域を抽出し、不正の温床となっているハブ拠点を特定してくれ。",
        group: "🚢 第3章：不正ルートの追跡",
        glossary: { 
            title: "対象カラムの意味", 
            html: "• <span class='badge'>trade_count</span> 集計した取引件数（条件と並び替えに利用）" 
        }
    },

    // ==========================================
    // 第4章：偽装USBの証拠（13〜16）
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
        dialogue: "主任監査官：解析チームから極秘データの解析完了報告が入った！ 押収された全100件におよぶ『usb_inspection_records（USB容量検査記録）』がシステムに追加されたぞ。表示容量に対して実際に使える容量が何％か正確に計算し、奴らの偽装を手口を暴け。",
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
        title: "14. 悪質な容量詐称を判定せよ",
        desc: "usb_inspection_records から商品名、表示・実容量を取得し、実容量の2倍が表示容量以下なら「重大な偽装」、それ以外は「要確認」とする investigation_status を表示せよ。",
        orderSensitive: false,
        explanation: "【解説】CASE WHEN 構文を使うことで、条件分岐に応じた文字列や数値を動的に出力することができます。",
        expectedSql: "SELECT product_name, advertised_capacity, actual_capacity, CASE WHEN actual_capacity * 2 <= advertised_capacity THEN '重大な偽装' ELSE '要確認' END AS investigation_status FROM usb_inspection_records;",
        hints: [
            "【ヒント1】条件に応じて出力内容を変える条件分岐の構文を使用します。",
            "【ヒント2】実容量の2倍が表示容量以下になる条件式を記述しましょう。"
        ],
        dialogue: "主任監査官：実際の容量が表示容量の半分以下である悪質なものを『重大な偽装』と判定するように分類してくれ。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: { 
            title: "対象カラムの意味", 
            html: "• <span class='badge'>advertised_capacity</span> と <span class='badge'>actual_capacity</span> の比較判定" 
        }
    },
    {
        title: "15. 大容量モデルの不正を追跡せよ",
        desc: "usb_inspection_records から、表示容量（advertised_capacity）が 128 から 512 までの商品をすべて抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】BETWEEN 最小値 AND 最大値 を使うことで、指定した数値範囲内のデータを効率よく抽出できます。",
        expectedSql: "SELECT * FROM usb_inspection_records WHERE advertised_capacity BETWEEN 128 AND 512;",
        hints: [
            "【ヒント1】指定した数値の範囲内にあるデータを絞り込む便利な演算子を使用します。",
            "【ヒント2】最小値と最大値を指定して範囲を限定しましょう。"
        ],
        dialogue: "主任監査官：被害が大きくなりやすい大容量モデルに狙いを絞る。表示容量が128GBから512GBまでの商品を抽出してくれ。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: { 
            title: "対象カラムの意味", 
            html: "• <span class='badge'>advertised_capacity</span> 表示容量（範囲指定の対象）" 
        }
    },
    {
        title: "16. USB関連の検査記録を網羅せよ",
        desc: "usb_inspection_records から、商品名（product_name）に「USB」という文字が含まれている検査記録をすべて抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】LIKE 演算子とワイルドカード `%` を組み合わせることで、部分一致する文字列を検索できます。",
        expectedSql: "SELECT * FROM usb_inspection_records WHERE product_name LIKE '%USB%';",
        hints: [
            "【ヒント1】部分一致検索を行うための演算子とワイルドカードを組み合わせます。",
            "【ヒント2】検索したい文字の前後に特殊文字を配置しましょう。"
        ],
        dialogue: "主任監査官：容量偽装に関わるUSB関連の検査記録をすべて洗い出し、リストを最終確認しよう。",
        group: "💾 第4章：偽装USBの証拠",
        glossary: { 
            title: "対象カラムの意味", 
            html: "• <span class='badge'>product_name</span> 商品名（一部一致の検索対象）" 
        }
    },

    // ==========================================
    // 第5章：関係企業のネットワーク（17〜20）
    // ==========================================
    {
        title: "17. 取引と企業名を結合せよ",
        desc: "companies と external_storage_trade_records を company_id で結合し、会社名（company_name）とモデル番号（model_number）を表示せよ。",
        orderSensitive: false,
        explanation: "【解説】INNER JOIN と ON を使うことで、2つのテーブルで一致する ID などのキーを基にデータを結合できます。",
        expectedSql: "SELECT companies.company_name, external_storage_trade_records.model_number FROM companies INNER JOIN external_storage_trade_records ON companies.company_id = external_storage_trade_records.company_id;",
        hints: [
            "【ヒント1】2つのテーブルを紐付けるための結合キーワードを使用します。",
            "【ヒント2】両方のテーブルに存在する共通のIDキーを結合条件に指定しましょう。"
        ],
        dialogue: "主任監査官：いよいよ黒幕の正体に迫る本格的なJOIN捜査だ。会社情報と取引記録を結合し、どの企業がどのモデルを輸入したか完全に対比させよ。",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: { 
            title: "対象テーブル・カラム", 
            html: `
                • <span class='badge'>companies</span> 会社情報テーブル（company_name等）<br>
                • <span class='badge'>external_storage_trade_records</span> 取引記録テーブル（model_number等）<br>
                • 結合キー: <span class='badge'>company_id</span>
            ` 
        }
    },
    {
        title: "18. 取引と税関検査を結合せよ",
        desc: "external_storage_trade_records と customs_inspection_records を trade_id で結合し、取引ID、申告数量（quantity）、検査数量（inspected_quantity）を同時に表示せよ。",
        orderSensitive: false,
        explanation: "【解説】共通のキー（trade_id）で2つの記録テーブルを INNER JOIN し、比較しやすい形で表示します。",
        expectedSql: "SELECT external_storage_trade_records.trade_id, external_storage_trade_records.quantity, customs_inspection_records.inspected_quantity FROM external_storage_trade_records INNER JOIN customs_inspection_records ON external_storage_trade_records.trade_id = customs_inspection_records.trade_id;",
        hints: [
            "【ヒント1】2つの記録テーブルを結合するためのキーワードを適用します。",
            "【ヒント2】共通の取引IDを基にデータを結びつけましょう。"
        ],
        dialogue: "主任監査官：輸入取引の記録と税関検査の記録を trade_id で結合し、公式の申告数量と実際の検査数量を同じ画面で比較できるようにしてくれ。",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: { 
            title: "対象テーブル・カラム", 
            html: `
                • <span class='badge'>external_storage_trade_records</span> （quantity: 申告数量）<br>
                • <span class='badge'>customs_inspection_records</span> （inspected_quantity: 検査数量）<br>
                • 結合キー: <span class='badge'>trade_id</span>
            ` 
        }
    },
    {
        title: "19. 数量偽装の犯行グループを特定せよ",
        desc: "取引記録と税関検査記録を結合したうえで、実際の数量が申告数量より少ない貨物（数量偽装）だけを抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】JOIN でテーブルを結合したあとでも、WHERE句を追加して特定の条件でデータを絞り込めます。",
        expectedSql: "SELECT external_storage_trade_records.trade_id, external_storage_trade_records.quantity, customs_inspection_records.inspected_quantity FROM external_storage_trade_records INNER JOIN customs_inspection_records ON external_storage_trade_records.trade_id = customs_inspection_records.trade_id WHERE customs_inspection_records.inspected_quantity < external_storage_trade_records.quantity;",
        hints: [
            "【ヒント1】テーブルを結合した後に、さらに絞り込み用の条件句を追加します。",
            "【ヒント2】検査数量が申告数量未満である条件を指定しましょう。"
        ],
        dialogue: "主任監査官：結合したデータをもとに、数量偽装の決定的な証拠となる『実際の数量が少ない取引』を完全にあぶり出せ。",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: { 
            title: "対象テーブル・カラム", 
            html: "• <span class='badge'>quantity</span> と <span class='badge'>inspected_quantity</span> の比較条件を追加" 
        }
    },
    {
        title: "20. 検査をすり抜けた隠し貨物を暴け",
        desc: "external_storage_trade_records を基準に customs_inspection_records を LEFT JOIN し、税関検査記録が存在しない（IS NULL）取引のIDとモデル番号を抽出せよ。",
        orderSensitive: false,
        explanation: "【解説】LEFT JOIN は左側のテーブルの全データを残し、右側に合致するデータがない場合は NULL になります。WHERE IS NULL で検出できます。",
        expectedSql: "SELECT external_storage_trade_records.trade_id, external_storage_trade_records.model_number FROM external_storage_trade_records LEFT JOIN customs_inspection_records ON external_storage_trade_records.trade_id = customs_inspection_records.trade_id WHERE customs_inspection_records.trade_id IS NULL;",
        hints: [
            "【ヒント1】左側のテーブルを基準にして結びつける外部結合のキーワードを使用します。",
            "【ヒント2】対応する記録が存在しない（NULLである）データを抽出する条件を指定しましょう。"
        ],
        dialogue: "主任監査官：記録はあるのに、一度も税関検査をすり抜けている怪しい貨物（ID: T008など）がないか、LEFT JOINで隠された真実を暴き出せ！",
        group: "🔗 第5章：関係企業のネットワーク",
        glossary: { 
            title: "対象テーブル・カラム", 
            html: `
                • 左側: <span class='badge'>external_storage_trade_records</span><br>
                • 右側: <span class='badge'>customs_inspection_records</span><br>
                • 条件: <span class='badge'>IS NULL</span> で欠損データを検出
            ` 
        }
    },

    // ==========================================
    // 最終章：事件の全容解明（21）
    // ==========================================
    {
        title: "21. 事件の全容解明と総合捜査報告",
        desc: "companies と external_storage_trade_records および customs_inspection_records を LEFT JOIN ですべて結合し、すべての輸入取引に対する会社名、取引ID、申告数量、検査数量を一覧表示せよ。",
        orderSensitive: false,
        explanation: "【解説】複数テーブルを LEFT JOIN で繋ぐことで、検査記録の有無に関わらずすべての輸入取引と企業の関係を網羅した総合的な捜査報告書を作成できます。",
        expectedSql: "SELECT companies.company_name, external_storage_trade_records.trade_id, external_storage_trade_records.quantity, customs_inspection_records.inspected_quantity FROM companies INNER JOIN external_storage_trade_records ON companies.company_id = external_storage_trade_records.company_id LEFT JOIN customs_inspection_records ON external_storage_trade_records.trade_id = customs_inspection_records.trade_id;",
        hints: [
            "【ヒント1】複数のテーブルを段階的に結合（INNER と LEFT の組み合わせ）していきます。",
            "【ヒント2】重複する列名があるため、`テーブル名.カラム名` の形式で明確に指定しましょう。"
        ],
        dialogue: "主任監査官：いよいよ最終局面だ！これまでに集めた会社情報・輸入記録・税関検査のすべての証拠をLEFT JOINで統合し、首謀企業の不正全容を暴く総合捜査報告書を完成させてくれ！",
        group: "🎯 最終章：事件の全容解明",
        glossary: { 
            title: "対象テーブル・結合の流れ", 
            html: `
                • <span class='badge'>companies</span> ⋈ <span class='badge'>external_storage_trade_records</span>（INNER JOIN）<br>
                • ⟕ <span class='badge'>customs_inspection_records</span>（LEFT JOINで未検査も含める）
            ` 
        }
    }
];