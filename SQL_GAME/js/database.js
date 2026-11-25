let db = null;

async function initBrowserDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });
    db = new SQL.Database();

    db.run(`
        CREATE TABLE Companies (
            company_id TEXT PRIMARY KEY,
            company_name TEXT NOT NULL,
            address TEXT
        );
        CREATE TABLE Imports (
            trade_id TEXT PRIMARY KEY,
            company_id TEXT,
            model_number TEXT,
            product_name TEXT,
            category TEXT,
            quantity INTEGER,
            received_quantity INTEGER,
            declared_value INTEGER,
            declaration_date TEXT,
            declared_weight_kg REAL,
            actual_weight_kg REAL,
            advertised_capacity INTEGER,
            actual_capacity INTEGER,
            FOREIGN KEY (company_id) REFERENCES Companies(company_id)
        );
        CREATE TABLE Containers (
            container_record_id TEXT PRIMARY KEY,
            trade_id TEXT,
            container_area TEXT,
            container_number TEXT,
            FOREIGN KEY (trade_id) REFERENCES Imports(trade_id)
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
    companies.forEach(row => db.run('INSERT INTO Companies VALUES (?, ?, ?)', row));

    // trade_id, company_id, model_number, product_name, category, quantity, received_quantity,
    // declared_value, declaration_date, declared_weight_kg, actual_weight_kg,
    // advertised_capacity, actual_capacity
    const importData = [
        ['T001', 'C001', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 2000, 1985, 96000000, '2026-08-10', 120.0, 120.0, 1024, 1024],
        ['T002', 'C002', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 3000, 3000, 150000000, '2026-08-15', 180.0, 180.0, 1024, 1024],
        ['T003', 'C003', 'MEM-512G', 'USB512GB Type-C', 'USBメモリ', 2000, 2000, 100000000, '2026-08-25', 120.0, 120.0, 512, 512],

        // 切り口①：数量不足 ＋ 重量オーバー（数は少ないのに重い＝何か詰まっている）
        ['T004', 'C004', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 2000, 1650, 12000000, '2026-09-02', 120.0, 168.5, 1024, 1024],
        ['T005', 'C004', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 3000, 2720, 18000000, '2026-09-08', 180.0, 235.0, 1024, 1024],

        ['T006', 'C005', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 3000, 3000, 150000000, '2026-09-12', 180.0, 180.0, 1024, 1024],
        ['T007', 'C006', 'SSD-2TB', '外付けSSD2TB Type-C', 'ストレージ', 4000, 4000, 196000000, '2026-09-15', 240.0, 240.0, 2048, 2048],

        // 受入数量未記録（received_quantity = NULL）の例
        ['T008', 'C007', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 2000, null, 104000000, '2026-09-18', 120.0, 120.0, 1024, 1024],

        ['T009', 'C008', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 3000, 3000, 152000000, '2026-09-20', 180.0, 180.0, 1024, 1024],
        ['T010', 'C009', 'LAN-C6', 'LANケーブルCat6', 'アクセサリ', 2000, 2000, 98000000, '2026-09-22', 120.0, 120.0, 512, 512],
        ['T011', 'C010', 'HD-2TB', 'ハードディスク2TB Type-A', 'ストレージ', 4000, 4000, 204000000, '2026-09-25', 240.0, 240.0, 2048, 2048],
        ['T012', 'C011', 'HUB-8P', 'USBハブ8ポート Type-C', 'アクセサリ', 2000, 2000, 100000000, '2026-09-28', 120.0, 120.0, 512, 512],
        ['T013', 'C012', 'MEM-512G', 'USB512GB Type-C', 'USBメモリ', 3000, 3000, 149000000, '2026-09-30', 180.0, 180.0, 512, 512],

        // 切り口②：USB容量不足（広告1024GBに対して実容量64GB）
        ['T014', 'C004', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 3000, 3000, 16500000, '2026-10-01', 180.0, 180.0, 1024, 64],
        ['T015', 'C004', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 4000, 4000, 22000000, '2026-10-02', 240.0, 240.0, 1024, 64],

        ['T016', 'C007', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 2000, 2000, 102000000, '2026-10-03', 120.0, 120.0, 1024, 1024],
        ['T017', 'C001', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 4000, 4000, 192000000, '2026-10-04', 240.0, 240.0, 1024, 1024],

        // ちょっとした数量ズレの例（受入3個多い / 受入1個少ない）
        ['T018', 'C002', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 3000, 3003, 150000000, '2026-10-05', 180.0, 180.0, 1024, 1024],
        ['T019', 'C005', 'TECH-26', 'USB1TB 2-in-1', 'USBメモリ', 2000, 1999, 100000000, '2026-10-06', 120.0, 120.0, 1024, 1024]
    ];

    const models = ['TECH-26', 'USB-1TB', 'SSD-2TB', 'MEM-512G', 'LAN-C6', 'HD-2TB', 'HUB-8P'];
    const names = {
        'TECH-26': 'USB1TB 2-in-1',
        'USB-1TB': 'USB1TB Type-A',
        'SSD-2TB': '外付けSSD2TB Type-C',
        'MEM-512G': 'USB512GB Type-C',
        'LAN-C6': 'LANケーブルCat6',
        'HD-2TB': 'ハードディスク2TB Type-A',
        'HUB-8P': 'USBハブ8ポート Type-C'
    };
    const categories = {
        'TECH-26': 'USBメモリ',
        'USB-1TB': 'USBメモリ',
        'SSD-2TB': 'ストレージ',
        'MEM-512G': 'USBメモリ',
        'LAN-C6': 'アクセサリ',
        'HD-2TB': 'ストレージ',
        'HUB-8P': 'アクセサリ'
    };

    // TECH-26 を扱うのは全体の半分（6社）に限定
    const tech26Companies = ['C001', 'C002', 'C004', 'C005', 'C007', 'C008'];

    // 会社ごとの取引件数に差をつけるための重み付けテーブル（合計30枠）
    const companyWeights = [
        1, 1, 2, 3, // C001〜C004
        4, 2, 2, 5, // C005〜C008
        1, 3, 4, 2  // C009〜C012
    ];
    const weightedPool = [];
    companyWeights.forEach((weight, idx) => {
        const compId = 'C0' + String(idx + 1).padStart(2, '0');
        for (let w = 0; w < weight; w++) {
            weightedPool.push(compId);
        }
    });

    let tech26Seq = 0;
    for (let i = 20; i <= 1000; i++) {
        const id = 'T' + String(i).padStart(4, '0');
        const model = models[i % models.length];
        const isTech26 = model === 'TECH-26';

        const compId = isTech26
            ? tech26Companies[(tech26Seq * 5 + Math.floor(tech26Seq / 6)) % tech26Companies.length]
            : weightedPool[i % weightedPool.length];

        const qtySeed = isTech26 ? (i + tech26Seq * 3) : i;
        const qty = ((qtySeed % 4) + 1) * 1000;
        const val = qty * 50000;

        // 84件周期で同じ日付・同じ会社・同じ数量が重ならないよう分散
        const monthNum = isTech26
            ? (((i + tech26Seq * 2) % 3) + 8)
            : ((i % 3) + 8);
        const dayNum = isTech26
            ? ((((i * 11) + tech26Seq * 13) % 28) + 1)
            : (((i * 7) % 28) + 1);
        if (isTech26) tech26Seq++;

        const month = String(monthNum).padStart(2, '0');
        const day = String(dayNum).padStart(2, '0');
        const receivedQty = qty;
        const declaredWeight = Number((qty * 0.06).toFixed(1));
        const actualWeight = declaredWeight;

        let adv = 512;
        let prodName = names[model];
        if (prodName.includes('512GB')) {
            adv = 512;
            prodName = 'USB512GB Type-C';
        } else if (prodName.includes('SSD') || prodName.includes('ハードディスク')) {
            adv = i % 6 === 0 ? 2048 : 1024;
        } else if (prodName.includes('USB')) {
            const mod = i % 3;
            if (mod === 0) { adv = 256; prodName = 'USB256GB Type-C'; }
            else if (mod === 1) { adv = 512; prodName = 'USB512GB Type-A'; }
            else { adv = 1024; prodName = 'USB1TB 2-in-1'; }
        }
        const act = adv;

        importData.push([
            id, compId, model, prodName, categories[model], qty, receivedQty, val,
            `2026-${month}-${day}`, declaredWeight, actualWeight, adv, act
        ]);
    }

    importData.forEach(row => db.run(
        `INSERT INTO Imports (
            trade_id, company_id, model_number, product_name, category, quantity,
            received_quantity, declared_value, declaration_date, declared_weight_kg,
            actual_weight_kg, advertised_capacity, actual_capacity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        row
    ));

    const areas = ['Aヤード', 'Bヤード', 'Cヤード', 'Dヤード', 'Eヤード', 'Fヤード'];
    const specialContainers = {
        'T004': ['Bヤード', 'CNT-204'],
        'T005': ['Bヤード', 'CNT-205'],
        'T014': ['Bヤード', 'CNT-214'],
        'T015': ['Bヤード', 'CNT-215']
    };

    importData.forEach((row, idx) => {
        const tradeId = row[0];
        const [area, containerNo] = specialContainers[tradeId] || [
            areas[idx % areas.length],
            'CNT-' + String((idx % 90) + 101)
        ];
        db.run('INSERT INTO Containers VALUES (?, ?, ?, ?)', [
            'CR' + String(idx + 1).padStart(4, '0'),
            tradeId,
            area,
            containerNo
        ]);
    });
}
