let db = null;

async function initBrowserDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    db = new SQL.Database();

    db.run(`
        CREATE TABLE Company_Information_Records (
            company_id TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            address TEXT
        );
        CREATE TABLE Import_Records (
            trade_id TEXT PRIMARY KEY,
            company_id TEXT,
            model_number TEXT,
            product_name TEXT,
            category TEXT,
            quantity INTEGER,
            declared_value INTEGER,
            declaration_date TEXT,
            FOREIGN KEY (company_id) REFERENCES Company_Information_Records(company_id)
        );
        CREATE TABLE Customs_Inspection_Records (
            inspection_id TEXT PRIMARY KEY,
            trade_id TEXT,
            declared_quantity INTEGER,
            inspected_quantity INTEGER,
            inspection_date TEXT,
            FOREIGN KEY (trade_id) REFERENCES Import_Records(trade_id)
        );
        CREATE TABLE Port_Trade_Records (
            port_id TEXT PRIMARY KEY,
            trade_id TEXT,
            region TEXT,
            declared_value INTEGER,
            FOREIGN KEY (trade_id) REFERENCES Import_Records(trade_id)
        );
        CREATE TABLE USB_Inspection_Records (
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
    const companies = [
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
        ['C012', 'オーシャン・ゲート沖縄', '沖縄県那覇市']
    ];
    companies.forEach(row => db.run('INSERT INTO Company_Information_Records VALUES (?, ?, ?)', row));

    const tradeData = [];
    const models = ['CT-400', 'USB-1TB', 'SSD-2TB', 'MEM-512G', 'LAN-C6', 'HD-2TB', 'HUB-8P'];
    const names = {
        'CT-400': 'USB1TB',
        'USB-1TB': 'USB1TB',
        'SSD-2TB': '外付けSSD2TB',
        'MEM-512G': 'USB512GB',
        'LAN-C6': 'LANケーブルCat6',
        'HD-2TB': 'ハードディスク2TB',
        'HUB-8P': 'USBハブ8ポート'
    };
    const categories = {
        'CT-400': 'USBメモリ',
        'USB-1TB': 'USBメモリ',
        'SSD-2TB': 'ストレージ',
        'MEM-512G': 'USBメモリ',
        'LAN-C6': 'アクセサリ',
        'HD-2TB': 'ストレージ',
        'HUB-8P': 'アクセサリ'
    };

    // C004（アオバ・マイクロ）を本命とし、他社も一部に気になるデータを持たせて途中で断定しにくくする
    const core = [
        ['T001', 'C001', 'CT-400', 'USB1TB', 'USBメモリ', 2000, 96000000, '2026-01-10'],
        ['T002', 'C002', 'CT-400', 'USB1TB', 'USBメモリ', 3000, 150000000, '2026-01-15'],
        ['T003', 'C003', 'CT-400', 'USB1TB', 'USBメモリ', 2000, 100000000, '2026-02-05'],
        ['T004', 'C004', 'CT-400', 'USB1TB', 'USBメモリ', 2000, 12000000, '2026-02-12'],
        ['T005', 'C004', 'CT-400', 'USB1TB', 'USBメモリ', 3000, 18000000, '2026-03-01'],
        ['T006', 'C005', 'CT-400', 'USB1TB', 'USBメモリ', 3000, 150000000, '2026-03-05'],
        ['T007', 'C006', 'CT-400', 'USB1TB', 'USBメモリ', 4000, 196000000, '2026-03-10'],
        ['T008', 'C007', 'CT-400', 'USB1TB', 'USBメモリ', 2000, 104000000, '2026-03-15'],
        ['T009', 'C008', 'CT-400', 'USB1TB', 'USBメモリ', 3000, 152000000, '2026-03-20'],
        ['T010', 'C009', 'CT-400', 'USB1TB', 'USBメモリ', 2000, 98000000, '2026-03-22'],
        ['T011', 'C010', 'CT-400', 'USB1TB', 'USBメモリ', 4000, 204000000, '2026-03-25'],
        ['T012', 'C011', 'CT-400', 'USB1TB', 'USBメモリ', 2000, 100000000, '2026-03-28'],
        ['T013', 'C012', 'CT-400', 'USB1TB', 'USBメモリ', 3000, 149000000, '2026-03-30'],
        ['T014', 'C004', 'CT-400', 'USB1TB', 'USBメモリ', 3000, 16500000, '2026-03-31'],
        ['T015', 'C004', 'CT-400', 'USB1TB', 'USBメモリ', 4000, 22000000, '2026-04-01'],
        ['T016', 'C007', 'CT-400', 'USB1TB', 'USBメモリ', 2000, 102000000, '2026-04-02'],
        ['T017', 'C001', 'CT-400', 'USB1TB', 'USBメモリ', 4000, 192000000, '2026-04-03']
    ];
    core.forEach(row => tradeData.push(row));

    for (let i = 18; i <= 1000; i++) {
        const id = 'T' + String(i).padStart(4, '0');
        let compNum = i % 7 === 0 ? 4 : i % 9 === 0 ? 1 : (i % 12) + 1;
        const compId = 'C0' + String(compNum).padStart(2, '0');
        const model = models[i % models.length];
        const qty = ((i % 4) + 1) * 1000;
        const val = (compId === 'C004' && model === 'CT-400') ? qty * 6000 : qty * 50000;
        const month = String((i % 3) + 1).padStart(2, '0');
        const day = String((i % 28) + 1).padStart(2, '0');
        tradeData.push([id, compId, model, names[model], categories[model], qty, val, `2026-${month}-${day}`]);
    }
    tradeData.forEach(row => db.run('INSERT INTO Import_Records VALUES (?, ?, ?, ?, ?, ?, ?, ?)', row));

    // tradeId -> companyId マップを用意して検査データやUSB検査データを調整
    const tradeCompanyMap = new Map(tradeData.map(row => [row[0], row[1]]));

    let inspectionCounter = 1;
    tradeData.forEach((row, idx) => {
        const [tradeId, compId, , , , qty] = row;
        // T008（C007）は未検査（Customs_Inspection_Records に登録しない）
        if (tradeId === 'T008') return;

        let inspected = qty;
        if (tradeId === 'T004') inspected = qty - 350;
        else if (tradeId === 'T005') inspected = qty - 280;
        else if (tradeId === 'T014' || tradeId === 'T015') inspected = qty - 260;
        else if (compId === 'C004' && idx % 21 === 0) inspected = qty - 220;
        else if (tradeId === 'T001') inspected = qty - 15;
        else if (idx % 100 === 50) inspected = idx % 200 === 50 ? qty - 220 : qty + 10;

        db.run('INSERT INTO Customs_Inspection_Records VALUES (?, ?, ?, ?, ?)',
            ['I' + String(inspectionCounter++).padStart(4, '0'), tradeId, qty, inspected, '2026-03-15']);
    });

    const highRegions = ['中央', '東部', '東北'];
    const lowRegions = ['北部', '南部', '西部', '西南', '東南', '西北'];
    tradeData.forEach((row, idx) => {
        const [tradeId, compId, , , , , value] = row;
        let reg = lowRegions[idx % lowRegions.length];
        let declaredValue = value;
        if (compId === 'C004' || compId === 'C007') reg = highRegions[idx % highRegions.length];
        else if (declaredValue >= 100000000 && idx % 10 < 7) reg = highRegions[idx % highRegions.length];
        else if (declaredValue >= 100000000) {
            declaredValue = 50000000;
        }
        db.run('INSERT INTO Port_Trade_Records VALUES (?, ?, ?, ?)',
            ['P' + String(idx + 1).padStart(4, '0'), tradeId, reg, declaredValue]);
    });

    tradeData.forEach((row, idx) => {
        const [tradeId, , , productName] = row;
        const compId = tradeCompanyMap.get(tradeId);
        let adv = 512;
        let name = productName;
        if (productName.includes('512GB')) adv = 512;
        else if (productName.includes('SSD') || productName.includes('ハードディスク')) adv = idx % 6 === 0 ? 2048 : 1024;
        else {
            const mod = idx % 3;
            if (mod === 0) { adv = 256; name = 'USB256GB'; }
            else if (mod === 1) { adv = 512; name = 'USB512GB'; }
            else { adv = 1024; name = 'USB1TB'; }
        }

        let act = adv;
        // C004 の対象取引（T004, T005, T014, T015 など）を重大な異常（50%未満）にする
        if (['T004', 'T005', 'T014', 'T015'].includes(tradeId)) {
            adv = 1024; name = 'USB1TB'; act = 64;
        } else if (['T008', 'T016'].includes(tradeId)) {
            // C007 は容量正常にして「未検査（T008）だが容量は正常」というまぎらわしさを作る
            adv = 1024; name = 'USB1TB'; act = 1024;
        } else if (compId === 'C004' && idx % 21 === 0) {
            adv = 1024; name = 'USB1TB'; act = 64;
        } else if (idx % 100 === 0) {
            act = idx % 200 === 0 ? Math.round(adv / 16) : Math.round(adv / 8);
        } else if (adv === 256 && idx % 50 === 0) {
            act = 64;
        } else if (idx % 40 === 0) {
            act = Math.round(adv * 0.75);
        }

        db.run('INSERT INTO USB_Inspection_Records VALUES (?, ?, ?, ?, ?)',
            ['U' + String(idx + 1).padStart(4, '0'), tradeId, name, adv, act]);
    });
}
