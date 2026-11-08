/**
 * PS5 ZSTD Compatibility Database — browser entry point.
 * All content is derived from data/*.json; nothing is hardcoded into HTML.
 */
import { buildIndex, computeStats, normalise, STATUS } from './data.js';
import { collectFilterOptions, filterRows, readState, activeFilterCount } from './filters.js';
import { renderDetail, esc } from './details.js';

const REPO = 'https://github.com/Theweil/PS5-ZSTD-Compatibility';
const DATA_FILES = ['games.json', 'tests.json', 'sources.json', 'regions.json', 'updates.json'];

const I18N = {
  zh: {
    skip: '跳到主要内容', brandSub: '社区维护的压缩兼容性数据库',
    navDatabase: '数据库', navStatus: '结果含义', navUpdates: '更新记录', navContribute: '参与贡献',
    heroEyebrow: '社区共同维护 · 开源 · 无服务器',
    heroTitle: 'PS5 ZSTD / LZ4<br><span>兼容性数据库</span>',
    heroLead: '按游戏、PPSA、压缩格式与独立测试报告查询 PS5 游戏的 ZSTD / LZ4 转换与运行兼容性。所有结论都保留原始测试者、原始备注与相互冲突的报告，不做合并、不做推断。',
    heroBrowse: '浏览数据库', heroSubmit: '提交测试报告',
    heroFoot: '数据源：仓库中的 JSON · 网站无需登录、无需后端 · 统计由数据实时计算',
    heroCardTitle: '数据可信度说明',
    heroCard1: '85 条通过表原始记录 ≠ 85 款经独立验证的游戏',
    heroCard2: '社区报告不等于维护者独立复现',
    heroCard3: 'ZSTD 结论与 LZ4 结论分开统计',
    heroCard4: '相反结果全部保留，标记为冲突或待确认',
    heroCard5: '原始资料未提供测试日期与环境版本，一律显示「未提供」',
    statsTitle: '当前数据库统计', statsNote: '以下数字全部由 data/*.json 实时计算',
    statsDisclaimer: '注意：「原始记录」是社区清单的表格行数；「独立游戏」是去重后的游戏实体；「测试报告」是拆分后的独立报告。三者互不相等，也不能互相替代。',
    dbTitle: '游戏数据库', searchLabel: '搜索游戏 / PPSA / 别名 / 测试者',
    searchPlaceholder: '例如：羊蹄山之魂 / Ghost of Yotei / PPSA26344 / hmh715',
    ppsaLabel: 'PPSA 精确检索', ppsaPlaceholder: '例如：PPSA30117 或 30117',
    filterStatus: '聚合状态', filterCompression: '压缩格式', filterRegion: '地区', filterTester: '测试者', filterSort: '排序',
    allOption: '全部', statusPassed: '通过', statusFailed: '失败', statusConflict: '冲突', statusNeeds: '待确认',
    compressionUnknown: '格式未注明', sortTitle: '名称 A–Z', sortStatus: '状态优先', sortReports: '报告数最多', sortPpsa: 'PPSA 升序',
    reset: '重置', loading: '正在加载 JSON 数据…',
    statusTitle: '测试结果含义', statusDoc: '完整定义 →',
    updatesTitle: '最近更新', updatesNote: '来自 data/updates.json；日期为项目事件日期，不是测试日期',
    contributeTitle: '参与社区维护', contributeNote: 'Issue 不会自动修改正式数据，所有变更都需核实后经 PR 审核',
    ccTag1: '新增', ccTag2: '问题', ccTag3: '修正',
    ccTitle1: '提交新的测试报告', ccTitle2: '报告兼容性问题', ccTitle3: '修正错误资料',
    ccBody1: '填写游戏、PPSA、地区、压缩格式、结果、固件、游戏版本、转换工具、运行库、挂载工具、日期与证据链接。未知项填 unknown。',
    ccBody2: '卡 logo、黑屏、运行失败、signal 11 等；请附问题表现、测试环境、转换与运行库版本、是否可复现、日志或截图。',
    ccBody3: '修正游戏名称、PPSA、地区或测试数据；请提供原数据、建议数据、修改理由与来源。',
    ccLink: '打开表单 →',
    contributeFlow: '流程：Issue 提交 → 管理员核实 → 更新 JSON → 自动数据校验 → Pull Request → 审核合并 → GitHub Pages 自动发布',
    footerNote: '社区共同维护的兼容性元数据。仅收录事实性元数据，不含任何游戏文件、PKG、密钥或第三方享有版权的内容。',
    footerContributing: '贡献指南', footerLicense: '代码 MIT · 整理的数据 CC BY 4.0 · 第三方内容版权归原作者所有',
    detailKicker: '游戏详情 / 独立测试报告',
    notProvided: '未提供',
    resultPass: '通过', resultFail: '失败', resultPartial: '部分成功', resultUnknown: '无法判断',
    region_HK: '港服（中国香港）', region_US: '美服', region_EU: '欧服', region_JP: '日服', region_AS: '亚服',
    region_MULTI: '多地区', region_UNKNOWN: '地区未注明',
    verify_community_report: '社区报告', verify_maintainer_reproduced: '维护者独立复现',
    verify_single_source: '单一来源', verify_unknown: '未知',
    ppsaPending: 'PPSA 待确认', ppsaLabelShort: 'PPSA',
    metaTester: '测试者', metaVersion: '游戏版本', metaRuntime: '运行库版本', metaLatest: '最新测试时间',
    cardReports: '条独立报告', cardSkus: '个 SKU', cardMore: '查看详情 →',
    emptyTitle: '没有符合条件的游戏', emptyBody: '请尝试减少筛选条件，或更换关键词。',
    loadError: '数据加载失败：', loadErrorHint: '请确认 data/*.json 存在，并通过 HTTP 服务访问（不要直接以 file:// 打开）。',
    summaryGames: '款游戏', summaryReports: '条报告', summaryFilters: '个筛选条件',
    stat_source_records_total: '原始记录合计', stat_source_pass_records: '通过表原始记录',
    stat_source_problem_records: '问题表原始记录', stat_distinct_games: '独立游戏',
    stat_test_reports_total: '独立测试报告', stat_zstd_reports: 'ZSTD 测试报告',
    stat_lz4_reports: 'LZ4 测试报告', stat_unknown_compression_reports: '格式未注明报告',
    stat_status_conflict_games: '冲突游戏', stat_status_needs_confirmation_games: '待确认游戏',
    stat_reports_missing_ppsa: '缺少 PPSA 的报告', stat_maintainer_reproductions: '维护者独立复现',
    sub_source_records_total: '通过表 + 问题表', sub_source_pass_records: '原始清单行数，非已验证游戏数',
    sub_source_problem_records: '原始问题表行数', sub_distinct_games: '去重后的游戏实体',
    sub_test_reports_total: '拆分后的独立报告', sub_zstd_reports: '仅 compression=zstd',
    sub_lz4_reports: '仅 compression=lz4', sub_unknown_compression_reports: '问题表没有压缩格式列',
    sub_status_conflict_games: '含范围推断冲突', sub_status_needs_confirmation_games: '关键信息缺失或结果分歧',
    sub_reports_missing_ppsa: '显示「待确认」', sub_maintainer_reproductions: '当前为 0，社区报告未冒充复现',
    statusInfo1: '通过', statusInfo1b: '当前查询范围内有成功报告，且没有相应的失败冲突。不代表所有 SKU / 所有压缩格式都通过。',
    statusInfo2: '失败', statusInfo2b: '当前查询范围内只有失败报告。不同压缩格式单独判断，ZSTD 失败不代表 LZ4 失败。',
    statusInfo3: '冲突', statusInfo3b: '同一游戏、同一 SKU、同一压缩格式存在相反报告。两条报告都保留，并且醒目列出。',
    statusInfo4: '待确认', statusInfo4b: '证据不足、关键环境信息缺失，或存在跨格式 / 格式未明的结果分歧。不得据此认定通过。',
    statusInfo5: '社区报告 ≠ 维护者复现', statusInfo5b: '本库初始数据全部来自社区清单，verification=community_report；维护者独立复现数量单独统计。',
    statusInfo6: 'ZSTD 与 LZ4 分开统计', statusInfo6b: '格式未注明的报告不计入任何格式。ZSTD 通过不能代表 LZ4 通过，反之亦然。',
  },
  en: {
    skip: 'Skip to main content', brandSub: 'Community-maintained compatibility database',
    navDatabase: 'Database', navStatus: 'Status meaning', navUpdates: 'Updates', navContribute: 'Contribute',
    heroEyebrow: 'Community maintained · Open source · No server',
    heroTitle: 'PS5 ZSTD / LZ4<br><span>Compatibility Database</span>',
    heroLead: 'Look up PS5 game compatibility after ZSTD / LZ4 conversion by game, PPSA, compression format and independent test report. Every verdict keeps its original tester, original notes and conflicting reports — nothing is merged or inferred.',
    heroBrowse: 'Browse database', heroSubmit: 'Submit a test report',
    heroFoot: 'Data source: JSON in this repository · No login, no backend · All figures computed live',
    heroCardTitle: 'How to read this data',
    heroCard1: '85 pass-table rows ≠ 85 independently verified games',
    heroCard2: 'A community report is not a maintainer reproduction',
    heroCard3: 'ZSTD and LZ4 results are counted separately',
    heroCard4: 'Opposing reports are all retained and marked conflict / pending',
    heroCard5: 'The source list has no test dates or environment versions; those read "not provided"',
    statsTitle: 'Database at a glance', statsNote: 'Every figure below is computed live from data/*.json',
    statsDisclaimer: 'Note: "original records" are rows in the community list; "distinct games" are de-duplicated game entities; "test reports" are split independent reports. These are different things and are not interchangeable.',
    dbTitle: 'Game database', searchLabel: 'Search game / PPSA / alias / tester',
    searchPlaceholder: 'e.g. Ghost of Yotei / PPSA26344 / hmh715',
    ppsaLabel: 'PPSA lookup', ppsaPlaceholder: 'e.g. PPSA30117 or 30117',
    filterStatus: 'Aggregated status', filterCompression: 'Compression', filterRegion: 'Region', filterTester: 'Tester', filterSort: 'Sort',
    allOption: 'All', statusPassed: 'Passed', statusFailed: 'Failed', statusConflict: 'Conflict', statusNeeds: 'Needs confirmation',
    compressionUnknown: 'Format unstated', sortTitle: 'Title A–Z', sortStatus: 'Status first', sortReports: 'Most reports', sortPpsa: 'PPSA ascending',
    reset: 'Reset', loading: 'Loading JSON data…',
    statusTitle: 'What the results mean', statusDoc: 'Full definitions →',
    updatesTitle: 'Recent updates', updatesNote: 'From data/updates.json; dates are project events, not test dates',
    contributeTitle: 'Help maintain this database', contributeNote: 'Issues never edit the database directly; all changes are verified and merged via PR',
    ccTag1: 'NEW', ccTag2: 'PROBLEM', ccTag3: 'CORRECTION',
    ccTitle1: 'Submit a new test report', ccTitle2: 'Report a compatibility problem', ccTitle3: 'Correct an existing record',
    ccBody1: 'Provide game, PPSA, region, compression, result, firmware, game version, converter, runtime, mount tool, date and evidence. Use unknown where unknown.',
    ccBody2: 'Stuck on logo, black screen, launch failure, signal 11, etc. Include symptoms, environment, converter/runtime versions, reproducibility, logs or screenshots.',
    ccBody3: 'Fix a game title, PPSA, region or test value. Provide the current value, proposed value, reason and sources.',
    ccLink: 'Open form →',
    contributeFlow: 'Flow: Issue → maintainer verification → JSON update → automated validation → Pull Request → review & merge → GitHub Pages publish',
    footerNote: 'Community-maintained compatibility metadata only. No game files, PKGs, keys or third-party copyrighted material.',
    footerContributing: 'Contributing guide', footerLicense: 'Code MIT · Curated data CC BY 4.0 · Third-party content belongs to its owners',
    detailKicker: 'Game details / independent reports',
    notProvided: 'Not provided',
    resultPass: 'Pass', resultFail: 'Fail', resultPartial: 'Partial', resultUnknown: 'Unknown',
    region_HK: 'Hong Kong, China', region_US: 'US', region_EU: 'Europe', region_JP: 'Japan', region_AS: 'Asia',
    region_MULTI: 'Multiple regions', region_UNKNOWN: 'Region not stated',
    verify_community_report: 'Community report', verify_maintainer_reproduced: 'Maintainer reproduction',
    verify_single_source: 'Single source', verify_unknown: 'Unknown',
    ppsaPending: 'PPSA pending', ppsaLabelShort: 'PPSA',
    metaTester: 'Testers', metaVersion: 'Game version', metaRuntime: 'Runtime', metaLatest: 'Latest test date',
    cardReports: 'independent reports', cardSkus: 'SKUs', cardMore: 'View details →',
    emptyTitle: 'No games match these filters', emptyBody: 'Try removing a filter or changing the search term.',
    loadError: 'Failed to load data: ', loadErrorHint: 'Check that data/*.json exists and that the site is served over HTTP (do not open via file://).',
    summaryGames: 'games', summaryReports: 'reports', summaryFilters: 'active filters',
    stat_source_records_total: 'Original records', stat_source_pass_records: 'Pass-table rows',
    stat_source_problem_records: 'Problem-table rows', stat_distinct_games: 'Distinct games',
    stat_test_reports_total: 'Independent reports', stat_zstd_reports: 'ZSTD reports',
    stat_lz4_reports: 'LZ4 reports', stat_unknown_compression_reports: 'Format-unstated reports',
    stat_status_conflict_games: 'Conflict games', stat_status_needs_confirmation_games: 'Needs confirmation',
    stat_reports_missing_ppsa: 'Reports missing PPSA', stat_maintainer_reproductions: 'Maintainer reproductions',
    sub_source_records_total: 'Pass table + problem table', sub_source_pass_records: 'Source rows, not verified games',
    sub_source_problem_records: 'Original problem-table rows', sub_distinct_games: 'De-duplicated game entities',
    sub_test_reports_total: 'After splitting P-044', sub_zstd_reports: 'Only compression=zstd',
    sub_lz4_reports: 'Only compression=lz4', sub_unknown_compression_reports: 'Problem table has no format column',
    sub_status_conflict_games: 'Includes scope-inferred conflicts', sub_status_needs_confirmation_games: 'Missing key info or mixed results',
    sub_reports_missing_ppsa: 'Shown as "pending"', sub_maintainer_reproductions: 'Currently 0; no community report is relabelled',
    statusInfo1: 'Passed', statusInfo1b: 'The current query has a pass report and no corresponding fail conflict. It does not mean every SKU or format passes.',
    statusInfo2: 'Failed', statusInfo2b: 'Only fail reports match the current query. Formats are judged separately; a ZSTD failure says nothing about LZ4.',
    statusInfo3: 'Conflict', statusInfo3b: 'Opposing reports share the same game, SKU and compression format. Both are retained and highlighted.',
    statusInfo4: 'Needs confirmation', statusInfo4b: 'Insufficient evidence, missing key environment data, or cross-format / unknown-format disagreement. Never read as "passed".',
    statusInfo5: 'Community report ≠ maintainer reproduction', statusInfo5b: 'All initial rows come from a community list with verification=community_report; maintainer reproductions are counted separately.',
    statusInfo6: 'ZSTD and LZ4 are separate', statusInfo6b: 'Reports with unstated format count toward neither. A ZSTD pass never implies an LZ4 pass (or vice versa).',
  },
};

