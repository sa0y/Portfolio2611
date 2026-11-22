let db = null;

async function initBrowserDatabase() {
    const config = {
        locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${filename}`
    };
    const SQL = await initSqlJs(config);
    db = new SQL.Database();

    // 1. 会社マスターデータ
    db.run(`
        CREATE TABLE Company_Information_Records (
            company_id TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            address TEXT
        );
    `);

    // 💡 修正1: テーブル名を変更
    // 2. 商品の輸入・取引記録
    db.run(`
        CREATE TABLE Import_Records (
            trade_id TEXT PRIMARY KEY,
            company_id TEXT,
            model_number TEXT,
            product_name TEXT,
            quantity INTEGER,
            declared_value INTEGER,
            declaration_date TEXT,
            FOREIGN KEY (company_id) REFERENCES Company_Information_Records(company_id)
        );
    `);

    // 3. 税関検査記録（外部キーの参照先も変更）
    db.run(`
        CREATE TABLE Customs_Inspection_Records (
            inspection_id TEXT PRIMARY KEY,
            trade_id TEXT,
            declared_quantity INTEGER,
            inspected_quantity INTEGER,
            inspection_date TEXT,
            FOREIGN KEY (trade_id) REFERENCES Import_Records(trade_id)
        );
    `);

    // 4. 港湾地域別取引記録（外部キーの参照先も変更）
    db.run(`
        CREATE TABLE Port_Trade_Records (
            port_id TEXT PRIMARY KEY,
            trade_id TEXT,
            region TEXT,
            declared_value INTEGER,
            FOREIGN KEY (trade_id) REFERENCES Import_Records(trade_id)
        );
    `);

    // 5. USB容量検査記録（外部キーの参照先も変更）
    db.run(`
        CREATE TABLE Usb_inspection_Records (
            usb_id TEXT PRIMARY KEY,
            trade_id TEXT,
            product_name TEXT,
            advertised_capacity INTEGER,
            actual_capacity INTEGER,
            FOREIGN KEY (trade_id) REFERENCES Import_Records(trade_id)
        );
    `);

    seedInitialData();
}

function seedInitialData() {
    // ----------------------------------------------------
    // 1. 会社マスター
    // ----------------------------------------------------
    const Company_Information_RecordsData = [
        ['C001', 'ノース・アライアンス商事', '北海道札幌市中央区'],
        ['C002', '仙都エレクトロニクス', '宮城県名取市'],
        ['C003', 'みちのく流通', '東京都港区芝浦'],
        ['C004', 'アオバ・マイクロ', '宮城県仙台市泉区'],
        ['C005', 'ネオ・テクノロジー', '東京都千代田区'],
        ['C006', 'タイタン・インダストリー', '神奈川県横浜市中区'],
        ['C007', '三陸フロンティア', '宮城県石巻市'],
        ['C008', 'パシフィック・エクスポート', '大阪府大阪市中央区'],
        ['C009', 'サイバー・リンクス', '福岡県福岡市博多区'],
        ['C010', 'ノースポート商事', '北海道札幌市中央区'],
        ['C011', 'セントラル・ロジ', '埼玉県さいたま市大宮区'],
        ['C012', 'オーシャン・ゲート沖縄', '沖縄県那覇市'],
    ];
    Company_Information_RecordsData.forEach(row => {
        db.run(`INSERT INTO Company_Information_Records VALUES (?, ?, ?)`, row);
    });

    // ----------------------------------------------------
    // 2. 輸入・取引データ
    // ----------------------------------------------------
    const tradeData = [];
    const models = ['CT-400', 'USB-128', 'SSD-1TB', 'MEM-64G', 'LAN-C6', 'HD-2TB', 'HUB-8P'];
    const names = {
        'CT-400': 'USB128GB',
        'USB-128': 'USB128GB',
        'SSD-1TB': '外付けSSD1TB',
        'MEM-64G': 'SDカード64GB',
        'LAN-C6': 'LANケーブルCat6',
        'HD-2TB': 'ハードディスク2TB',
        'HUB-8P': 'USBハブ8ポート'
    };

    // 🚨 序盤の重要ストーリー用データ
    const coreTradeData = [
        ['T001', 'C001', 'CT-400', 'USB128GB', 2000, 10000000, '2026-01-10'],
        ['T002', 'C001', 'CT-400', 'USB128GB', 3000, 15000000, '2026-01-12'],
        ['T003', 'C002', 'CT-400', 'USB128GB', 2000, 100000000, '2026-02-05'],
        ['T004', 'C003', 'CT-400', 'USB128GB', 4000, 200000000, '2026-02-12'],
        ['T005', 'C004', 'CT-400', 'USB128GB', 2000, 102000000, '2026-03-01'],
        ['T006', 'C005', 'CT-400', 'USB128GB', 3000, 150000000, '2026-03-05'],
        ['T007', 'C006', 'CT-400', 'USB128GB', 4000, 196000000, '2026-03-10'],
        ['T008', 'C007', 'CT-400', 'USB128GB', 2000, 104000000, '2026-03-15'],
        ['T009', 'C008', 'CT-400', 'USB128GB', 3000, 152000000, '2026-03-20'],
        ['T010', 'C009', 'CT-400', 'USB128GB', 2000, 98000000, '2026-03-22'],
        ['T011', 'C010', 'CT-400', 'USB128GB', 4000, 204000000, '2026-03-25'],
        ['T012', 'C011', 'CT-400', 'USB128GB', 2000, 100000000, '2026-03-28'],
        ['T013', 'C012', 'CT-400', 'USB128GB', 3000, 149000000, '2026-03-30'],
        ['T014', 'C001', 'CT-400', 'USB128GB', 3000, 15000000, '2026-03-31'],
        ['T015', 'C002', 'CT-400', 'USB128GB', 4000, 200000000, '2026-04-01'],
        ['T016', 'C003', 'CT-400', 'USB128GB', 2000, 100000000, '2026-04-02'],
        ['T017', 'C004', 'CT-400', 'USB128GB', 4000, 198000000, '2026-04-03']
    ];

    coreTradeData.forEach(row => tradeData.push(row));

    // 残りのデータを自動生成して、合計1,000件にする
    for (let i = 18; i <= 1000; i++) {
        const id = 'T' + String(i).padStart(4, '0'); // T0018 〜 T1000
        const compId = 'C0' + String((i % 12) + 1).padStart(2, '0');
        const model = models[i % models.length];
        const productName = names[model];

        const qty = (((i % 4) + 1) * 1000); // 1000, 2000, 3000, 4000個の大規模ロット
        const val = qty * 50000;

        // 日付を分散させる
        const month = String((i % 3) + 1).padStart(2, '0');
        const day = String((i % 28) + 1).padStart(2, '0');

        tradeData.push([id, compId, model, productName, qty, val, `2026-${month}-${day}`]);
    }

    tradeData.forEach(row => {
        db.run(`INSERT INTO Import_Records VALUES (?, ?, ?, ?, ?, ?, ?)`, row);
    });

    // ----------------------------------------------------
    // 3. 税関検査記録
    // ----------------------------------------------------
    let inspCounter = 1;
    tradeData.forEach(([tradeId, compId, model, name, qty, val, date], idx) => {
        if (tradeId === 'T008') return; // T008は検査記録なし（未検査の隠し貨物）

        const inspId = 'I' + String(inspCounter++).padStart(4, '0');
        let inspected = qty; // 基本は一致させる

        // ストーリー用の特定記録 + 全体の約1%（10件）だけズレを入れる
        if (tradeId === 'T001') {
            inspected = qty - 1;
        } else if (tradeId === 'T002') {
            inspected = qty + 1;
        } else if (tradeId === 'T003') {
            inspected = qty + 25;
        } else if (tradeId === 'T004') {
            inspected = qty - 12;
        } else if (tradeId === 'T005') {
            inspected = qty - 350;
        } else if (tradeId === 'T015' || tradeId === 'T0100' || tradeId === 'T0250' || tradeId === 'T0500') {
            inspected = qty - 280;
        } else if (idx % 100 === 50) {
            // 全体の1%（10件）だけ追加でズレを作る（不足・超過を混ぜる）
            inspected = idx % 200 === 50 ? qty - 220 : qty + 10;
        }

        db.run(`INSERT INTO Customs_Inspection_Records VALUES (?, ?, ?, ?, ?)`, [inspId, tradeId, qty, inspected, '2026-03-15']);
    });

    // ----------------------------------------------------
    // 4. 港湾取引データ（特定の地域だけに1億円以上の高額取引を集める）
    // 高額（1億円以上）が出る地域：中央、東部、東北
    // 1億円未満の地域：北部、南部、西部、西南、東南、西北
    // ----------------------------------------------------
    const highValueRegions = [
        '中央',
        '東部',
        '東北'
    ];

    const lowValueRegions = [
        '北部',
        '南部',
        '西部',
        '西南',
        '東南',
        '西北'
    ];

    tradeData.forEach((row, idx) => {
        const portId = 'P' + String(idx + 1).padStart(4, '0');
        const tradeId = row[0];
        let val = row[5];
        let reg;

        if (val >= 100000000) {
            // 1億円以上の取引は、約70%を高額対象地域、約30%を1億円未満に調整して低額地域へ
            if (idx % 10 < 7) {
                reg = highValueRegions[idx % highValueRegions.length];
            } else {
                val = 50000000;
                reg = lowValueRegions[idx % lowValueRegions.length];
            }
        } else {
            // 1億円未満の取引は、低額地域を中心に振り分け（一部を高額対象地域にも配置）
            if (idx % 5 === 0) {
                reg = highValueRegions[idx % highValueRegions.length];
            } else {
                reg = lowValueRegions[idx % lowValueRegions.length];
            }
        }

        db.run(`INSERT INTO Port_Trade_Records VALUES (?, ?, ?, ?)`, [portId, tradeId, reg, val]);
    });

    // ----------------------------------------------------
    // 5. USB容量検査データ
    // ・64GB：小型/SDカード系
    // ・128GB：標準ライン
    // ・256GB〜512GB：USBメモリの大容量ライン
    // ・1024GB（1TB）〜2048GB（2TB）：超大容量ライン
    // ----------------------------------------------------
    tradeData.forEach((row, idx) => {
        const usbId = 'U' + String(idx + 1).padStart(4, '0');
        const tradeId = row[0];
        let productName = row[3];

        let adv = 128;
        if (productName.includes('64GB')) {
            adv = 64;
        } else if (productName.includes('SSD') || productName.includes('ハードディスク')) {
            adv = (idx % 6 === 0) ? 2048 : 1024;
        } else {
            // USB系は 128 / 256 / 512 / 1024 を混在させる
            const mod = idx % 5;
            if (mod === 1) {
                adv = 256;
                productName = 'USB256GB';
            } else if (mod === 2) {
                adv = 512;
                productName = 'USB512GB';
            } else if (mod === 3) {
                adv = 1024;
                productName = 'USB1TB';
            } else {
                adv = 128;
            }
        }

        let act = adv;
        if (idx % 100 === 0 && adv >= 128) {
            act = idx % 200 === 0 ? Math.round(adv / 16) : Math.round(adv / 8); // 重大偽装（6.3% / 12.5%）
        } else if (adv === 64 && idx % 50 === 0) {
            act = 16; // 重大偽装（25%）
        } else if (idx % 40 === 0) {
            act = Math.round(adv * 0.75); // 要確認（75%：50%以上〜100%未満）
        }

     db.run(`INSERT INTO Usb_inspection_Records VALUES (?, ?, ?, ?, ?)`, [usbId, tradeId, productName, adv, act]);
    });
}
