let codename = localStorage.getItem('sql_game_codename') || 'GUEST';
let clearedMissions = JSON.parse(localStorage.getItem('sql_game_cleared') || '[]');
let currentMissionIndex = parseInt(localStorage.getItem('sql_game_last_mission') || '0', 10);
let currentChapter = '';
let currentHintIndex = 0;
let centerFeedbackTimer = null;

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
    8: ["WHERE", "EQUALS", "AND", "LESS_THAN", "GREATER_THAN"],
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

function ensureCenterFeedback() {
    let layer = document.getElementById('center-feedback-layer');
    if (layer) return layer;

    layer = document.createElement('div');
    layer.id = 'center-feedback-layer';
    layer.className = 'center-feedback-layer';
    layer.innerHTML = `
        <div class="center-feedback-card" id="center-feedback-card" role="status" aria-live="polite">
            <div class="center-feedback-top">
                <span class="center-feedback-badge" id="center-feedback-badge">FEEDBACK</span>
                <span class="center-feedback-meta" id="center-feedback-meta"></span>
            </div>
            <div class="center-feedback-title" id="center-feedback-title"></div>
            <div class="center-feedback-message" id="center-feedback-message"></div>
            <div class="center-feedback-learned" id="center-feedback-learned" style="display:none;"></div>
            <div class="center-feedback-actions" id="center-feedback-actions"></div>
        </div>
    `;
    layer.addEventListener('click', (event) => {
        if (event.target === layer && !layer.classList.contains('is-modal')) {
            hideCenterFeedback();
        }
    });
    document.body.appendChild(layer);
    return layer;
}

function hideCenterFeedback() {
    if (centerFeedbackTimer) {
        clearTimeout(centerFeedbackTimer);
        centerFeedbackTimer = null;
    }
    const layer = document.getElementById('center-feedback-layer');
    if (!layer) return;
    layer.classList.remove('is-open', 'is-modal');
}

function showCenterFeedback({
    tone = 'info',
    badge = 'FEEDBACK',
    title = '',
    message = '',
    learned = [],
    meta = '',
    duration = 1600,
    modal = false,
    onNext = null
}) {
    const layer = ensureCenterFeedback();
    const card = document.getElementById('center-feedback-card');
    const badgeEl = document.getElementById('center-feedback-badge');
    const titleEl = document.getElementById('center-feedback-title');
    const msgEl = document.getElementById('center-feedback-message');
    const learnedEl = document.getElementById('center-feedback-learned');
    const metaEl = document.getElementById('center-feedback-meta');
    const actionsEl = document.getElementById('center-feedback-actions');

    if (centerFeedbackTimer) {
        clearTimeout(centerFeedbackTimer);
        centerFeedbackTimer = null;
    }

    const wrapper = document.getElementById('result-table')?.closest('.table-wrapper');
    if (wrapper) {
        wrapper.classList.remove('feedback-success', 'feedback-error');
        if (tone === 'success') wrapper.classList.add('feedback-success');
        if (tone === 'error' || tone === 'warn') wrapper.classList.add('feedback-error');
    }

    card.className = `center-feedback-card is-${tone}`;
    badgeEl.textContent = badge;
    titleEl.textContent = title;
    msgEl.textContent = message;
    metaEl.textContent = meta;

    if (learnedEl) {
        if (Array.isArray(learned) && learned.length > 0) {
            learnedEl.style.display = 'flex';
            learnedEl.innerHTML = learned
                .map(item => `<div class="center-feedback-learned-item">${escapeHTML(item)}</div>`)
                .join('');
        } else {
            learnedEl.style.display = 'none';
            learnedEl.innerHTML = '';
        }
    }

    actionsEl.innerHTML = '';
    if (typeof onNext === 'function') {
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'center-feedback-btn primary';
        nextBtn.textContent = '次のミッションへ';
        nextBtn.addEventListener('click', () => {
            hideCenterFeedback();
            onNext();
        });
        actionsEl.appendChild(nextBtn);
    }
    if (modal) {
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'center-feedback-btn';
        closeBtn.textContent = '閉じる';
        closeBtn.addEventListener('click', hideCenterFeedback);
        actionsEl.appendChild(closeBtn);
    }

    layer.classList.toggle('is-modal', Boolean(modal));
    requestAnimationFrame(() => layer.classList.add('is-open'));

    if (!modal && duration > 0) {
        centerFeedbackTimer = setTimeout(() => {
            hideCenterFeedback();
        }, duration);
    }
}

