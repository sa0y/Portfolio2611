let db = null;

async function initBrowserDatabase() {
    const config = {
        locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${filename}`
    };
    const SQL = await initSqlJs(config);
    db = new SQL.Database();

    // 1. 会社マスターデータ
    db.run(`
        CREATE TABLE companies (
            company_id TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            address TEXT
        );
    `);

    // 💡 修正1: テーブル名を変更
    // 2. 商品の輸入・取引記録
    db.run(`
        CREATE TABLE external_storage_trade_records (
            trade_id TEXT PRIMARY KEY,
            company_id TEXT,
            model_number TEXT,
            product_name TEXT,
            quantity INTEGER,
            declared_value INTEGER,
            declaration_date TEXT,
            FOREIGN KEY (company_id) REFERENCES companies(company_id)
        );
    `);

    // 3. 税関検査記録（外部キーの参照先も変更）
    db.run(`
        CREATE TABLE customs_inspection_records (
            inspection_id TEXT PRIMARY KEY,
            trade_id TEXT,
            declared_quantity INTEGER,
            inspected_quantity INTEGER,
            inspection_date TEXT,
            FOREIGN KEY (trade_id) REFERENCES external_storage_trade_records(trade_id)
        );
    `);

    // 4. 港湾地域別取引記録（外部キーの参照先も変更）
    db.run(`
        CREATE TABLE port_trade_records (
            port_id TEXT PRIMARY KEY,
            trade_id TEXT,
            region TEXT,
            declared_value INTEGER,
            FOREIGN KEY (trade_id) REFERENCES external_storage_trade_records(trade_id)
        );
    `);

    // 5. USB容量検査記録（外部キーの参照先も変更）
    db.run(`
        CREATE TABLE usb_inspection_records (
            usb_id TEXT PRIMARY KEY,
            trade_id TEXT,
            product_name TEXT,
            advertised_capacity INTEGER,
            actual_capacity INTEGER,
            FOREIGN KEY (trade_id) REFERENCES external_storage_trade_records(trade_id)
        );
    `);

    seedInitialData();
}

function seedInitialData() {
    // ----------------------------------------------------
    // 1. 会社マスター (12社)
    // ----------------------------------------------------
    const companiesData = [
        ['C001', 'ノース・アライアンス商事', '宮城県仙台市青葉区'],
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
        ['C012', 'シャドウ・エクスポート', '不明（実態のないペーパーカンパニー）']
    ];
    companiesData.forEach(row => {
        db.run(`INSERT INTO companies VALUES (?, ?, ?)`, row);
    });

    // ----------------------------------------------------
    // 2. 輸入・取引データ（総数1,000件の大規模スケール）
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

    // 🚨 序盤の重要ストーリー用データ（C001の怪しい安値＆未検査の隠し貨物 T008など）
    const coreTradeData = [
        ['T001', 'C001', 'CT-400', 'USB128GB', 2000, 10000000, '2026-01-10'],
        ['T002', 'C001', 'CT-400', 'USB128GB', 3000, 15000000, '2026-01-12'],
        ['T003', 'C002', 'CT-400', 'USB128GB', 2000, 100000000, '2026-02-05'],
        ['T004', 'C003', 'CT-400', 'USB128GB', 4000, 200000000, '2026-02-12'],
        ['T005', 'C004', 'CT-400', 'USB128GB', 2000, 102000000, '2026-03-01'],
        ['T006', 'C005', 'CT-400', 'USB128GB', 3000, 150000000, '2026-03-05'],
        ['T007', 'C006', 'CT-400', 'USB128GB', 4000, 196000000, '2026-03-10'],
        ['T008', 'C007', 'CT-400', 'USB128GB', 2000, 104000000, '2026-03-15'], // ※T008は税関検査をすり抜ける隠し貨物！
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
        
        tradeData.push([id, compId, model, productName, qty, val, `2026-0${month}-${day}`]);
    }

    tradeData.forEach(row => {
        db.run(`INSERT INTO external_storage_trade_records VALUES (?, ?, ?, ?, ?, ?, ?)`, row);
    });

    // ----------------------------------------------------
    // 3. 税関検査記録（大半は一致。C001や黒幕の取引だけが「300〜500個」の大規模不足）
    // ----------------------------------------------------
    let inspCounter = 1;
    tradeData.forEach(([tradeId, compId, model, name, qty, val, date]) => {
        if (tradeId === 'T008') return; // T008は検査記録なし（未検査の隠し貨物）
        
        const inspId = 'I' + String(inspCounter++).padStart(4, '0');
        let inspected = qty; // デフォルトは完全一致（正常データはノイズなし）

        // C001の取引、または特定の間隔の取引で、コンテナ単位の巨大な抜き取り（300〜500個不足）を発生させる
        if (compId === 'C001') {
            inspected = qty - 500; // C001は常に500個ごっそり消えている！
        } else if (tradeId === 'T015' || tradeId === 'T0100' || tradeId === 'T0250' || tradeId === 'T0500') {
            inspected = qty - 350; // 共犯グループも大規模に不足
        }

        db.run(`INSERT INTO customs_inspection_records VALUES (?, ?, ?, ?, ?)`, [inspId, tradeId, qty, inspected, '2026-03-15']);
    });

    // ----------------------------------------------------
    // 4. 港湾取引データ（全1,000件の配分を完全に固定・制御）
    // 配分：中央ふ頭=400件（ハブ）, 北部=200件, 東部=200件, 南部=100件, 西部=100件
    // ----------------------------------------------------
    const regionSlots = [];
    for (let i = 0; i < 400; i++) regionSlots.push('中央ふ頭');
    for (let i = 0; i < 200; i++) regionSlots.push('北部コンテナヤード');
    for (let i = 0; i < 200; i++) regionSlots.push('東部ターミナル');
    for (let i = 0; i < 100; i++) regionSlots.push('南部倉庫地区');
    for (let i = 0; i < 100; i++) regionSlots.push('西部物流センター');

    // 配分用の配列をあらかじめランダムにシャッフル（偏りをなくすため）
    for (let i = regionSlots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [regionSlots[i], regionSlots[j]] = [regionSlots[j], regionSlots[i]];
    }

    tradeData.forEach((row, idx) => {
        const portId = 'P' + String(idx + 1).padStart(4, '0');
        const tradeId = row[0];
        
        // シャッフル済みの配列から順番に取得するため、1,000件の合計が必ずキレイに割り振られます
        const reg = regionSlots[idx];
        const val = row[5];
        
        db.run(`INSERT INTO port_trade_records VALUES (?, ?, ?, ?)`, [portId, tradeId, reg, val]);
    });
    // ----------------------------------------------------
    // 5. USB容量検査データ（全1,000件に対応）
    // ----------------------------------------------------
    tradeData.forEach((row, idx) => {
        const usbId = 'U' + String(idx + 1).padStart(4, '0');
        const tradeId = row[0];
        const productName = row[3];
        let adv = 128;
        if (productName.includes('64GB')) adv = 64;
        else if (productName.includes('SSD') || productName.includes('ハードディスク')) adv = 1024;

        let act = adv;
        // 一定の割合で偽装USB（実容量が半分や1/8）を混ぜ込む
        if (idx % 7 === 0 && adv >= 128) act = adv / 8;
        else if (idx % 11 === 0 && adv >= 128) act = adv / 2;

        db.run(`INSERT INTO usb_inspection_records VALUES (?, ?, ?, ?, ?)`, [usbId, tradeId, productName, adv, act]);
    });
}
