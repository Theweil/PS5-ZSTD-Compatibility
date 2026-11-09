#!/usr/bin/env node
/**
 * Turn an approved "new test" Issue into a complete, reviewable data change.
 *
 * Triggered by .github/workflows/issue-to-pr.yml when a maintainer adds the
 * `approved` label to a `new-test` Issue, or comments `/approve` on it.
 *
 * The script NEVER publishes anything by itself: it only edits the working
 * tree. The workflow runs `npm test` and opens a Pull Request, and the site is
 * published only after a human merges that PR into main.
 *
 * Golden rules (same as the rest of the project):
 *   - The 95 verbatim archive rows in sources.json are never touched.
 *   - Issue reports use I-nnn provenance ids, never invented P-xxx/F-xxx.
 *   - Unprovided fields stay null / []; dates are only format-normalised.
 *   - README statistics (snapshot + table + prose) are always kept in sync,
 *     otherwise `npm test` / deploy.yml would reject the build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { computeStats } from '../site/assets/js/data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(
  path.join(ROOT, rel), JSON.stringify(value, null, 2) + '\n', 'utf8',
);
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const writeText = (rel, value) => fs.writeFileSync(path.join(ROOT, rel), value, 'utf8');

function fail(message) {
  console.error('IMPORT FAILED: ' + message);
  console.error('No Pull Request will be created. Fix the Issue and re-run the approval.');
  process.exit(1);
}
function setOutput(name, value) {
  const p = process.env.GITHUB_OUTPUT;
  if (p) fs.appendFileSync(p, `${name}=${String(value).replace(/\r?\n/g, '%0A')}\n`);
}

const issueNumber = Number(process.env.ISSUE_NUMBER);
const issueTitle = String(process.env.ISSUE_TITLE || '').trim();
const issueBody = String(process.env.ISSUE_BODY || '');
const issueAuthor = String(process.env.ISSUE_AUTHOR || 'unknown');
const issueUrl = String(process.env.ISSUE_URL || `https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/${issueNumber}`);
const issueCreatedAt = String(process.env.ISSUE_CREATED_AT || '').slice(0, 10) || new Date().toISOString().slice(0, 10);

if (!Number.isInteger(issueNumber) || issueNumber < 1) fail('ISSUE_NUMBER is missing or invalid.');

// ---- 1. Parse the Issue Form body -----------------------------------------
const HEADINGS = [
  [/Chinese title/i, 'game_zh'],
  [/English title/i, 'game_en'],
  [/^PPSA$/i, 'ppsa'],
  [/Region/i, 'region'],
  [/Compression/i, 'compression'],
  [/Result/i, 'result'],
  [/PS5 firmware/i, 'ps5_firmware'],
  [/Game version/i, 'game_version'],
  [/Converter/i, 'converter'],
  [/Runtime/i, 'runtime_version'],
  [/Mount tool/i, 'mount_tool'],
  [/Test date/i, 'tested_at'],
  [/Tester/i, 'tester'],
  [/Symptoms/i, 'symptom'],
  [/Evidence links/i, 'evidence'],
  [/Notes/i, 'notes'],
];
function parseBody(body) {
  const fields = {};
  for (const block of String(body).split(/^###\s+/m).slice(1)) {
    const nl = block.indexOf('\n');
    const heading = (nl === -1 ? block : block.slice(0, nl)).trim();
    const raw = (nl === -1 ? '' : block.slice(nl + 1)).trim();
    const hit = HEADINGS.find(([re]) => re.test(heading));
    if (!hit) continue;
    fields[hit[1]] = (!raw || raw === '_No response_') ? '' : raw;
  }
  return fields;
}
const f = parseBody(issueBody);
const clean = (v) => {
  const s = String(v ?? '').trim();
  if (!s || s === '_No response_' || s === '—' || s === '待确认') return null;
  if (/^unknown\b/i.test(s)) return null;
  return s;
};
const enumOf = (value, allowed, label) => {
  const s = String(value ?? '').trim().toLowerCase();
  const first = s.split(/\s*[/|]\s*/)[0].trim();
  if (allowed.includes(first)) return first;
  if (!s || s === '_no response_' || /^unknown\b/.test(s)) return 'unknown';
  fail(`${label}: unsupported value "${value}". Expected one of ${allowed.join(', ')} or unknown.`);
};