async function initGame() {
    document.getElementById('display-codename').textContent = codename;
    ensureCenterFeedback();
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
    hideCenterFeedback();
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
        verifyButton.textContent = '捜査を開始する';
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

const databaseColumnDescriptions = {
    company_id: '会社ID',
    company_name: '会社名',
    address: '会社住所',
    trade_id: '取引ID',
    model_number: '型番',
    product_name: '商品名',
    category: '商品カテゴリ',
    quantity: '申告数量',
    received_quantity: '受入数量',
    declared_value: '申告額',
    declaration_date: '申告日',
    declared_weight_kg: '申告重量（kg）',
    actual_weight_kg: '実重量（kg）',
    advertised_capacity: '広告容量（GB）',
    actual_capacity: '実容量（GB）',
    container_record_id: 'コンテナ記録ID',
    container_area: '保管エリア',
    container_number: 'コンテナ番号'
};

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
                const description = databaseColumnDescriptions[columnName] || '日本語の説明は未設定です';
                return `<tr><td>${escapeHTML(columnName)}</td><td>${escapeHTML(description)}</td><td>${escapeHTML(type || '—')}</td><td>${escapeHTML(constraints.join(' / ') || '—')}</td></tr>`;
            }).join('');

            return `
                <section class="database-table-section">
                    <div class="database-table-heading">
                        <strong>${escapeHTML(name)}</strong>
                        <span>${escapeHTML(label)}・${rowCount.toLocaleString()}件</span>
                    </div>
                    <table class="database-column-table">
                        <thead><tr><th>カラム名（英語）</th><th>意味（日本語）</th><th>データ型</th><th>制約・関連</th></tr></thead>
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
        resultTable.innerHTML = `<div class="result-error-box">${escapeHTML(error.message)}</div>`;
        rowCount.textContent = '0 件ヒット';
        showCenterFeedback({
            tone: 'error',
            badge: 'ERROR',
            title: '資料の読み込みエラー',
            message: error.message,
            duration: 2600
        });
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
        showCenterFeedback({
            tone: 'warn',
            badge: 'NOTICE',
            title: 'SQLが入力されていません',
            message: 'クエリを書いてから実行してみよう。',
            duration: 1600
        });
        return;
    }

    const inputDiagnostic = getSqlInputDiagnostic(sql);
    if (inputDiagnostic) {
        showCenterFeedback({
            tone: 'warn',
            badge: 'SQL CHECK',
            title: 'SQLの記述を確認してください',
            message: inputDiagnostic,
            duration: 2800
        });
        return;
    }

    const startedAt = performance.now();
    const result = executeUserQuery(sql);
    const elapsedMs = Math.max(1, Math.round(performance.now() - startedAt));
    const table = document.getElementById('result-table');

    if (!result.success) {
        table.innerHTML = `<div class="result-error-box">${escapeHTML(result.error)}</div>`;
        document.getElementById('row-count').textContent = '0 件ヒット';
        showCenterFeedback({
            tone: 'error',
            badge: 'SQL ERROR',
            title: 'クエリの実行に失敗しました',
            message: getSqlExecutionFeedback(result.error),
            meta: `${elapsedMs}ms`,
            duration: 2800
        });
        return;
    }

    document.getElementById('row-count').textContent = `${result.values.length} 件ヒット`;
    table.innerHTML = result.columns.length
        ? '<thead><tr>' + result.columns.map(column => `<th>${escapeHTML(column)}</th>`).join('') + '</tr></thead><tbody>'
          + result.values.map(row => '<tr>' + row.map(value =>
              `<td>${escapeHTML(value === null ? 'NULL' : typeof value === 'number' ? value.toLocaleString() : value)}</td>`
          ).join('') + '</tr>').join('') + '</tbody>'
        : '';

    showCenterFeedback({
        tone: 'info',
        badge: 'EXECUTED',
        title: `${result.values.length} 件ヒット`,
        message: `${result.columns.length} 列のデータを取得しました。`,
        meta: `${elapsedMs}ms`,
        duration: 1300
    });

    localStorage.setItem(`sql_game_query_${currentMissionIndex}`, sql);
    localStorage.setItem(`sql_game_table_${currentMissionIndex}`, table.innerHTML);
    localStorage.setItem(`sql_game_count_${currentMissionIndex}`, document.getElementById('row-count').textContent);
}

function compareResults(user, expected, orderSensitive) {
    if (!user.columns.length && !user.values.length && expected.columns.length) {
        return { matches: false, reason: 'rows', userCount: user.values.length, expectedCount: expected.values.length };
    }
    if (JSON.stringify(user.columns) !== JSON.stringify(expected.columns)) {
        const expectedSet = new Set(expected.columns);
        const userSet = new Set(user.columns);
        const hasExtraColumns = user.columns.some(column => !expectedSet.has(column));
        const hasMissingColumns = expected.columns.some(column => !userSet.has(column));
        let reason = 'columns';
        if (hasExtraColumns && hasMissingColumns) reason = 'columns_extra_missing';
        else if (hasExtraColumns) reason = 'columns_extra';
        else if (hasMissingColumns) reason = 'columns_missing';
        return {
            matches: false,
            reason,
            userColumns: user.columns,
            expectedColumns: expected.columns
        };
    }

    const userRows = user.values;
    const expectedRows = expected.values;
    const userRowKeys = userRows.map(row => JSON.stringify(row));
    const expectedRowKeys = expectedRows.map(row => JSON.stringify(row));
    if (!orderSensitive) {
        const matches = JSON.stringify(userRowKeys.slice().sort()) === JSON.stringify(expectedRowKeys.slice().sort());
        return matches
            ? { matches: true }
            : { matches: false, reason: 'rows', userCount: userRows.length, expectedCount: expectedRows.length };
    }

    if (JSON.stringify(userRows) === JSON.stringify(expectedRows)) {
        return { matches: true };
    }
    if (JSON.stringify(userRowKeys.slice().sort()) === JSON.stringify(expectedRowKeys.slice().sort())) {
        return {
            matches: false,
            reason: 'order',
            userCount: userRows.length,
            expectedCount: expectedRows.length
        };
    }
    return { matches: false, reason: 'rows', userCount: userRows.length, expectedCount: expectedRows.length };
}

function getMismatchMessage(comparison) {
    if (comparison.reason === 'columns_extra') {
        return '抽出する列に余分な列が含まれている可能性があります。\n問題文で指定された列だけをSELECT句に書けているか確認しましょう。';
    }
    if (comparison.reason === 'columns_missing') {
        return '抽出する列が不足しています。\n問題文で指定された列がSELECT句にすべて含まれているか確認しましょう。';
    }
    if (comparison.reason === 'columns_extra_missing') {
        return '抽出する列に余分な列が含まれているか、必要な列が不足しています。\nSELECT句で列の数・名前・並びを確認しましょう。';
    }
    if (comparison.reason === 'columns') {
        return '抽出する列が問題文の要件と合っていません。\nSELECT句で列名と並び、不要な列が含まれていないか確認しましょう。';
    }
    if (comparison.reason === 'order') {
        return 'レコードの表示順序が異なります。\nORDER BYで指定する列と、ASC・DESCの並び方を確認しましょう。';
    }

    return '取得したレコードが一致しません。\nWHERE条件、比較値、AND・ORの組み合わせ、かっこの位置を見直しましょう。条件が問題文の要件と合っているか確認してください。';
}

function checkRequiredFeatures(sql, missionNumber) {
    const required = missionFeatures[missionNumber] || [];
    const missing = required.filter(feature => !requiredSqlPatterns[feature]?.test(sql));
    return { success: missing.length === 0, missing };
}

const requiredFeatureLabels = {
    SELECT: 'SELECT', FROM: 'FROM', WHERE: 'WHERE', EQUALS: '＝（等号）',
    AND: 'AND', OR: 'OR', ORDER_BY: 'ORDER BY', ASC: 'ASC（昇順）', DESC: 'DESC（降順）',
    LIMIT: 'LIMIT', PARENS: 'かっこ', INNER_JOIN: 'INNER JOIN', LEFT_JOIN: 'LEFT JOIN',
    ON: 'ON', IS_NULL: 'IS NULL', SUBQUERY: 'サブクエリ', MULTIPLE_JOINS: '複数のJOIN',
    GROUP_BY: 'GROUP BY', COUNT: 'COUNT', DISTINCT: 'DISTINCT', SUM: 'SUM', AVG: 'AVG',
    ROUND: 'ROUND', CASE: 'CASE', WHEN: 'WHEN', THEN: 'THEN', ELSE: 'ELSE', END: 'END',
    AS: 'AS', LESS_THAN: '＜（より小さい）', GREATER_THAN: '＞（より大きい）',
    NOT_EQUAL: '＜＞または!=（等しくない）', SUBTRACTION: '引き算', DIVIDE: '割り算',
    HAVING: 'HAVING', MULTIPLY: '掛け算', BETWEEN: 'BETWEEN', LIKE: 'LIKE'
};

function getSqlInputDiagnostic(sql) {
    const trimmed = sql.trim();
    if (!/^SELECT\b/i.test(trimmed)) {
        const words = trimmed.match(/^[A-Za-z]+/)?.[0] || '';
        if (words && levenshteinDistance(words.toUpperCase(), 'SELECT') <= 2) {
            return `「${words}」ではなく「SELECT」のスペルを確認しましょう。`;
        }
        return 'SELECT文の先頭から記述してください。';
    }

    const quoteCount = (trimmed.match(/'/g) || []).length;
    if (quoteCount % 2 !== 0) {
        return "文字列を囲むシングルクォート（'）の位置を確認しましょう。";
    }

    let depth = 0;
    for (const char of trimmed) {
        if (char === '(') depth++;
        if (char === ')') depth--;
        if (depth < 0) {
            return '閉じるかっこ「)」が余っているか、かっこが開いていない位置にあります。';
        }
    }
    if (depth > 0) {
        return 'かっこ「(」に対応する閉じるかっこ「)」が不足しています。かっこの位置を確認しましょう。';
    }

    const knownKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'LIMIT', 'ASC', 'DESC', 'JOIN', 'INNER', 'LEFT', 'ON', 'AND', 'OR', 'AS', 'IS', 'NULL', 'COUNT', 'DISTINCT', 'GROUP', 'HAVING', 'SUM', 'AVG', 'ROUND', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'];
    const words = trimmed.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];
    for (const word of words) {
        if (/^\d+$/.test(word) || knownKeywords.includes(word.toUpperCase())) continue;
        for (const keyword of knownKeywords) {
            if (levenshteinDistance(word.toUpperCase(), keyword) === 1) {
                return `「${word}」のスペルが違う可能性があります。「${keyword}」ではないか確認しましょう。`;
            }
        }
    }
    return null;
}

function levenshteinDistance(a, b) {
    const table = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let i = 0; i <= a.length; i++) table[0][i] = i;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            table[i][j] = b[i - 1] === a[j - 1]
                ? table[i - 1][j - 1]
                : Math.min(table[i - 1][j - 1] + 1, table[i][j - 1] + 1, table[i - 1][j] + 1);
        }
    }
    return table[b.length][a.length];
}

function getSqlExecutionFeedback(errorMessage) {
    const message = String(errorMessage || '');
    if (/no such table/i.test(message)) {
        return 'テーブル名が間違っているか、スペルが一致していません。FROM句で正しいテーブル名を確認しましょう。';
    }
    if (/no such column/i.test(message)) {
        return '列名が間違っているか、スペルが一致していません。SELECT・WHERE・ORDER BYで正しい列名を確認しましょう。';
    }
    if (/syntax error/i.test(message) || /near/i.test(message)) {
        return `SQL構文にエラーがあります。スペル、かっこの位置、カンマ、演算子を確認しましょう。\n詳細：${message}`;
    }
    return `SQLを実行できませんでした。スペル、テーブル名・列名、かっこ、演算子を確認しましょう。\n詳細：${message}`;
}

function verifyMission() {
    const mission = missions[currentMissionIndex];
    if (mission.isBriefing) {
        completeMission();
        return;
    }

    const sql = normalizeSql(document.getElementById('sql-input').value);
    if (!sql) {
        showCenterFeedback({
            tone: 'warn',
            badge: 'NOTICE',
            title: '先にSQLを実行してください',
            message: 'クエリを実行してから正解を判定しよう。',
            duration: 1700
        });
        return;
    }
    const inputDiagnostic = getSqlInputDiagnostic(sql);
    if (inputDiagnostic) {
        showCenterFeedback({
            tone: 'warn',
            badge: 'SQL CHECK',
            title: 'SQLの記述を確認してください',
            message: inputDiagnostic,
            duration: 2800
        });
        return;
    }
    const featureCheck = checkRequiredFeatures(sql, mission.id);
    if (!featureCheck.success) {
        const missingLabels = featureCheck.missing.map(feature => requiredFeatureLabels[feature] || feature);
        showCenterFeedback({
            tone: 'warn',
            badge: 'SYNTAX CHECK',
            title: '必要なSQL構文が不足しています',
            message: `不足している要素：${missingLabels.join('、')}`,
            duration: 2400
        });
        return;
    }
    const userResult = executeUserQuery(sql);
    if (!userResult.success) {
        showCenterFeedback({
            tone: 'error',
            badge: 'SQL ERROR',
            title: 'SQLの実行エラー',
            message: getSqlExecutionFeedback(userResult.error),
            duration: 2600
        });
        return;
    }
    let expectedResult;
    try {
        const raw = db.exec(mission.expectedSql);
        expectedResult = raw.length ? { columns: raw[0].columns, values: raw[0].values } : { columns: [], values: [] };
    } catch (error) {
        showCenterFeedback({
            tone: 'error',
            badge: 'SYSTEM ERROR',
            title: '模範解答の実行エラー',
            message: error.message,
            duration: 2600
        });
        return;
    }
    const comparison = compareResults(userResult, expectedResult, mission.orderSensitive);
    if (!comparison.matches) {
        showCenterFeedback({
            tone: 'warn',
            badge: 'NOT MATCHED',
            title: '正解と一致しません',
            message: getMismatchMessage(comparison),
            duration: 6000
        });
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
    const hasNext = currentMissionIndex + 1 < missions.length;
    showCenterFeedback({
        tone: 'success',
        badge: 'MISSION CLEARED',
        title: mission.title,
        message: mission.clearFeedback?.dialogue || 'ミッションクリア！次の調査へ進もう。',
        learned: mission.clearFeedback?.learned || [],
        modal: hasNext,
        duration: hasNext ? 0 : 2600,
        onNext: hasNext ? () => selectMission(currentMissionIndex + 1) : null
    });
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
        showCenterFeedback({
            tone: 'info',
            badge: 'CODENAME',
            title: 'コードネームを更新しました',
            message: `現在のコードネーム：${codename}`,
            duration: 1500
        });
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
