#!/usr/bin/env node
/**
 * Derive every published statistic from data/*.json (never hardcoded).
 *
 *   node scripts/generate-stats.mjs            print stats as JSON + table
 *   node scripts/generate-stats.mjs --check   verify README snapshot is current
 *   node scripts/generate-stats.mjs --write   refresh README snapshot
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeStats } from '../site/assets/js/data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const stats = computeStats({
  games: read('data/games.json').games,
  tests: read('data/tests.json').tests,
  sources: read('data/sources.json'),
});

const README = path.join(ROOT, 'README.md');
const MARKER = /<!-- STATS-SNAPSHOT\s*([\s\S]*?)STATS-SNAPSHOT -->/;
const snapshotText = JSON.stringify(stats, null, 2);

if (process.argv.includes('--write')) {
  const md = fs.readFileSync(README, 'utf8');
  const block = `<!-- STATS-SNAPSHOT\n${snapshotText}\nSTATS-SNAPSHOT -->`;
  const next = MARKER.test(md) ? md.replace(MARKER, block) : `${md.trimEnd()}\n\n${block}\n`;
  fs.writeFileSync(README, next, 'utf8');
  console.log('README.md STATS-SNAPSHOT updated.');
  process.exit(0);
}

if (process.argv.includes('--check')) {
  const md = fs.readFileSync(README, 'utf8');
  const m = md.match(MARKER);
  if (!m) {
    console.error('README.md is missing the STATS-SNAPSHOT block. Run: npm run stats -- --write');
    process.exit(1);
  }
  let stored;
  try { stored = JSON.parse(m[1]); }
  catch (e) { console.error('README STATS-SNAPSHOT is not valid JSON: ' + e.message); process.exit(1); }
  const diffs = Object.keys(stats).filter((k) => JSON.stringify(stored[k]) !== JSON.stringify(stats[k]));
  if (diffs.length) {
    console.error('README statistics are out of sync with data/*.json:');
    for (const k of diffs) console.error(`  ${k}: README=${JSON.stringify(stored[k])} data=${JSON.stringify(stats[k])}`);
    console.error('Run: npm run stats -- --write');
    process.exit(1);
  }
  console.log(`README statistics match data/*.json (${Object.keys(stats).length} figures checked).`);
  process.exit(0);
}

console.log(JSON.stringify(stats, null, 2));
console.log('\nHuman-readable summary:');
const rows = [
  ['原始记录合计 / Original rows', stats.source_records_total],
  ['通过表 / Pass-table rows', stats.source_pass_records],
  ['问题表 / Problem-table rows', stats.source_problem_records],
  ['独立游戏 / Distinct games', stats.distinct_games],
  ['独立测试报告 / Test reports', stats.test_reports_total],
  ['ZSTD 报告 / ZSTD reports', stats.zstd_reports],
  ['LZ4 报告 / LZ4 reports', stats.lz4_reports],
  ['格式未注明报告 / Unknown-format reports', stats.unknown_compression_reports],
  ['冲突游戏 / Conflict games', stats.status_conflict_games],
  ['待确认游戏 / Needs-confirmation games', stats.status_needs_confirmation_games],
  ['跨格式分歧提示 / Cross-format cautions', stats.cross_format_caution_reports],
  ['维护者复现 / Maintainer reproductions', stats.maintainer_reproductions],
];
for (const [k, v] of rows) console.log(`  ${k.padEnd(48)} ${v}`);