const STAT_KEYS = [
  'source_records_total', 'source_pass_records', 'source_problem_records', 'distinct_games',
  'test_reports_total', 'zstd_reports', 'lz4_reports', 'unknown_compression_reports',
  'status_conflict_games', 'status_needs_confirmation_games', 'reports_missing_ppsa', 'maintainer_reproductions',
];

let state = {
  lang: localStorage.getItem('ps5zstd.lang') || 'zh',
  theme: localStorage.getItem('ps5zstd.theme')
    || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
  index: null,
  stats: null,
  updates: [],
  rows: [],
};

const $ = (sel) => document.querySelector(sel);
const t = (key) => (I18N[state.lang] || I18N.zh)[key] || I18N.zh[key] || key;

function applyI18n() {
  document.documentElement.dataset.lang = state.lang;
  document.documentElement.lang = state.lang === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n);
    if (value !== undefined) el.innerHTML = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  $('#lang-toggle').textContent = state.lang === 'zh' ? 'EN' : '中';
  $('#lang-toggle').setAttribute('aria-label', state.lang === 'zh' ? 'Switch to English' : '切换到中文');
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  $('#theme-icon').textContent = state.theme === 'dark' ? '☾' : '☀';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = state.theme === 'dark' ? '#0d1117' : '#ffffff';
}