const gameZh = clean(f.game_zh);
const gameEn = clean(f.game_en);
if (!gameZh && !gameEn) fail('At least one game title (Chinese or English) is required.');
const compression = enumOf(f.compression, ['zstd', 'lz4'], 'compression');
const result = enumOf(f.result, ['pass', 'fail', 'partial'], 'result');
const region = enumOf(f.region, ['hk', 'us', 'eu', 'jp', 'as', 'multi'], 'region').toUpperCase();
const testerRaw = clean(f.tester);
if (!testerRaw) fail('Tester is required.');
const tester = testerRaw.split('/').map((x) => x.trim()).filter(Boolean);
if (!tester.length) fail('Tester is required.');

const ppsaRaw = String(f.ppsa || '').trim();
const ppsaAll = [...new Set((ppsaRaw.match(/PPSA[0-9]{5}/gi) || []).map((x) => x.toUpperCase()))];
if (!ppsaAll.length && ppsaRaw && !/^unknown\b|^待确认|^—/i.test(ppsaRaw)) {
  fail(`PPSA "${ppsaRaw}" is not a full PPSAxxxxx code. Use full codes or unknown; never guess.`);
}
const ppsa = ppsaAll[0] ?? null;

function normaliseDate(value) {
  const s = String(value ?? '').trim();
  if (!s || /^unknown\b/i.test(s)) return null;
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) fail(`Test date "${s}" must be YYYY-MM-DD or unknown. Never invent a date.`);
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}
const testedAtRaw = clean(f.tested_at);
const testedAt = normaliseDate(testedAtRaw);

