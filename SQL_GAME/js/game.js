let codename = localStorage.getItem('sql_game_codename') || 'GUEST';
let clearedMissions = JSON.parse(localStorage.getItem('sql_game_cleared') || '[]');
let currentMissionIndex = parseInt(localStorage.getItem('sql_game_last_mission') || '0', 10);
const chapterOrder = [...new Set(missions.map(m => m.group))];
let currentChapter = "";
let currentHintIndex = 1;
let briefingTabsViewed = new Set();

const databaseLibraryTables = [
    {
        name: 'Company_Information_Records',
        label: '会社情報',
        columns: [
            ['company_id', '会社ID'],
            ['company_name', '会社名'],
            ['address', '住所']
        ]
    },
    {
        name: 'Import_Records',
        label: '輸入・取引記録',
        columns: [
            ['trade_id', '取引ID'],
            ['company_id', '会社ID'],
            ['model_number', '製品の型番'],
            ['product_name', '商品名'],
            ['quantity', '輸入数量'],
            ['declared_value', '申告額'],
            ['declaration_date', '申告日']
        ]
    },
    {
        name: 'Customs_Inspection_Records',
        label: '税関検査記録',
        columns: [
            ['inspection_id', '税関検査ID'],
            ['trade_id', '取引ID'],
            ['declared_quantity', '申告数量'],
            ['inspected_quantity', '検査数量'],
            ['inspection_date', '検査日']
        ]
    },
    {
        name: 'Port_Trade_Records',
        label: '港湾地域別取引記録',
        columns: [
            ['port_id', '港湾取引ID'],
            ['trade_id', '取引ID'],
            ['region', '港湾地域'],
            ['declared_value', '申告額']
        ]
    },
    {
        name: 'Usb_inspection_Records',
        label: 'USB容量検査記録',
        columns: [
            ['usb_id', 'USB検査ID'],
            ['trade_id', '取引ID'],
            ['product_name', '商品名'],
            ['advertised_capacity', '表示容量'],
            ['actual_capacity', '実測容量']
        ]
    }
];

function formatHintText(hint) {
    if (typeof hint === 'string') return hint;
    if (!hint) return '';
    const prefix = hint.level && hint.type
        ? `【ヒント${hint.level}：${hint.type}】`
        : hint.level
            ? `【ヒント${hint.level}】`
            : '';
    return `${prefix}${hint.text || ''}`;
}

async function initGame() {
    try {
        document.getElementById('display-codename').textContent = codename;
        const actualTotal = missions.filter(m => !m.isBriefing && !m.isPractice).length;
        const actualCleared = clearedMissions.filter(idx => missions[idx] && !missions[idx].isBriefing && !missions[idx].isPractice).length;

        document.getElementById('stat-cleared').textContent = actualCleared;
        document.getElementById('stat-total').textContent = actualTotal;

        if (isNaN(currentMissionIndex) || currentMissionIndex < 0 || currentMissionIndex >= missions.length) {
            currentMissionIndex = 0;
        }

        await initBrowserDatabase();

        renderSidebar();
        selectMission(currentMissionIndex);
    } catch (e) {
        console.error("初期化エラー:", e);
        if (confirm("ゲームデータの読み込みでエラーが発生しました。進捗をリセットして初期化しますか？")) {
            const keys = ['sql_game_codename', 'sql_game_cleared', 'sql_game_last_mission'];
            keys.forEach(k => localStorage.removeItem(k));
            location.reload();
        }
    }
}