async function loadData() {
  const results = await Promise.all(DATA_FILES.map(async (f) => {
    const res = await fetch(`data/${f}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${f}: HTTP ${res.status}`);
    return res.json();
  }));
  const [gamesDoc, testsDoc, sourcesDoc, regionsDoc, updatesDoc] = results;
  const games = Array.isArray(gamesDoc) ? gamesDoc : (gamesDoc.games || []);
  const tests = Array.isArray(testsDoc) ? testsDoc : (testsDoc.tests || []);
  const updates = updatesDoc.updates || [];
  state.index = buildIndex(games, tests, updates);
  state.stats = computeStats({ games, tests, sources: sourcesDoc });
  state.updates = [...updates].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  state.regionLabels = new Map((regionsDoc.regions || []).map((r) => [r.code, state.lang === 'en' ? r.label_en : r.label_zh]));
}

function regionLabel(code) {
  return state.regionLabels?.get(code) || t('region_' + code) || code;
}

function renderStats() {
  const s = state.stats;
  $('#stats-grid').innerHTML = STAT_KEYS.map((k) => {
    const cls = k === 'status_conflict_games' ? 'danger'
      : ['source_pass_records', 'unknown_compression_reports', 'status_needs_confirmation_games'].includes(k) ? 'warn'
        : k === 'distinct_games' ? 'accent' : '';
    return `<div class="stat-card ${cls}">
      <span class="stat-label">${esc(t('stat_' + k))}</span>
      <span class="stat-value">${esc(s[k] ?? 0)}</span>
      <span class="stat-sub">${esc(t('sub_' + k))}</span>
    </div>`;
  }).join('');
}

