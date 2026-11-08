#!/usr/bin/env node
/**
 * Data validation for PS5 ZSTD Compatibility Database.
 *
 * Runs offline (only devDependency: ajv). Exits non-zero with a readable list
 * of errors on ANY failure so GitHub Actions fails loudly.
 *
 * Checks:
 *   1. JSON syntax                     6. game_id references
 *   2. JSON Schema (draft-07)          7. compression enum + source consistency
 *   3. duplicate game ids             8. test result enum + source consistency
 *   4. duplicate test ids             9. 95 original record coverage
 *   5. PPSA format + traceability     10. conflict / fidelity protection
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { aggregate } from '../site/assets/js/data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warns = [];
const fail = (msg) => errors.push(msg);
const ok = (msg) => console.log('  \u2713 ' + msg);

function readJson(rel) {
  const abs = path.join(ROOT, rel);
  try {
    return { value: JSON.parse(fs.readFileSync(abs, 'utf8')), rel };
  } catch (e) {
    fail(`${rel}: JSON syntax error: ${e.message}`);
    return { value: null, rel };
  }
}

const files = {
  games: readJson('data/games.json'),
  tests: readJson('data/tests.json'),
  sources: readJson('data/sources.json'),
  regions: readJson('data/regions.json'),
  updates: readJson('data/updates.json'),
};
const gamesDoc = files.games.value;
const testsDoc = files.tests.value;
const sourcesDoc = files.sources.value;

console.log('PS5 ZSTD Compatibility Database — data validation\n');

// ---- 1. JSON syntax (already reported in readJson) ----
if (errors.length === 0) ok(`JSON syntax: all ${Object.keys(files).length} data files parse`);

// ---- 2. JSON Schema ----
const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: true });
const schemaMap = [
  ['data/games.json', 'schema/game.schema.json'],
  ['data/tests.json', 'schema/test.schema.json'],
  ['data/sources.json', 'schema/source.schema.json'],
  ['data/regions.json', 'schema/regions.schema.json'],
  ['data/updates.json', 'schema/updates.schema.json'],
];
for (const [dataRel, schemaRel] of schemaMap) {
  const data = readJson(dataRel).value;
  const schema = readJson(schemaRel).value;
  if (!data || !schema) continue;
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (e) {
    fail(`${schemaRel}: invalid schema: ${e.message}`);
    continue;
  }
  if (!validate(data)) {
    for (const e of validate.errors.slice(0, 12)) {
      fail(`${dataRel}: schema ${e.instancePath || '/'} ${e.message} ${JSON.stringify(e.params)}`);
    }
    if (validate.errors.length > 12) fail(`${dataRel}: ...and ${validate.errors.length - 12} more schema errors`);
  }
}
if (!errors.length) ok(`JSON Schema: ${schemaMap.length} documents valid against their schemas`);

if (!gamesDoc || !testsDoc || !sourcesDoc) {
  console.error('\nCannot continue: required documents failed to load.\n');
  for (const e of errors) console.error('  \u2717 ' + e);
  process.exit(1);
}

const games = gamesDoc.games;
const tests = testsDoc.tests;
const records = sourcesDoc.records;
const bySourceId = new Map(records.map((r) => [r.source_record_id, r]));
const gamesById = new Map(games.map((g) => [g.id, g]));

// ---- 3. duplicate game ids ----
const seenGames = new Set();
for (const g of games) {
  if (seenGames.has(g.id)) fail(`duplicate game id: ${g.id}`);
  seenGames.add(g.id);
}
ok(`game ids unique: ${games.length} distinct games`);

// ---- 4. duplicate test ids ----
const seenTests = new Set();
for (const t of tests) {
  if (seenTests.has(t.id)) fail(`duplicate test id: ${t.id}`);
  seenTests.add(t.id);
}
ok(`test ids unique: ${tests.length} independent reports`);

// ---- 5. PPSA format + traceability ----
const PPSA_RE = /^PPSA[0-9]{5}$/;
for (const g of games) {
  for (const s of g.skus || []) {
    if (!PPSA_RE.test(s.ppsa)) fail(`${g.id}: bad SKU PPSA "${s.ppsa}"`);
    if (s.confidence !== 'confirmed') fail(`${g.id}: confirmed skus[] must have confidence=confirmed (${s.ppsa})`);
  }
  for (const c of g.candidate_skus || []) {
    if (c.ppsa !== null && !PPSA_RE.test(c.ppsa)) fail(`${g.id}: bad candidate PPSA "${c.ppsa}"`);
    if (c.confidence !== 'unconfirmed') fail(`${g.id}: candidate SKU must be unconfirmed (${c.raw})`);
  }
}
for (const t of tests) {
  if (t.ppsa !== null && !PPSA_RE.test(t.ppsa)) fail(`${t.id}: bad PPSA "${t.ppsa}"`);
  for (const p of t.ppsa_all || []) if (!PPSA_RE.test(p)) fail(`${t.id}: bad ppsa_all entry "${p}"`);
}
// Every original PPSA token in the PPSA column must be traceable to a game SKU.
for (const r of records) {
  const tokens = [...r.raw.ppsa.matchAll(/(?:PPSA)?([0-9]{5})/g)].map((m) => 'PPSA' + m[1]);
  for (const tok of tokens) {
    const owner = games.find((g) => (g.source_record_ids || []).includes(r.source_record_id)
      && (g.skus || []).some((s) => s.ppsa === tok));
    if (!owner) fail(`${r.source_record_id}: original PPSA ${tok} is not traceable to any game SKU`);
  }
}
if (!errors.length) ok('PPSA format + original PPSA traceability verified');

// ---- 6. game_id references ----
for (const t of tests) {
  if (!gamesById.has(t.game_id)) fail(`${t.id}: invalid game_id reference "${t.game_id}"`);
  for (const sid of t.source_record_ids) {
    if (!bySourceId.has(sid)) fail(`${t.id}: invalid source_record_id reference "${sid}"`);
  }
}
ok('test -> game / source references valid');

// ---- 7/8. enums + source fidelity ----
const ALLOWED_COMP = new Set(['zstd', 'lz4', 'unknown']);
const ALLOWED_RESULT = new Set(['pass', 'fail', 'partial', 'unknown']);
const SYMPTOM_RESULT = {
  '卡 logo': 'fail', '黑屏': 'fail', '运行失败': 'fail',
  '无法运行': 'fail', 'signal 11 出错': 'fail', '待确认': 'unknown',
};
for (const t of tests) {
  if (!ALLOWED_COMP.has(t.compression)) fail(`${t.id}: invalid compression "${t.compression}"`);
  if (!ALLOWED_RESULT.has(t.result)) fail(`${t.id}: invalid result "${t.result}"`);
  const src = bySourceId.get(t.source_record_ids[0]);
  if (!src) continue;
  // Verbatim fidelity: the four/five raw columns must survive unchanged.
  if (t.notes !== src.raw.notes) fail(`${t.id} (${src.source_record_id}): original notes were altered`);
  if (t.tester_raw !== src.raw.tester) fail(`${t.id} (${src.source_record_id}): original tester string was altered`);
  if (t.game_title_raw !== src.raw.game) fail(`${t.id} (${src.source_record_id}): original game title was altered`);
  if (t.ppsa_raw !== src.raw.ppsa) fail(`${t.id} (${src.source_record_id}): original PPSA string was altered`);
  if (!t.tester.every((x) => src.raw.tester.split('/').map((s) => s.trim()).includes(x))) {
    fail(`${t.id} (${src.source_record_id}): tester list does not match original tester string`);
  }
  if (t.source_table === 'problem') {
    if (t.compression !== 'unknown') fail(`${t.id}: problem-table rows must keep compression=unknown`);
    if (t.compression_scope !== 'zstd_issue_scope') fail(`${t.id}: problem-table rows must carry zstd_issue_scope`);
    if (t.result !== SYMPTOM_RESULT[t.symptom]) fail(`${t.id}: result does not match original symptom "${t.symptom}"`);
    if (t.compression_raw !== null && t.compression_raw !== undefined) {
      fail(`${t.id}: problem table has no compression column; compression_raw must be null`);
    }
  } else {
    const raw = src.raw.compression.toLowerCase();
    if (raw.includes('lz4') && raw.includes('zstd')) {
      // P-044: multi-format source rows must be split; handled by check 10.
    } else if (raw.includes('lz4')) {
      if (t.compression !== 'lz4') fail(`${t.id}: compression does not match original LZ4 column`);
    } else if (raw.includes('zstd')) {
      if (t.compression !== 'zstd') fail(`${t.id}: compression does not match original zstd column`);
    }
  }
  if (t.tested_at !== null) {
    fail(`${t.id}: original data provides no test dates; tested_at must be null (no invented dates)`);
  }
  if (t.verification === 'maintainer_reproduced') {
    fail(`${t.id}: a community source row cannot be labelled as a maintainer reproduction`);
  }
}
ok('compression / result enums and verbatim source fidelity verified');

// ---- 9. original record coverage ----
const expected = [];
for (let i = 1; i <= 85; i++) expected.push('P-' + String(i).padStart(3, '0'));
for (let i = 1; i <= 10; i++) expected.push('F-' + String(i).padStart(3, '0'));
for (const id of expected) if (!bySourceId.has(id)) fail(`missing original record id: ${id}`);
for (const r of records) if (!expected.includes(r.source_record_id)) fail(`unexpected source id: ${r.source_record_id}`);
if (records.length !== 95) fail(`expected exactly 95 original records, got ${records.length}`);
if (records.filter((r) => r.source_table === 'pass').length !== 85) fail('pass table count != 85');
if (records.filter((r) => r.source_table === 'problem').length !== 10) fail('problem table count != 10');
const sourceCounts = new Map();
for (const r of records) sourceCounts.set(r.source_record_id, (sourceCounts.get(r.source_record_id) || 0) + 1);
for (const [id, n] of sourceCounts) if (n !== 1) fail(`duplicate source record id: ${id}`);
const covered = new Set(tests.flatMap((t) => t.source_record_ids));
for (const id of expected) if (!covered.has(id)) fail(`original record ${id} is not represented by any test report (silent data loss)`);
// Verbatim archive check: sources.json must reproduce the markdown exactly.
const md = fs.readFileSync(path.join(ROOT, 'docs/source-data-original.md'), 'utf8');
const blocks = [...md.matchAll(/```text\n([\s\S]*?)\n```/g)].map((m) => m[1].split('\n').filter((l) => l.trim()));
if (blocks.length !== 2) fail('docs/source-data-original.md must contain exactly 2 verbatim text blocks');
else {
  const mdLines = [...blocks[0], ...blocks[1]];
  if (mdLines.length !== 95) fail(`verbatim archive has ${mdLines.length} lines, expected 95`);
  for (let i = 0; i < Math.min(mdLines.length, records.length); i++) {
    if (mdLines[i] !== records[i].raw_line) {
      fail(`source archive line ${i + 1} differs from docs/source-data-original.md`);
    }
    const parts = mdLines[i].split('|');
    if (parts.length !== 6) fail(`archive line ${i + 1} must have 6 pipe-separated fields`);
  }
  // raw.* must be a faithful split of raw_line
  for (const r of records) {
    const p = r.raw_line.split('|');
    const expectedRaw = r.source_table === 'pass'
      ? { game: p[1], ppsa: p[2], compression: p[3], tester: p[4], notes: p[5] }
      : { game: p[1], ppsa: p[2], symptom: p[3], tester: p[4], notes: p[5] };
    for (const [k, v] of Object.entries(expectedRaw)) {
      if (r.raw[k] !== v) fail(`${r.source_record_id}: raw.${k} does not match raw_line`);
    }
  }
}
ok('95 original records (P-001..P-085 / F-001..F-010) fully covered and verbatim');

// ---- 10. conflict / fidelity protection ----
const testsOf = (gid) => tests.filter((t) => t.game_id === gid);
const srcOf = (id) => tests.filter((t) => t.source_record_ids.includes(id));
const game = (gid) => gamesById.get(gid);

function expect(cond, msg) { if (!cond) fail(msg); }

// P-034 / F-002: opposite results retained, aggregated as conflict.
const yotei = testsOf('ghost-of-yotei');
expect(yotei.some((t) => t.source_record_ids.includes('P-034') && t.result === 'pass'), 'P-034 pass report lost');
expect(yotei.some((t) => t.source_record_ids.includes('F-002') && t.result === 'fail'), 'F-002 fail report lost');
expect(aggregate(yotei).statusByGame.get('ghost-of-yotei') === 'conflict', 'P-034/F-002 must aggregate to conflict');

// P-054 / F-001: LZ4 pass vs unknown-compression problem report, never merged.
const astro = testsOf('astro-bot');
expect(astro.some((t) => t.source_record_ids.includes('P-054') && t.compression === 'lz4' && t.result === 'pass'), 'P-054 LZ4 pass report lost');
expect(astro.some((t) => t.source_record_ids.includes('F-001') && t.compression === 'unknown' && t.result === 'fail'), 'F-001 problem report lost');
expect(!astro.some((t) => t.source_record_ids.includes('F-001') && t.compression === 'lz4'), 'F-001 was wrongly merged into the LZ4 group');
expect(!aggregate(astro).conflicts.some((c) => c.compression === 'lz4'), 'LZ4 pass must not be turned into an LZ4 conflict');

// P-044: split into ZSTD and LZ4, F-003 independent.
const wolverineSplit = srcOf('P-044');
expect(wolverineSplit.length === 2, 'P-044 must be split into exactly 2 independent reports');
expect(wolverineSplit.some((t) => t.compression === 'zstd'), 'P-044 ZSTD report missing');
expect(wolverineSplit.some((t) => t.compression === 'lz4'), 'P-044 LZ4 report missing');
expect(new Set(wolverineSplit.map((t) => t.compression)).size === 2, 'P-044 formats were merged');
expect(srcOf('F-003').length === 1 && srcOf('F-003')[0].result === 'fail', 'F-003 independent black-screen report lost');

// P-063 / F-007: pass + unknown kept together.
const tlou = testsOf('the-last-of-us-part-i');
expect(tlou.some((t) => t.source_record_ids.includes('P-063') && t.result === 'pass'), 'P-063 pass report lost');
expect(tlou.some((t) => t.source_record_ids.includes('F-007') && t.result === 'unknown'), 'F-007 pending report lost');

// P-030 unidentified.
expect(game('unidentified-p-030').title_zh === null && game('unidentified-p-030').title_en === null,
  'P-030 unidentified game must not be given a guessed name');
expect(game('unidentified-p-030').title_original.includes('未识别'), 'P-030 original title lost');

// P-025 only JP.
expect(game('doa-xtreme-venus-vacation-prism').skus.length === 1
  && game('doa-xtreme-venus-vacation-prism').skus[0].regions.includes('JP'),
  'P-025 must keep only the JP SKU (no invented HK SKU)');

// P-075 / P-080 / P-037: candidate SKUs must not be promoted.
for (const [gid, candidate, primary] of [
  ['unicorn-overlord', 'PPSA20318', 'PPSA09894'],
  ['warhammer-40000-space-marine-2', 'PPSA04452', 'PPSA04451'],
  ['re4-remake-gold', 'PPSA09418', 'PPSA07411'],
]) {
  const g = game(gid);
  expect(g.candidate_skus.some((c) => c.ppsa === candidate && c.confidence === 'unconfirmed'),
    `${gid}: candidate ${candidate} missing or not marked unconfirmed`);
  expect(!g.skus.some((s) => s.ppsa === candidate), `${gid}: candidate ${candidate} was promoted to a confirmed SKU`);
  expect(g.skus.some((s) => s.ppsa === primary), `${gid}: original primary SKU ${primary} was overwritten`);
}
expect(game('warhammer-40000-space-marine-2').skus[0].regions.includes('HK')
  && game('warhammer-40000-space-marine-2').skus[0].regions.includes('EU'),
  'P-080 HK/EU multi-region SKU lost');

// Missing PPSA rows preserved.
for (const id of ['F-004', 'F-005', 'F-006', 'F-008']) {
  const t = srcOf(id)[0];
  expect(t && t.ppsa === null && t.ppsa_status === 'missing', `${id}: missing PPSA must be preserved as null/missing`);
}
// All 10 problem rows keep unknown compression.
const problemTests = tests.filter((t) => t.source_table === 'problem');
expect(problemTests.length === 10, `expected 10 problem-table reports, got ${problemTests.length}`);
expect(problemTests.every((t) => t.compression === 'unknown'), 'problem-table compression must remain unknown');
expect(problemTests.every((t) => t.compression_scope === 'zstd_issue_scope'), 'problem-table scope flag missing');

// No duplicate game entities for repeated games.
for (const gid of ['astro-bot', 'ghost-of-yotei', 'marvels-wolverine', 'the-last-of-us-part-i']) {
  expect(games.filter((g) => g.id === gid).length === 1, `${gid} was duplicated instead of sharing one game entity`);
}
ok('conflict retention, SKU discipline and special-case migration rules verified');

// ---- summary ----
const stats = aggregate(tests);
console.log(`\nAggregation: ${stats.groups.length} game/SKU/format groups, ${stats.conflicts.length} conflict groups, ${new Set(stats.conflicts.map((c) => c.game_id)).size} games in conflict.`);
console.log(`Entities: ${games.length} games / ${tests.length} reports / ${records.length} original rows.`);

if (warns.length) for (const w of warns) console.warn('  ! ' + w);
if (errors.length) {
  console.error(`\nVALIDATION FAILED — ${errors.length} error(s):`);
  for (const e of errors) console.error('  \u2717 ' + e);
  process.exit(1);
}
console.log('\nVALIDATION PASSED — all 10 check groups succeeded.\n');