const evidence = [];
for (const line of String(f.evidence || '').split(/\r?\n/)) {
  const m = line.match(/https?:\/\/[^\s<>"']+/);
  if (!m) continue;
  let label;
  try { label = new URL(m[0]).hostname; } catch { label = 'Evidence link'; }
  evidence.push({ label, url: m[0] });
  if (evidence.length >= 10) break;
}

// ---- 2. Idempotency: one Issue can only be imported once ------------------
const gamesDoc = readJson('data/games.json');
const testsDoc = readJson('data/tests.json');
const updatesDoc = readJson('data/updates.json');
const regionsDoc = readJson('data/regions.json');

const sourceId = `I-${String(issueNumber).padStart(3, '0')}`;
if (testsDoc.tests.some((t) => t.source_type === 'issue' && t.issue_number === issueNumber)) {
  console.log(`SKIP: Issue #${issueNumber} is already imported as ${sourceId}. Nothing to do.`);
  setOutput('skip', 'true');
  setOutput('reason', `Issue #${issueNumber} is already in the database.`);
  process.exit(0);
}
setOutput('skip', 'false');

// ---- 3. Locate or create the game entity ----------------------------------
const slugify = (s) => String(s).toLowerCase().normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const normTitle = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const REGION_LABEL_ZH = { HK: '港服', US: '美服', EU: '欧服', JP: '日服', AS: '亚服', MULTI: '多地区' };
const titleOriginal = [gameZh, gameEn].filter(Boolean).join(' ');

let game = gamesDoc.games.find((g) =>
  (gameEn && normTitle(g.title_en) === normTitle(gameEn))
  || (gameZh && normTitle(g.title_zh) === normTitle(gameZh)));
let createdGame = false;
if (!game) {
  const id = slugify(gameEn || gameZh || '') || `game-issue-${issueNumber}`;
  if (gamesDoc.games.some((g) => g.id === id)) fail(`Generated game id "${id}" already exists; manual review needed.`);
  game = {
    id,
    title_zh: gameZh ?? null,
    title_en: gameEn ?? null,
    title_original: titleOriginal,
    platform: 'PS5',
    skus: [],
    candidate_skus: [],
    aliases: [],
    description: null,
    notes: `来源：GitHub Issue #${issueNumber}（new-test 表单）。${gameZh ? '' : '中文名未提供，title_zh 保持 null，不猜测译名。'}`,
    game_identification: 'confirmed',
    source_record_ids: [sourceId],
  };
  gamesDoc.games.push(game);
  createdGame = true;
}
// A new PPSA becomes a confirmed SKU. Never rewrite an archive game's
// source_record_ids (mixing I-nnn with P/F-nnn is rejected by the validator).
for (const code of ppsaAll) {
  if (game.skus.some((s) => s.ppsa === code)) continue;
  game.skus.push({
    ppsa: code,
    regions: [region],
    region_raw: f.region || null,
    confidence: 'confirmed',
    source: 'issue_form',
    notes: null,
    source_record_ids: [sourceId],
    region_labels: REGION_LABEL_ZH[region] ? [REGION_LABEL_ZH[region]] : [],
  });
}

// ---- 4. Append the independent test report --------------------------------
const nextId = Math.max(0, ...testsDoc.tests.map((t) => Number((t.id.match(/^test-([0-9]{4})/) || [0, 0])[1]))) + 1;
if (nextId > 9999) fail('test id space exhausted.');
const testId = `test-${String(nextId).padStart(4, '0')}`;
const noteParts = [
  `来源：GitHub Issue #${issueNumber}「${issueTitle}」（new-test 表单；提交者 ${issueAuthor}；提交日期 ${issueCreatedAt}）。`,
  f.notes ? `表单备注：${f.notes}` : '表单备注栏为空。',
];
if (testedAtRaw && testedAtRaw !== testedAt) noteParts.push(`测试日期原文「${testedAtRaw}」按 YYYY-MM-DD 规范化为 ${testedAt}。`);
if (f.symptom) noteParts.push(`表单症状：${f.symptom}`);
noteParts.push('所有未提供的字段保持 null / 空，不做推断。');

testsDoc.tests.push({
  id: testId,
  game_id: game.id,
  game_title_raw: titleOriginal,
  ppsa,
  ppsa_raw: ppsaRaw || 'unknown',
  ppsa_all: ppsaAll,
  ppsa_status: ppsa ? 'present' : 'missing',
  region,
  regions: [region],
  region_raw: f.region || null,
  compression,
  compression_raw: f.compression || null,
  compression_scope: compression === 'unknown' ? 'unknown' : 'explicit',
  result,
  verification: 'community_report',
  tester,
  tester_raw: testerRaw,
  tested_at: testedAt,
  ps5_firmware: clean(f.ps5_firmware),
  game_version: clean(f.game_version),
  converter: clean(f.converter),
  runtime_version: clean(f.runtime_version),
  mount_tool: clean(f.mount_tool),
  evidence,
  source_record_ids: [sourceId],
  source_table: 'issue',
  source_row: issueNumber,
  symptom: clean(f.symptom),
  notes: noteParts.join(' '),
  history: [],
  game_identification: 'confirmed',
  derivation: '由 issue-to-pr 工作流按 new-test 表单字段生成，经维护者审核；未提供的字段保持 null / []。',
  source_type: 'issue',
  issue_number: issueNumber,
  issue_url: issueUrl,
  submitted_by: issueAuthor,
  submitted_at: issueCreatedAt,
});

// ---- 5. Website "recent updates" entry ------------------------------------
const eventDate = new Date().toISOString().slice(0, 10);
updatesDoc.updates.push({
  id: `update-${eventDate}-${sourceId}`,
  date: eventDate,
  type: 'community_reports',
  title_zh: '收录 1 条社区测试报告',
  title_en: 'Added 1 community test report',
  detail_zh: `核实并收录 Issue #${issueNumber}（${titleOriginal}${ppsa ? ` · ${ppsa}` : ' · PPSA 待确认'} · ${compression.toUpperCase()} ${result}）。由维护者审核后自动生成，合并 PR 后发布。`,
  detail_en: `Verified and added Issue #${issueNumber} (${titleOriginal}${ppsa ? `, ${ppsa}` : ', PPSA pending'}, ${compression.toUpperCase()} ${result}). Generated after maintainer approval; published once the PR is merged.`,
  related_source_ids: [sourceId],
});

// ---- 6. Persist data, then refresh every README figure --------------------
writeJson('data/games.json', gamesDoc);
writeJson('data/tests.json', testsDoc);
writeJson('data/updates.json', updatesDoc);

const sourcesDoc = readJson('data/sources.json');
const stats = computeStats({ games: gamesDoc.games, tests: testsDoc.tests, sources: sourcesDoc });

// The snapshot block is maintained by the official script.
execFileSync(process.execPath, ['scripts/generate-stats.mjs', '--write'], { cwd: ROOT, stdio: 'inherit' });

function syncReadme(md, s) {
  const values = {
    '原始记录合计': s.source_records_total,
    '通过表原始记录': s.source_pass_records,
    '问题表原始记录': s.source_problem_records,
    '独立游戏': s.distinct_games,
    '独立测试报告': s.test_reports_total,
    '正式 SKU / 不同 PPSA': s.confirmed_skus,
    '未确认候选 SKU': s.candidate_skus,
    '不同测试者': s.distinct_testers,
    'ZSTD 测试报告': s.zstd_reports,
    'LZ4 测试报告': s.lz4_reports,
    '格式未注明报告': s.unknown_compression_reports,
    '单条结果：通过 / 失败 / 部分 / 无法判断': `${s.pass_reports} / ${s.fail_reports} / ${s.partial_reports} / ${s.unknown_reports}`,
    '聚合状态：通过 / 失败 / 冲突 / 待确认': `${s.status_passed_games} / ${s.status_failed_games} / ${s.status_conflict_games} / ${s.status_needs_confirmation_games}`,
    '冲突': `${s.conflict_groups} 组（${s.conflict_games} 款游戏）`,
    '跨格式分歧提示': `${s.cross_format_caution_reports} 条（${s.cross_format_caution_games} 款游戏）`,
    '缺少 PPSA 的报告': s.reports_missing_ppsa,
    '社区报告 / 单一来源': `${s.community_reports} / ${s.single_source_reports}`,
    '维护者独立复现': s.maintainer_reproductions,
    '有测试日期 / 证据链接的报告': `${s.reports_with_test_date} / ${s.reports_with_evidence}`,
  };
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|(.*)$/);
    if (!m) continue;
    const label = m[1].replace(/\*\*/g, '').trim();
    if (!(label in values)) continue;
    const bold = m[2].trim().startsWith('**');
    const value = bold ? `**${values[label]}**` : values[label];
    lines[i] = `| ${m[1].trim()} | ${value} |${m[3]}`;
  }
  let out = lines.join('\n');
  out = out.replace(
    /数据分成 \*\*\d+ 条原始记录 → \d+ 款独立游戏 → \d+ 条独立测试报告\*\* 三层/,
    `数据分成 **${s.source_records_total} 条原始记录 → ${s.distinct_games} 款独立游戏 → ${s.test_reports_total} 条独立测试报告** 三层`,
  );
  out = out.replace(/\*\*\d+ verbatim source rows\*\*/, `**${s.source_records_total} verbatim source rows**`);
  out = out.replace(/\*\*\d+ distinct games\*\*/, `**${s.distinct_games} distinct games**`);
  out = out.replace(/\*\*\d+ independent test reports\*\*/, `**${s.test_reports_total} independent test reports**`);
  const keyFigures = `**Key figures:** ${s.source_records_total} original rows (${s.source_pass_records} pass + ${s.source_problem_records} problem), ${s.distinct_games} games, ${s.test_reports_total} reports (${s.zstd_reports} ZSTD / ${s.lz4_reports} LZ4 / ${s.unknown_compression_reports} format-unstated), ${s.confirmed_skus} confirmed SKUs + ${s.candidate_skus} unconfirmed candidates, ${s.distinct_testers} testers, ${s.status_passed_games} passed / ${s.status_failed_games} failed / ${s.status_conflict_games} conflict / ${s.status_needs_confirmation_games} needs-confirmation games, **${s.maintainer_reproductions} maintainer reproductions**, ${s.reports_with_test_date} reports with a test date stated in their Issue form, ${s.reports_with_evidence} evidence link(s) (none invented).`;
  out = out.replace(/^\*\*Key figures:\*\*.*$/m, keyFigures);
  return out;
}
const readmeBefore = readText('README.md');
const readmeAfter = syncReadme(readmeBefore, stats);
if (readmeAfter !== readmeBefore) writeText('README.md', readmeAfter);