function renderStatusInfo() {
  $('#status-cards').innerHTML = [1, 2, 3, 4, 5, 6].map((n) => `
    <div class="status-card"><h3>${esc(t('statusInfo' + n))}</h3><p>${esc(t('statusInfo' + n + 'b'))}</p></div>
  `).join('');
}

function renderUpdates() {
  const list = $('#updates-list');
  if (!state.updates.length) {
    list.innerHTML = `<li><div class="upd-detail">${esc(t('notProvided'))}</div></li>`;
    return;
  }
  list.innerHTML = state.updates.map((u) => `<li>
    <div class="upd-date">${esc(u.date)} · ${esc(u.type)}</div>
    <div class="upd-title">${esc(state.lang === 'en' ? (u.title_en || u.title_zh) : (u.title_zh || u.title_en))}</div>
    <div class="upd-detail">${esc(state.lang === 'en' ? (u.detail_en || u.detail_zh) : (u.detail_zh || u.detail_en))}</div>
  </li>`).join('');
}

function populateSelects() {
  const opts = collectFilterOptions(state.index);
  const region = $('#f-region');
  const tester = $('#f-tester');
  const currentRegion = region.value;
  const currentTester = tester.value;
  region.innerHTML = `<option value="">${esc(t('allOption'))}</option>`
    + opts.regions.map((r) => `<option value="${esc(r)}">${esc(regionLabel(r))} (${esc(r)})</option>`).join('');
  tester.innerHTML = `<option value="">${esc(t('allOption'))}</option>`
    + opts.testers.map((x) => `<option value="${esc(x)}">${esc(x)}</option>`).join('');
  if ([...region.options].some((o) => o.value === currentRegion)) region.value = currentRegion;
  if ([...tester.options].some((o) => o.value === currentTester)) tester.value = currentTester;
}