function renderSidebar() {
    const tabs = document.getElementById('chapter-tabs');
    const list = document.getElementById('mission-list');
    const title = document.getElementById('current-chapter-title');

    if (!tabs || !list) return;

    if (!currentChapter || !chapterOrder.includes(currentChapter)) {
        currentChapter = missions[currentMissionIndex]?.group || chapterOrder[0];
    }

    tabs.innerHTML = '';
    chapterOrder.forEach(chapter => {
        const count = missions.filter(m => {
            if (m.group !== chapter) return false;
            if (m.isPractice || m.isAdvance || m.isBriefing) return false;
            if (typeof m.id === 'number' && !Number.isInteger(m.id)) return false; // 18.5 などのアドバンス/プロローグ系
            if (String(m.group).includes('アドバンス') || String(m.title).includes('アドバンス')) return false;
            return true;
        }).length;

        const btn = document.createElement('button');
        btn.className = 'chapter-tab' + (currentChapter === chapter ? ' active' : '');
        btn.innerHTML = count > 0
            ? `<span>${chapter}</span><span>${count}問</span>`
            : `<span>${chapter}</span>`;
        btn.onclick = () => {
            currentChapter = chapter;
            const firstIdx = missions.findIndex(m => m.group === chapter);
            if (firstIdx !== -1) selectMission(firstIdx);
        };
        tabs.appendChild(btn);
    });

    title.textContent = currentChapter;
    list.innerHTML = '';
    missions.forEach((m, idx) => {
        if (m.group !== currentChapter) return;
        const li = document.createElement('li');
        li.className = 'mission-item' + (idx === currentMissionIndex ? ' active' : '') + (clearedMissions.includes(idx) ? ' cleared' : '');
        li.textContent = m.title;
        li.onclick = () => selectMission(idx);
        list.appendChild(li);
    });
}