// ---- 7. CHANGELOG entry ---------------------------------------------------
const changelogBefore = readText('CHANGELOG.md');
const entry = `### Added — 收录 1 条社区测试报告（Issue #${issueNumber}）

- \`data/tests.json\` 新增 \`${testId}\`（${titleOriginal}，${ppsa || 'PPSA 待确认'}，${region}，${compression.toUpperCase()} \`${result}\`，测试者 ${testerRaw}${testedAt ? `，测试日期 ${testedAt}` : ''}）。
- ${createdGame ? `\`data/games.json\` 新增游戏 \`${game.id}\`；` : `\`data/games.json\` 复用已有游戏 \`${game.id}\`；`}\`data/updates.json\`、\`README.md\` 统计同步更新。
- 由维护者审核触发的 issue-to-pr 工作流自动生成；95 条逐字存档未改动。（涉及：\`${sourceId}\`；来源：Issue #${issueNumber}）

`;
if (!changelogBefore.includes(`（Issue #${issueNumber}）`)) {
  writeText('CHANGELOG.md', changelogBefore.replace('## [Unreleased]\n\n', `## [Unreleased]\n\n${entry}`));
}

// ---- 8. Summary -----------------------------------------------------------
console.log('\nIssue imported into the working tree:');
console.log(`  Issue       #${issueNumber} ${issueTitle}`);
console.log(`  source id   ${sourceId}`);
console.log(`  test report ${testId} (${compression} / ${result})`);
console.log(`  game        ${game.id}${createdGame ? ' (new)' : ' (reused)'}`);
console.log(`  stats       ${stats.distinct_games} games / ${stats.test_reports_total} reports / ${stats.zstd_reports} ZSTD`);
setOutput('test_id', testId);
setOutput('game_id', game.id);
setOutput('source_id', sourceId);