function gameCard(row) {
  const g = row.game;
  const zh = g.title_zh || g.title_en || g.title_original || g.id;
  const en = g.title_en && g.title_zh ? g.title_en : (g.title_original || '');
  const tests = row._tests || row.tests;
  const status = row._status || row.status;
  const ppsaChips = (g.skus || []).map((s) =>
    `<span class="chip mono" title="${esc((s.regions || []).map(regionLabel).join(' / '))}">${esc(s.ppsa)} · ${esc((s.regions || []).map(regionLabel).join('/') || regionLabel('UNKNOWN'))}</span>`).join('')
    || `<span class="chip">${esc(t('ppsaPending'))}</span>`;
  const comps = [...new Set(tests.map((x) => x.compression))];
  const compChips = comps.map((c) => `<span class="chip ${c === 'zstd' ? 'zstd' : c === 'lz4' ? 'lz4' : 'unknown'}">${esc(c === 'unknown' ? t('compressionUnknown') : c.toUpperCase())}</span>`).join('');
  const testers = [...new Set(tests.flatMap((x) => x.tester || []))];
  const versions = [...new Set(tests.map((x) => x.game_version).filter(Boolean))];
  const runtimes = [...new Set(tests.map((x) => x.runtime_version).filter(Boolean))];
  const dates = tests.map((x) => x.tested_at).filter(Boolean).sort();
  const na = `<span style="color:var(--faint)">${esc(t('notProvided'))}</span>`;
  return `<button type="button" class="game-card" data-game="${esc(g.id)}" aria-label="${esc(zh)} — ${esc(t('cardMore'))}">
    <div class="gc-top">
      <div class="gc-title"><h3>${esc(zh)}</h3><span class="gc-en">${esc(en)}</span></div>
      <span class="badge ${esc(status)}">${esc(t(status === STATUS.PASSED ? 'statusPassed' : status === STATUS.FAILED ? 'statusFailed' : status === STATUS.CONFLICT ? 'statusConflict' : 'statusNeeds'))}</span>
    </div>
    <div class="gc-chips">${ppsaChips}${compChips}${testers.slice(0, 4).map((x) => `<span class="chip">👤 ${esc(x)}</span>`).join('')}</div>
    <div class="gc-meta">
      <div><b>${esc(t('metaTester'))}：</b>${testers.length ? `<span>${esc(testers.join(' / '))}</span>` : na}</div>
      <div><b>${esc(t('metaVersion'))}：</b>${versions.length ? `<span>${esc(versions.join(' / '))}</span>` : na}</div>
      <div><b>${esc(t('metaRuntime'))}：</b>${runtimes.length ? `<span>${esc(runtimes.join(' / '))}</span>` : na}</div>
      <div><b>${esc(t('metaLatest'))}：</b>${dates.length ? `<span>${esc(dates[dates.length - 1])}</span>` : na}</div>
    </div>
    <div class="gc-foot"><span>${tests.length} ${esc(t('cardReports'))} · ${(g.skus || []).length} ${esc(t('cardSkus'))}</span><span class="gc-more">${esc(t('cardMore'))}</span></div>
  </button>`;
}

