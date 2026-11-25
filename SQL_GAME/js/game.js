let codename = localStorage.getItem('sql_game_codename') || 'GUEST';
let clearedMissions = JSON.parse(localStorage.getItem('sql_game_cleared') || '[]');
let currentMissionIndex = parseInt(localStorage.getItem('sql_game_last_mission') || '0', 10);
let currentChapter = '';
let currentHintIndex = 0;

const chapterOrder = [...new Set(missions.map(mission => mission.group))];

const requiredSqlPatterns = {
    SELECT: /\bSELECT\b/i, FROM: /\bFROM\b/i, WHERE: /\bWHERE\b/i,
    EQUALS: /=/, NOT_EQUAL: /!=|<>/, LESS_THAN: /<(?![=>])/, GREATER_THAN: />(?!=)/, GREATER_EQUAL: />=/,
    AND: /\bAND\b/i, OR: /\bOR\b/i, ORDER_BY: /\bORDER\s+BY\b/i,
    PARENS: /\([^)]*\)/,
    ASC: /\bASC\b/i, DESC: /\bDESC\b/i, LIMIT: /\bLIMIT\b/i,
    SUBTRACTION: /quantity\s*-\s*received_quantity/i,
    AS: /\bAS\b/i, DISTINCT: /\bDISTINCT\b/i, COUNT: /\bCOUNT\s*\(/i,
    GROUP_BY: /\bGROUP\s+BY\b/i, SUM: /\bSUM\s*\(/i, AVG: /\bAVG\s*\(/i,
    MAX: /\bMAX\s*\(/i, MIN: /\bMIN\s*\(/i,
    HAVING: /\bHAVING\b/i, ROUND: /\bROUND\s*\(/i, MULTIPLY: /\*/,
    DIVIDE: /\//, CASE: /\bCASE\b/i, WHEN: /\bWHEN\b/i, THEN: /\bTHEN\b/i,
    ELSE: /\bELSE\b/i, END: /\bEND\b/i, BETWEEN: /\bBETWEEN\b/i,
    LIKE: /\bLIKE\b/i, INNER_JOIN: /\b(?:INNER\s+)?JOIN\b/i, LEFT_JOIN: /\bLEFT\s+JOIN\b/i,
    ON: /\bON\b/i, IS_NULL: /\bIS\s+NULL\b/i, SUBQUERY: /\(\s*SELECT\b/i,
    MULTIPLE_JOINS: /\bJOIN\b[\s\S]*\bJOIN\b/i
};

const missionFeatures = {
    1: ["SELECT", "FROM"], 2: ["WHERE", "EQUALS"], 3: ["WHERE", "ORDER_BY"],
    4: ["WHERE", "EQUALS", "ORDER_BY", "DESC", "LIMIT"],
    5: ["WHERE", "EQUALS", "AND", "NOT_EQUAL"],
    6: ["WHERE", "EQUALS", "AND", "LESS_THAN"],
    7: ["WHERE", "EQUALS", "SUBTRACTION", "AS", "ORDER_BY", "DESC"],
    8: ["WHERE", "EQUALS", "AND", "LESS_THAN", "GREATER_EQUAL", "SUBTRACTION", "PARENS"],
    9: ["COUNT", "GROUP_BY"], 10: ["DISTINCT", "WHERE"],
    11: ["WHERE", "MAX", "MIN", "GROUP_BY"],
    12: ["WHERE", "DIVIDE", "AVG", "ROUND", "GROUP_BY"],
    13: ["WHERE", "SUM", "GROUP_BY"],
    14: ["INNER_JOIN", "ON", "WHERE", "EQUALS"],
    15: ["INNER_JOIN", "ON", "WHERE", "EQUALS"],
    16: ["LEFT_JOIN", "ON", "WHERE", "EQUALS", "AND", "IS_NULL"],
    17: ["INNER_JOIN", "MULTIPLE_JOINS", "ON", "WHERE", "EQUALS", "AND", "IS_NULL"],
    18: ["CASE", "WHEN", "THEN", "ELSE", "END", "AS", "LESS_THAN"],
    19: ["WHERE", "EQUALS", "CASE", "WHEN", "THEN", "ELSE", "END", "AS", "LESS_THAN"],
    20: ["WHERE", "EQUALS", "LESS_THAN", "GREATER_THAN", "AND", "OR", "PARENS"],
    21: ["WHERE", "EQUALS", "LESS_THAN", "GREATER_THAN", "AND", "PARENS"],
    22: ["WHERE", "EQUALS", "LESS_THAN", "AND", "PARENS"],
    23: ["SUBQUERY", "WHERE", "EQUALS", "LESS_THAN", "GREATER_THAN", "AND", "OR", "PARENS"],
    24: ["INNER_JOIN", "MULTIPLE_JOINS", "ON", "WHERE", "EQUALS", "LESS_THAN", "GREATER_THAN", "AND", "OR", "PARENS"]
};

async function initGame() {
    document.getElementById('display-codename').textContent = codename;
    await initBrowserDatabase();
    updateClearCount();
    renderSidebar();
    selectMission(currentMissionIndex);
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeHTMLWithLinks(value) {
    return String(value).split(/(https:\/\/[^\s]+)/g).map(part => {
        if (!part.startsWith('https://')) return escapeHTML(part);
        const safeUrl = escapeHTML(part);
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
    }).join('');
}

function updateClearCount() {
    const count = [...new Set(clearedMissions.filter(index =>
        missions[index] && !missions[index].isBriefing && !missions[index].isPractice
    ))].length;
    const total = missions.filter(mission => !mission.isBriefing && !mission.isPractice).length;
    document.getElementById('stat-cleared').textContent = count;
    document.getElementById('stat-total').textContent = total;
}

function renderSidebar() {
    const tabs = document.getElementById('chapter-tabs');
    const list = document.getElementById('mission-list');
    if (!tabs || !list) return;

    if (!chapterOrder.includes(currentChapter)) currentChapter = missions[currentMissionIndex]?.group || chapterOrder[0];
    tabs.innerHTML = '';
    chapterOrder.forEach(chapter => {
        const count = missions.filter(mission =>
            mission.group === chapter && !mission.isPractice && !mission.isBriefing
        ).length;
        const button = document.createElement('button');
        button.className = 'chapter-tab' + (chapter === currentChapter ? ' active' : '');
        button.innerHTML = `<span>${escapeHTML(chapter)}</span><span>${count}問</span>`;
        button.onclick = () => {
            currentChapter = chapter;
            const firstIndex = missions.findIndex(mission => mission.group === chapter);
            if (firstIndex >= 0) selectMission(firstIndex);
        };
        tabs.appendChild(button);
    });

    document.getElementById('current-chapter-title').textContent = currentChapter;
    list.innerHTML = '';
    missions.forEach((mission, index) => {
        if (mission.group !== currentChapter) return;
        const item = document.createElement('li');
        item.className = 'mission-item'
            + (index === currentMissionIndex ? ' active' : '')
            + (clearedMissions.includes(index) ? ' cleared' : '');
        item.textContent = mission.title;
        item.onclick = () => selectMission(index);
        list.appendChild(item);
    });
}

function selectMission(index) {
    if (!missions[index]) return;
    document.querySelectorAll('.info-details[open]').forEach(section => {
        section.open = false;
    });
    currentMissionIndex = index;
    currentChapter = missions[index].group;
    currentHintIndex = 0;
    localStorage.setItem('sql_game_last_mission', String(index));

    const mission = missions[index];
    document.getElementById('mission-title').textContent = mission.title;
    document.getElementById('mission-desc').textContent = mission.desc;
    document.getElementById('dialogue-text').textContent = mission.dialogue;
    const prologue = document.getElementById('mission-prologue');
    prologue.querySelector('.mission-prologue-text').textContent = mission.prologue || '';
    prologue.hidden = !mission.prologue;

    const explanation = document.getElementById('mission-explanation');
    explanation.innerHTML = `<span style="white-space: pre-line;">${escapeHTMLWithLinks(mission.explanation)}</span>`;
    document.getElementById('mission-expectedSql').textContent = mission.expectedSql || '';
    document.getElementById('glossary-content').innerHTML = mission.glossary?.html || '';

    const hintArea = document.getElementById('hint-area');
    const hintButton = document.getElementById('next-hint-btn');
    hintArea.innerHTML = '';
    const hasJoinDiagram = mission.prologue || (missionFeatures[mission.id] || []).some(feature =>
        feature === 'INNER_JOIN' || feature === 'LEFT_JOIN'
    );
    if (mission.hints?.length) {
        hintArea.innerHTML = `<div class="hint-item">${escapeHTMLWithLinks(formatHint(mission.hints[0]))}</div>`;
        if (mission.hints.length > 1) {
            hintButton.style.display = 'inline-block';
            hintButton.textContent = '次のヒントを見る';
        } else hintButton.style.display = 'none';
    } else hintButton.style.display = 'none';
    if (hasJoinDiagram) {
        appendJoinDiagramGuide(hintArea);
        appendJoinDiagramGuide(explanation);
    }

    const sqlInput = document.getElementById('sql-input');
    const runButton = document.getElementById('run-action-btn');
    const verifyButton = document.getElementById('verify-action-btn');
    const tabs = document.getElementById('briefing-tabs-container');

    if (mission.isBriefing) {
        sqlInput.style.display = 'none';
        runButton.style.display = 'none';
        verifyButton.style.display = 'inline-block';
        verifyButton.textContent = '資料の確認を完了する';
        tabs.innerHTML = `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
                ${briefingTab('Companies', '会社情報')}
                ${briefingTab('Imports', '輸入・受入数量記録')}
                ${briefingTab('Containers', 'コンテナ保管')}
            </div>`;
        loadBriefingTable('Companies');
    } else {
        sqlInput.style.display = 'block';
        runButton.style.display = 'inline-block';
        verifyButton.style.display = 'inline-block';
        verifyButton.textContent = 'この結果で正解を判定する';
        tabs.innerHTML = '';
        sqlInput.value = localStorage.getItem(`sql_game_query_${index}`) || '';
        document.getElementById('result-table').innerHTML = localStorage.getItem(`sql_game_table_${index}`) || '';
        document.getElementById('row-count').textContent = localStorage.getItem(`sql_game_count_${index}`) || '0 件ヒット';
    }
    renderSidebar();
}

function briefingTab(tableName, label) {
    return `<button class="tab-btn" onclick="loadBriefingTable('${tableName}')">${escapeHTML(label)} (${tableName})</button>`;
}

function openDatabaseLibrary() {
    const modal = document.getElementById('database-library-modal');
    const notice = document.getElementById('database-library-new-data');
    const content = document.getElementById('database-library-content');
    if (!modal || !notice || !content) return;

    if (!db) {
        notice.textContent = 'ブラウザ内データベースを読み込めませんでした。ページを再読み込みしてください。';
        notice.style.display = 'block';
        content.textContent = '';
        modal.style.display = 'flex';
        return;
    }

    notice.style.display = 'none';
    const tables = [
        { name: 'Companies', label: '会社マスター' },
        { name: 'Imports', label: '輸入・受入数量・USB容量記録' },
        { name: 'Containers', label: 'コンテナ保管記録' }
    ];

    try {
        content.innerHTML = tables.map(({ name, label }) => {
            const schema = db.exec(`PRAGMA table_info('${name}')`)[0];
            if (!schema) throw new Error(`${name} テーブルが見つかりません。`);
            const foreignKeys = db.exec(`PRAGMA foreign_key_list('${name}')`)[0]?.values || [];
            const rowCount = db.exec(`SELECT COUNT(*) FROM "${name}"`)[0].values[0][0];
            const columnRows = schema.values.map(([, columnName, type, notNull, , primaryKey]) => {
                const constraints = [];
                if (primaryKey) constraints.push('PRIMARY KEY');
                if (notNull) constraints.push('NOT NULL');
                foreignKeys
                    .filter(([, , , sourceColumn]) => sourceColumn === columnName)
                    .forEach(([, , targetTable, , targetColumn]) => {
                        constraints.push(`外部キー → ${targetTable}.${targetColumn}`);
                    });
                return `<tr><td>${escapeHTML(columnName)}</td><td>${escapeHTML(type || '—')}</td><td>${escapeHTML(constraints.join(' / ') || '—')}</td></tr>`;
            }).join('');

            return `
                <section class="database-table-section">
                    <div class="database-table-heading">
                        <strong>${escapeHTML(name)}</strong>
                        <span>${escapeHTML(label)}・${rowCount.toLocaleString()}件</span>
                    </div>
                    <table class="database-column-table">
                        <thead><tr><th>カラム</th><th>データ型</th><th>制約・関連</th></tr></thead>
                        <tbody>${columnRows}</tbody>
                    </table>
                </section>`;
        }).join('') + `
            <div class="database-modal-point">
                主な関連：Imports.company_id → Companies.company_id ／ Containers.trade_id → Imports.trade_id
            </div>`;
    } catch (error) {
        notice.textContent = `データベース資料の読み込みに失敗しました：${error instanceof Error ? error.message : String(error)}`;
        notice.style.display = 'block';
        content.textContent = '';
    }

    modal.style.display = 'flex';
}

function closeDatabaseLibrary() {
    const modal = document.getElementById('database-library-modal');
    if (modal) modal.style.display = 'none';
}

function formatHint(hint) {
    if (typeof hint === 'string') return hint;
    if (!hint) return '';
    const prefix = hint.level ? `ヒント${hint.level}${hint.type ? '：' + hint.type : ''} ` : '';
    return prefix + (hint.text || '');
}

function appendJoinDiagramGuide(container) {
    const guide = document.createElement('div');
    guide.className = 'join-diagram-guide';
    guide.textContent = '図解で確認：INNER JOIN は両方の表で一致した行、LEFT JOIN は左側の表の全行を残します。一致しない右側の情報は NULL になります。';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'join-inline-btn';
    button.textContent = 'JOINの図解を見る';
    button.addEventListener('click', openJoinDiagram);
    guide.appendChild(button);
    container.appendChild(guide);
}

function openJoinDiagram() {
    const modal = document.getElementById('join-diagram-modal');
    if (modal) modal.style.display = 'flex';
}

function closeJoinDiagram() {
    const modal = document.getElementById('join-diagram-modal');
    if (modal) modal.style.display = 'none';
}

function showJoinDiagram(fileName, button) {
    const allowedDiagrams = ['JOIN.png', 'INNER JOIN.png', 'LEFT JOIN.png', '比較.png'];
    if (!allowedDiagrams.includes(fileName)) {
        throw new Error(`未対応のJOIN図解です: ${fileName}`);
    }
    const image = document.getElementById('join-diagram-image');
    image.src = fileName;
    image.alt = `${fileName.replace('.png', '')}の図解`;
    document.querySelectorAll('.join-diagram-tab').forEach(tab => tab.classList.remove('active'));
    if (button) button.classList.add('active');
}

function showNextHint() {
    const mission = missions[currentMissionIndex];
    if (!mission?.hints || currentHintIndex >= mission.hints.length - 1) return;
    currentHintIndex++;
    const hintArea = document.getElementById('hint-area');
    hintArea.insertAdjacentHTML('beforeend', `<div class="hint-item">${escapeHTMLWithLinks(formatHint(mission.hints[currentHintIndex]))}</div>`);
    if (currentHintIndex >= mission.hints.length - 1) document.getElementById('next-hint-btn').style.display = 'none';
}

function loadBriefingTable(tableName) {
    if (!db) return;
    const resultTable = document.getElementById('result-table');
    const rowCount = document.getElementById('row-count');
    try {
        const result = db.exec(`SELECT * FROM ${tableName}`)[0];
        if (!result) {
            resultTable.innerHTML = '';
            rowCount.textContent = '0 件ヒット';
            return;
        }
        rowCount.textContent = `${result.values.length} 件ヒット`;
        let html = '<thead><tr>' + result.columns.map(column => `<th>${escapeHTML(column)}</th>`).join('') + '</tr></thead><tbody>';
        html += result.values.map(row => '<tr>' + row.map(value =>
            `<td>${escapeHTML(value === null ? 'NULL' : typeof value === 'number' ? value.toLocaleString() : value)}</td>`
        ).join('') + '</tr>').join('');
        resultTable.innerHTML = html + '</tbody>';
    } catch (error) {
        resultTable.innerHTML = `<tr><td style="color:red">${escapeHTML(error.message)}</td></tr>`;
        rowCount.textContent = '0 件ヒット';
    }
}

function normalizeSql(query) {
    return String(query || '').trim().replace(/;+$/, '').trim();
}

function executeUserQuery(query) {
    const normalized = normalizeSql(query);
    if (!/^SELECT\b/i.test(normalized)) return { success: false, error: 'SELECT文を入力してください。' };
    try {
        const result = db.exec(normalized);
        if (!result.length) return { success: true, columns: [], values: [] };
        return { success: true, columns: result[0].columns, values: result[0].values };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function runQuery() {
    const sql = document.getElementById('sql-input').value.trim();
    if (!sql) {
        alert('SQLを入力してください');
        return;
    }
    const result = executeUserQuery(sql);
    const table = document.getElementById('result-table');
    if (!result.success) {
        table.innerHTML = `<tr><td style="color:red">${escapeHTML(result.error)}</td></tr>`;
        document.getElementById('row-count').textContent = '0 件ヒット';
        return;
    }
    document.getElementById('row-count').textContent = `${result.values.length} 件ヒット`;
    table.innerHTML = result.columns.length
        ? '<thead><tr>' + result.columns.map(column => `<th>${escapeHTML(column)}</th>`).join('') + '</tr></thead><tbody>'
          + result.values.map(row => '<tr>' + row.map(value =>
              `<td>${escapeHTML(value === null ? 'NULL' : typeof value === 'number' ? value.toLocaleString() : value)}</td>`
          ).join('') + '</tr>').join('') + '</tbody>'
        : '';
    localStorage.setItem(`sql_game_query_${currentMissionIndex}`, sql);
    localStorage.setItem(`sql_game_table_${currentMissionIndex}`, table.innerHTML);
    localStorage.setItem(`sql_game_count_${currentMissionIndex}`, document.getElementById('row-count').textContent);
}

function compareResults(user, expected, orderSensitive) {
    if (JSON.stringify(user.columns) !== JSON.stringify(expected.columns)) return false;
    let userRows = user.values;
    let expectedRows = expected.values;
    if (!orderSensitive) {
        userRows = userRows.map(row => JSON.stringify(row)).sort();
        expectedRows = expectedRows.map(row => JSON.stringify(row)).sort();
    }
    return JSON.stringify(userRows) === JSON.stringify(expectedRows);
}

function checkRequiredFeatures(sql, missionNumber) {
    const required = missionFeatures[missionNumber] || [];
    const missing = required.filter(feature => !requiredSqlPatterns[feature]?.test(sql));
    return { success: missing.length === 0, missing };
}

function verifyMission() {
    const mission = missions[currentMissionIndex];
    if (mission.isBriefing) {
        completeMission();
        return;
    }

    const sql = normalizeSql(document.getElementById('sql-input').value);
    if (!sql) {
        alert('先にSQLを実行してください');
        return;
    }
    const featureCheck = checkRequiredFeatures(sql, mission.id);
    if (!featureCheck.success) {
        alert(`必要なSQL構文が不足しています：${featureCheck.missing.join(', ')}`);
        return;
    }
    const userResult = executeUserQuery(sql);
    if (!userResult.success) {
        alert(`SQLの実行エラー：${userResult.error}`);
        return;
    }
    let expectedResult;
    try {
        const raw = db.exec(mission.expectedSql);
        expectedResult = raw.length ? { columns: raw[0].columns, values: raw[0].values } : { columns: [], values: [] };
    } catch (error) {
        alert(`模範解答の実行エラー：${error.message}`);
        return;
    }
    if (!compareResults(userResult, expectedResult, mission.orderSensitive)) {
        alert('取得したデータまたは条件が正解と一致しません。');
        return;
    }
    completeMission();
}

function completeMission() {
    const mission = missions[currentMissionIndex];
    if (!mission.isPractice && !mission.isBriefing && !clearedMissions.includes(currentMissionIndex)) {
        clearedMissions.push(currentMissionIndex);
        localStorage.setItem('sql_game_cleared', JSON.stringify(clearedMissions));
        updateClearCount();
        renderSidebar();
    }
    alert(mission.clearFeedback?.dialogue || '正解です！');
    if (currentMissionIndex + 1 < missions.length) selectMission(currentMissionIndex + 1);
}

function saveCurrentInput() {
    localStorage.setItem(`sql_game_query_${currentMissionIndex}`, document.getElementById('sql-input').value);
}

function changeCodename() {
    const value = prompt('コードネームを入力してください', codename);
    if (value?.trim()) {
        codename = value.trim();
        localStorage.setItem('sql_game_codename', codename);
        document.getElementById('display-codename').textContent = codename;
    }
}

function resetAllProgress() {
    if (!confirm('進捗をリセットしますか？')) return;
    ['sql_game_codename', 'sql_game_cleared', 'sql_game_last_mission'].forEach(key => localStorage.removeItem(key));
    missions.forEach((_, index) => {
        localStorage.removeItem(`sql_game_query_${index}`);
        localStorage.removeItem(`sql_game_table_${index}`);
        localStorage.removeItem(`sql_game_count_${index}`);
    });
    location.reload();
}

function toggleMemo(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const button = document.getElementById('memoBtnSql');
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    if (button) {
        button.textContent = isOpen ? '📝 制作メモを見る' : '📝 制作メモを閉じる';
        button.classList.toggle('open', !isOpen);
    }
}

window.onload = initGame;