function loadBriefingTable(tableName, btnElement) {
    briefingTabsViewed.add(tableName);

    document.querySelectorAll('.tab-btn')
        .forEach(btn => btn.classList.remove('active'));

    if (btnElement) btnElement.classList.add('active');

    const resultTable = document.getElementById('result-table');
    const rowCountLabel = document.getElementById('row-count');

    resultTable.innerHTML = '<tr><td>データを読み込み中...</td></tr>';

    if (!db) {
        resultTable.innerHTML =
            '<tr><td style="color: red;">データベース未初期化</td></tr>';
        return;
    }

    try {
        const results = db.exec(`SELECT * FROM ${tableName}`);

        if (
            results.length === 0 ||
            !results[0].values ||
            results[0].values.length === 0
        ) {
            resultTable.innerHTML = '<tr><td>データがありません。</td></tr>';
            rowCountLabel.textContent = '0 件ヒット';
            return;
        }

        const columns = results[0].columns;
        const values = results[0].values;

        rowCountLabel.textContent = `${values.length} 件ヒット`;

        let html = '<thead><tr>';
        columns.forEach(col => {
            html += `<th>${escapeHTML(col)}</th>`;
        });
        html += '</tr></thead><tbody>';

        values.forEach(row => {
            html += '<tr>';
            row.forEach(val => {
                let displayVal = val;
                if (typeof val === 'number') {
                    displayVal = val.toLocaleString();
                }
                html += `<td>${escapeHTML(displayVal !== null ? displayVal : 'NULL')}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody>';
        resultTable.innerHTML = html;

        updateBriefingStatus();

    } catch (err) {
        resultTable.innerHTML =
            `<tr><td style="color: red;">エラー: ${escapeHTML(err.message)}</td></tr>`;
    }
}

function updateBriefingStatus() {
    const requiredTables = ['Company_Information_Records', 'Import_Records'];
    const allViewed = requiredTables.every(t => briefingTabsViewed.has(t));
    const statusGuide = document.getElementById('status-guide');

    if (statusGuide) {
        if (allViewed) {
            statusGuide.textContent = '✅ 主要な捜査資料を確認完了！「資料の確認を完了する」を押してください';
        } else {
            statusGuide.textContent = '📖 各種捜査資料（会社・輸入・税関など）のタブを確認しましょう';
        }
    }
}

function openDatabaseLibrary(selectedTableName = '', isNewTablePopup = false) {
    const modal = document.getElementById('database-library-modal');
    const content = document.getElementById('database-library-content');
    const newDataNotice = document.getElementById('database-library-new-data');
    const kicker = document.getElementById('database-library-kicker');
    const title = document.getElementById('database-library-title');

    if (!modal || !content) return;

    const tables = selectedTableName
        ? databaseLibraryTables.filter(table => table.name === selectedTableName)
        : databaseLibraryTables;

    kicker.textContent = isNewTablePopup ? '新規テーブル' : '捜査資料室';
    title.textContent = isNewTablePopup ? 'Usb_inspection_Records' : 'データベース資料';
    newDataNotice.style.display = isNewTablePopup ? 'block' : 'none';

    content.innerHTML = tables.map(table => `
        <section class="database-table-section">
            <div class="database-table-heading">
                <strong>${escapeHTML(table.name)}</strong>
                <span>${escapeHTML(table.label)}</span>
            </div>
            <table class="database-column-table">
                <thead>
                    <tr>
                        <th>カラム名</th>
                        <th>意味</th>
                    </tr>
                </thead>
                <tbody>
                    ${table.columns.map(([columnName, meaning]) => `
                        <tr>
                            <td>${escapeHTML(columnName)}</td>
                            <td>${escapeHTML(meaning)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </section>
    `).join('');

    if (isNewTablePopup) {
        content.insertAdjacentHTML('beforeend', `
            <div class="database-modal-point">
                <strong>今回の捜査ポイント</strong><br>
                表示容量と実測容量を比較して、容量詐称がないか確認します。
            </div>
        `);
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeDatabaseLibrary() {
    const modal = document.getElementById('database-library-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function openJoinDiagram(fileName = 'JOIN.png') {
    if (typeof fileName !== 'string') fileName = 'JOIN.png';
    const modal = document.getElementById('join-diagram-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const tabs = modal.querySelectorAll('.join-diagram-tab');
    const button = Array.from(tabs).find(tab => tab.dataset.diagram === fileName);
    showJoinDiagram(fileName, button);
}

function closeJoinDiagram() {
    const modal = document.getElementById('join-diagram-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function showJoinDiagram(fileName, button) {
    const image = document.getElementById('join-diagram-image');
    if (!image) return;

    image.src = fileName;
    image.alt = `${fileName.replace('.png', '')}の図解`;

    const isComparison = fileName === '比較.png';
    document.querySelector('.join-diagram-panel .database-modal-kicker').textContent =
        isComparison ? '比較条件の図解' : '第5章：テーブル結合の図解';
    document.getElementById('join-diagram-title').textContent =
        isComparison ? '比較図解' : 'JOIN図解';
    document.querySelector('.join-diagram-note').textContent =
        isComparison
            ? '※両方の表に一致する取引だけを残す INNER JOIN と、基準側のデータを残す LEFT JOIN の違いを比較します。'
            : '※下の図は仕組みを理解しやすくするためのミニ例です。実際の捜査データでは、取引IDや検査記録の内容が異なります。';

    document.querySelectorAll('.join-diagram-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (button) button.classList.add('active');
}

function selectMission(idx) {
    currentMissionIndex = idx;
    const m = missions[idx];
    if (!m) return;

    briefingTabsViewed.clear();

    currentChapter = m.group;
    localStorage.setItem('sql_game_last_mission', idx);

    document.getElementById('mission-title').textContent = m.title;
    document.getElementById('mission-desc').textContent = m.desc;
    document.getElementById('dialogue-text').textContent = m.dialogue;
    const missionExplanation = document.getElementById('mission-explanation');
    missionExplanation.textContent = m.explanation;
    document.getElementById('mission-expectedSql').textContent = m.expectedSql;
    document.getElementById('glossary-content').innerHTML = m.glossary ? m.glossary.html : "• <span class='badge'>Company_Information_Records</span> / <span class='badge'>Import_Records</span>";

    const hintArea = document.getElementById('hint-area');
    const hintBtn = document.getElementById('next-hint-btn');
    hintArea.innerHTML = '';

    if (m.hints && m.hints.length > 0) {
        const div = document.createElement('div');
        div.className = 'hint-item';
        div.textContent = formatHintText(m.hints[0]);
        hintArea.appendChild(div);
        currentHintIndex = 1;

        if (hintBtn) {
            if (m.hints.length > 1) {
                hintBtn.style.display = 'inline-block';
                hintBtn.textContent = '💡 次のヒントを見る';
            } else {
                hintBtn.style.display = 'none';
            }
        }
    } else {
        if (hintBtn) hintBtn.style.display = 'none';
    }

    if (m.group && m.group.includes('第5章')) {
        missionExplanation.innerHTML =
            `<span style="white-space: pre-line;">${escapeHTML(m.explanation)}</span>` +
            `<div style="margin-top: 12px;"><button type="button" class="join-inline-btn" onclick="openJoinDiagram()">🔗 JOIN図解を見る</button></div>`;

        const joinHintButton = document.createElement('button');
        joinHintButton.type = 'button';
        joinHintButton.className = 'join-inline-btn';
        joinHintButton.style.marginTop = '10px';
        joinHintButton.textContent = '🔗 JOIN図解を見る';
        joinHintButton.onclick = openJoinDiagram;
        hintArea.appendChild(joinHintButton);
    }

    if (m.isPractice && m.title.includes('trade_id')) {
        missionExplanation.innerHTML =
            `<span style="white-space: pre-line;">${escapeHTML(m.explanation)}</span>` +
            `<div style="margin-top: 12px;"><button type="button" class="join-inline-btn" onclick="openJoinDiagram()">🔗 JOIN図解を見る</button></div>`;

        const practiceHintButton = document.createElement('button');
        practiceHintButton.type = 'button';
        practiceHintButton.className = 'join-inline-btn';
        practiceHintButton.style.marginTop = '10px';
        practiceHintButton.textContent = '🔗 JOIN図解を見る';
        practiceHintButton.onclick = openJoinDiagram;
        hintArea.appendChild(practiceHintButton);
    }


    document.querySelectorAll('details.info-details').forEach(details => { details.open = false; });

    const sqlInput = document.getElementById('sql-input');
    const runBtn = document.getElementById('run-action-btn');
    const verifyBtn = document.getElementById('verify-action-btn');
    const statusGuide = document.getElementById('status-guide');
    const tabsContainer = document.getElementById('briefing-tabs-container');

    if (m.isBriefing) {
        sqlInput.style.display = 'none';
        runBtn.style.display = 'none';
        verifyBtn.style.display = 'inline-block';
        verifyBtn.textContent = '資料の確認を完了する ✅';
        statusGuide.textContent = '📖 捜査資料（会社・輸入・税関情報など）を確認しましょう';
        sqlInput.value = '';

        if (tabsContainer) {
            let tabsHtml = `
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
                    <button class="tab-btn active" onclick="loadBriefingTable('Company_Information_Records', this)">会社情報 (Company_Information_Records)</button>
                    <button class="tab-btn" onclick="loadBriefingTable('Import_Records', this)">輸入記録 (Import_Records)</button>
                    <button class="tab-btn" onclick="loadBriefingTable('Customs_Inspection_Records', this)">税関検査 (Customs_Inspection_Records)</button>
                    <button class="tab-btn" onclick="loadBriefingTable('Port_Trade_Records', this)">港湾取引 (Port_Trade_Records)</button>
            `;
            tabsHtml += `</div>`;
            tabsContainer.innerHTML = tabsHtml;

            loadBriefingTable('Company_Information_Records', tabsContainer.querySelector('.tab-btn'));
        }
    } else {
        sqlInput.style.display = 'block';
        runBtn.style.display = 'inline-block';
        verifyBtn.textContent = 'この結果で正解を判定する ✅';
        statusGuide.textContent = '✅ ブラウザ内SQLite準備完了';

        if (tabsContainer) tabsContainer.innerHTML = '';

        const savedSql = localStorage.getItem(`sql_game_query_${idx}`) || '';
        const savedTable = localStorage.getItem(`sql_game_table_${idx}`) || '';
        const savedCount = localStorage.getItem(`sql_game_count_${idx}`) || '0 件ヒット';

        sqlInput.value = savedSql;
        document.getElementById('result-table').innerHTML = savedTable;
        document.getElementById('row-count').textContent = savedCount;
        verifyBtn.style.display = savedSql ? 'inline-block' : 'none';
    }

    renderSidebar();

    if (m.title.startsWith('13.') && localStorage.getItem('sql_game_usb_library_seen') !== '1') {
        localStorage.setItem('sql_game_usb_library_seen', '1');
        setTimeout(() => openDatabaseLibrary('Usb_inspection_Records', true), 150);
    }
}

function showNextHint() {
    const m = missions[currentMissionIndex];
    if (!m || !m.hints) return;

    const hintBtn = document.getElementById('next-hint-btn');
    if (currentHintIndex < m.hints.length) {
        const hintArea = document.getElementById('hint-area');
        const div = document.createElement('div');
        div.className = 'hint-item';
        div.textContent = formatHintText(m.hints[currentHintIndex]);
        hintArea.appendChild(div);
        currentHintIndex++;

        if (currentHintIndex >= m.hints.length && hintBtn) {
            hintBtn.style.display = 'none';
        }
    }
}

function normalizeSqlSemicolon(query) {
    return String(query || '').trim().replace(/;+\s*$/, '').trim();
}

function executeUserQuery(query) {
    if (!db) {
        return { success: false, error: 'データベースが初期化されていません。' };
    }

    const normalizedQuery = normalizeSqlSemicolon(query);

    if (!/^SELECT\b/i.test(normalizedQuery)) {
        return {
            success: false,
            error: 'このゲームでは SELECT 文のみ実行できます。'
        };
    }

    try {
        const results = db.exec(normalizedQuery);
        if (results.length === 0) {
            return {
                success: true,
                rows: [],
                columns: [],
                values: [],
                count: '0 件ヒット'
            };
        }

        const columns = results[0].columns;
        const values = results[0].values;

        const rows = values.map(row => {
            let obj = {};
            columns.forEach((col, idx) => {
                obj[col] = row[idx];
            });
            return obj;
        });

        return {
            success: true,
            rows,
            columns,
            values,
            count: `${rows.length} 件ヒット`
        };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

function runQuery() {
    const sql = document.getElementById('sql-input').value.trim();
    if (!sql) { alert('SQLを入力してください'); return; }

    const data = executeUserQuery(sql);
    const resultTable = document.getElementById('result-table');
    const rowCountLabel = document.getElementById('row-count');
    const verifyBtn = document.getElementById('verify-action-btn');

    if (!data.success) {
        resultTable.innerHTML = `<tr><td style="color: red;">エラー: ${escapeHTML(data.error)}</td></tr>`;
        rowCountLabel.textContent = '0 件ヒット';
        return;
    }

    rowCountLabel.textContent = data.count;
    if (data.rows.length === 0) {
        resultTable.innerHTML = '<tr><td>結果が0件です。条件を見直してください。</td></tr>';
        verifyBtn.style.display = 'inline-block';
        return;
    }

    const keys = data.columns;
    let html = '<thead><tr>';
    keys.forEach(key => { html += `<th>${escapeHTML(key)}</th>`; });
    html += '</tr></thead><tbody>';

    data.values.forEach(row => {
        html += '<tr>';
        row.forEach(val => {
            let displayVal = val;
            if (typeof val === 'number') {
                displayVal = val.toLocaleString();
            }
            html += `<td>${escapeHTML(displayVal !== null ? displayVal : 'NULL')}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    resultTable.innerHTML = html;
    verifyBtn.style.display = 'inline-block';

    localStorage.setItem(`sql_game_query_${currentMissionIndex}`, sql);
    localStorage.setItem(`sql_game_table_${currentMissionIndex}`, resultTable.innerHTML);
    localStorage.setItem(`sql_game_count_${currentMissionIndex}`, rowCountLabel.textContent);
}

function compareMissionResults(userResult, expectedResult, orderSensitive) {
    if (!expectedResult || !userResult.success) return false;

    if (JSON.stringify(userResult.columns) !== JSON.stringify(expectedResult.columns)) {
        return false;
    }

    let userRows = userResult.values;
    let expectedRows = expectedResult.values;

    if (!orderSensitive) {
        const sortRows = rows =>
            rows.map(row => JSON.stringify(row)).sort();
        userRows = sortRows(userRows);
        expectedRows = sortRows(expectedRows);
    }

    return JSON.stringify(userRows) === JSON.stringify(expectedRows);
}

function verifyMission() {
    const m = missions[currentMissionIndex];

    if (m.isBriefing) {
        const requiredTables = ['Company_Information_Records', 'Import_Records'];
        const allViewed = requiredTables.every(t => briefingTabsViewed.has(t));

        if (!allViewed) {
            alert('「会社情報」や「輸入記録」などの捜査資料タブを確認してから完了してください。');
            return;
        }

        completeMission();
        return;
    }

    const sqlInput = normalizeSqlSemicolon(document.getElementById('sql-input').value);
    if (!sqlInput) { alert('先にSQLを実行してください'); return; }

    // ① 必須構文をチェック（m.id があれば優先し、なければ currentMissionIndex を使用）
    const missionNumber = typeof m.id === 'number' ? m.id : currentMissionIndex;
    const featureCheck = checkRequiredFeatures(sqlInput, missionNumber);
    if (!featureCheck.success) {
        alert(
            '🕵️‍♂️ 主任監査官：「新任捜査官、まだ必要なSQL構文が不足しているぞ。」\n\n' +
            '【不足している構文・キーワード】\n' +
            featureCheck.missing.join(', ') + '\n\n' +
            'ヒントを参考にコードを見直してくれ！'
        );
        return;
    }

    // ② ユーザーSQLの実行
    const userResult = executeUserQuery(sqlInput);
    if (!userResult.success) {
        alert('SQLの実行エラーです。\n' + userResult.error);
        return;
    }

    // ③ 模範解答を実行
    let expectedResult;
    try {
        const expectedRaw = db.exec(m.expectedSql);
        expectedResult = expectedRaw[0] || { columns: [], values: [] };
    } catch (e) {
        alert('模範解答の実行エラーが発生しました。');
        console.error(e);
        return;
    }

    // ④ 結果を比較
    const isCorrect = compareMissionResults(
        userResult,
        expectedResult,
        m.orderSensitive === true
    );

    if (!isCorrect) {
        alert(
            '🕵️‍♂️ 主任監査官：「SQLの構文は使えているが、取得したデータや条件が正解と一致しないようだ。\n' +
            '条件やカラム指定をもう一度見直してみよう！」'
        );
        return;
    }

    // ⑤ 正解！
    completeMission();
}

function completeMission() {
    const m = missions[currentMissionIndex];

    if (!m.isPractice && !clearedMissions.includes(currentMissionIndex)) {
        clearedMissions.push(currentMissionIndex);
        localStorage.setItem('sql_game_cleared', JSON.stringify(clearedMissions));

        const actualCleared = clearedMissions.filter(idx => missions[idx] && !missions[idx].isBriefing && !missions[idx].isPractice).length;
        document.getElementById('stat-cleared').textContent = actualCleared;
    }

    if (m.isPractice) {
        alert('練習問題クリア！この練習はクリア数に含めません。次の問題へ進みます。');
    } else if (m.isBriefing) {
        alert('資料の確認が完了しました！最初のミッションへ進みます。');
    } else {
        const m = missions[currentMissionIndex];
        if (m && m.clearFeedback) {
            const learnedText = Array.isArray(m.clearFeedback.learned)
                ? '\n\n【今回覚えたこと】\n・' + m.clearFeedback.learned.join('\n・')
                : '';
            alert(`${m.clearFeedback.dialogue || '正解です！'}${learnedText}`);
        } else {
            alert('正解です！次のミッションへ進みます。');
        }
    }

    if (currentMissionIndex + 1 < missions.length) {
        selectMission(currentMissionIndex + 1);
    } else {
        alert('おめでとうございます！すべてのミッションをクリアしました！');
    }
}

function saveCurrentInput() {
    const sql = document.getElementById('sql-input').value;
    localStorage.setItem(`sql_game_query_${currentMissionIndex}`, sql);
}

function changeCodename() {
    const newName = prompt('新しいコードネームを入力してください:', codename);
    if (newName && newName.trim()) {
        codename = newName.trim();
        localStorage.setItem('sql_game_codename', codename);
        document.getElementById('display-codename').textContent = codename;
    }
}

function resetAllProgress() {
    if (confirm('本当に進捗をすべてリセットしますか？')) {
        const keysToDelete = ['sql_game_codename', 'sql_game_cleared', 'sql_game_last_mission', 'sql_game_usb_library_seen'];
        keysToDelete.forEach(k => localStorage.removeItem(k));
        for (let i = 0; i < missions.length; i++) {
            localStorage.removeItem(`sql_game_query_${i}`);
            localStorage.removeItem(`sql_game_table_${i}`);
            localStorage.removeItem(`sql_game_count_${i}`);
        }
        location.reload();
    }
}

function toggleMemo(id) {
    const panel = document.getElementById(id);
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const requiredSqlPatterns = {
    SELECT: /\bSELECT\b/i,
    FROM: /\bFROM\b/i,
    WHERE: /\bWHERE\b/i,
    EQUALS: /=/,
    NOT_EQUAL: /!=|<>/,
    LESS_THAN: /<(?![=>])/,
    GREATER_EQUAL: />=/,
    AND: /\bAND\b/i,
    ORDER_BY: /\bORDER\s+BY\b/i,
    ASC: /\bASC\b/i,
    DESC: /\bDESC\b/i,
    LIMIT: /\bLIMIT\b/i,
    SUBTRACTION: /declared_quantity\s*-\s*inspected_quantity/i,
    AS: /\bAS\b/i,
    DISTINCT: /\bDISTINCT\b/i,
    COUNT: /\bCOUNT\s*\(/i,
    GROUP_BY: /\bGROUP\s+BY\b/i,
    SUM: /\bSUM\s*\(/i,
    HAVING: /\bHAVING\b/i,
    ROUND: /\bROUND\s*\(/i,
    MULTIPLY: /\*/,
    DIVIDE: /\//,
    CASE: /\bCASE\b/i,
    WHEN: /\bWHEN\b/i,
    THEN: /\bTHEN\b/i,
    ELSE: /\bELSE\b/i,
    END: /\bEND\b/i,
    BETWEEN: /\bBETWEEN\b/i,
    LIKE: /\bLIKE\b/i,
    INNER_JOIN: /\bINNER\s+JOIN\b/i,
    LEFT_JOIN: /\bLEFT\s+JOIN\b/i,
    ON: /\bON\b/i,
    IS_NULL: /\bIS\s+NULL\b/i
};

const missionFeatures = {
    1: ["SELECT", "FROM"],
    2: ["WHERE", "EQUALS"],
    3: ["WHERE", "ORDER_BY"],
    4: ["WHERE", "AND", "ORDER_BY", "DESC", "LIMIT"],
    5: ["WHERE", "NOT_EQUAL"],
    6: ["WHERE", "LESS_THAN"],
    7: ["SUBTRACTION", "AS"],
    8: ["WHERE", "AND", "GREATER_EQUAL"],
    9: ["DISTINCT"],
    10: ["COUNT", "GROUP_BY"],
    11: ["SUM", "GROUP_BY"],
    12: ["COUNT", "GROUP_BY", "HAVING", "DESC"],
    13: ["LIKE"],
    14: ["BETWEEN"],
    15: ["ROUND", "MULTIPLY", "DIVIDE"],
    16: ["WHERE", "AND", "OR"],
    16.5: ["CASE", "WHEN", "THEN", "ELSE", "END", "AS"],
    17: ["CASE", "WHEN", "THEN", "ELSE", "END", "AS"],
    18: ["CASE", "WHEN", "THEN", "ELSE", "END", "WHERE"],    
    18.5: ["INNER_JOIN", "ON"],
    19: ["INNER_JOIN", "ON"],
    20: ["INNER_JOIN", "ON", "CASE", "WHEN", "THEN", "ELSE", "END"],
    21: ["INNER_JOIN", "ON", "CASE", "WHEN", "THEN", "ELSE", "END"],
    22: ["LEFT_JOIN", "ON"],
    23: ["LEFT_JOIN", "ON", "IS_NULL"],
    24: ["INNER_JOIN", "LEFT_JOIN", "ON", "IS_NULL"],
    };

function checkRequiredFeatures(sql, missionNumber) {
    const required = missionFeatures[missionNumber] || [];
    const missing = required.filter(feature => {
        return !requiredSqlPatterns[feature]?.test(sql);
    });
    return {
        success: missing.length === 0,
        missing
    };
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeDatabaseLibrary();
        closeJoinDiagram();
    }
});

window.onload = initGame;