let lastStateKey = '';

function renderList() {
  const s = readState($('#filters'));
  // Avoid needless DOM replacement. A blur-induced `change` on a text input
  // must never re-render the list between mousedown and mouseup, or the card
  // the user is clicking gets detached and the click is lost.
  const key = JSON.stringify(s);
  if (key === lastStateKey && $('#game-list').childElementCount) return;
  lastStateKey = key;
  state.rows = filterRows(state.index, s);
  const reportCount = state.rows.reduce((n, r) => n + (r._tests || r.tests).length, 0);
  $('#result-count').textContent = `${state.rows.length} / ${state.index.rows.length} ${t('summaryGames')}`;
  $('#filter-summary').textContent = `${state.rows.length} ${t('summaryGames')} · ${reportCount} ${t('summaryReports')} · ${activeFilterCount(s)} ${t('summaryFilters')}`;
  $('#game-list').innerHTML = state.rows.map(gameCard).join('');
  $('#empty-state').hidden = state.rows.length !== 0;
  $('#empty-state').innerHTML = `<strong style="display:block;margin-bottom:6px;color:var(--text-strong)">${esc(t('emptyTitle'))}</strong>${esc(t('emptyBody'))}`;
  $('#loading-state').hidden = true;
}

function openDetail(id, pushHash) {
  const row = state.rows.find((r) => r.game.id === id) || state.index.rows.find((r) => r.game.id === id);
  if (!row) return;
  const g = row.game;
  $('#detail-title').textContent = g.title_zh && g.title_en
    ? `${g.title_zh} · ${g.title_en}`
    : (g.title_zh || g.title_en || g.title_original || g.id);
  $('#detail-body').innerHTML = renderDetail(row, { t, lang: state.lang });
  $('#detail-overlay').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#close-detail').focus();
  if (pushHash) history.replaceState(null, '', `#game=${encodeURIComponent(id)}`);
}

function closeDetail() {
  $('#detail-overlay').hidden = true;
  document.body.style.overflow = '';
  if (location.hash.startsWith('#game=')) history.replaceState(null, '', location.pathname + location.search);
}

function rerenderAll() {
  applyI18n();
  lastStateKey = '';
  populateSelects();
  renderStats();
  renderStatusInfo();
  renderUpdates();
  renderList();
  if (!$('#detail-overlay').hidden) {
    const id = decodeURIComponent((location.hash.match(/^#game=(.*)$/) || [])[1] || '');
    if (id) openDetail(id, false);
  }
}

function bindEvents() {
  $('#lang-toggle').addEventListener('click', () => {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('ps5zstd.lang', state.lang);
    rerenderAll();
  });
  $('#theme-toggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ps5zstd.theme', state.theme);
    applyTheme();
  });
  // `input` for text fields, `change` only for selects. Listening to `change`
  // on text inputs would re-render the list when the field loses focus (e.g.
  // when the user clicks a game card), destroying the click target.
  $('#filters').addEventListener('input', (e) => {
    if (e.target.matches('input')) renderList();
  });
  $('#filters').addEventListener('change', (e) => {
    if (e.target.matches('select')) renderList();
  });
  $('#reset-filters').addEventListener('click', () => {
    $('#filters').reset();
    lastStateKey = '';
    renderList();
  });
  $('#game-list').addEventListener('click', (e) => {
    const card = e.target.closest('[data-game]');
    if (card) openDetail(card.dataset.game, true);
  });
  $('#close-detail').addEventListener('click', closeDetail);
  document.querySelector('[data-close-detail]').addEventListener('click', closeDetail);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#detail-overlay').hidden) closeDetail();
  });
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent((location.hash.match(/^#game=(.*)$/) || [])[1] || '');
    if (id && state.index) openDetail(id, false);
    else if (!$('#detail-overlay').hidden) closeDetail();
  });
}

async function main() {
  applyI18n();
  applyTheme();
  bindEvents();
  try {
    await loadData();
    rerenderAll();
    const id = decodeURIComponent((location.hash.match(/^#game=(.*)$/) || [])[1] || '');
    if (id) openDetail(id, false);
  } catch (err) {
    $('#loading-state').textContent = t('loadError') + esc(err.message);
    const banner = $('#error-banner');
    banner.hidden = false;
    banner.innerHTML = `<strong>${esc(t('loadError'))}</strong>${esc(err.message)} — ${esc(t('loadErrorHint'))}`;
    console.error('[PS5 ZSTD DB] data load failed:', err);
  }
}

main();
