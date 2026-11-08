/** Game detail drawer: every independent report is shown separately. */
import { RESULT, STATUS } from './data.js';

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

const RESULT_LABEL = { pass: 'resultPass', fail: 'resultFail', partial: 'resultPartial', unknown: 'resultUnknown' };
const STATUS_LABEL = {
  passed: 'statusPassed', failed: 'statusFailed',
  conflict: 'statusConflict', needs_confirmation: 'statusNeeds',
};

function na(value, t) {
  if (value === null || value === undefined || value === '' || value === '—') {
    return `<span class="na">${esc(t('notProvided'))}</span>`;
  }
  return esc(value);
}

function badge(status, t) {
  return `<span class="badge ${esc(status)}">${esc(t(STATUS_LABEL[status] || 'resultUnknown'))}</span>`;
}

function chip(text, cls = '') {
  return `<span class="chip ${cls}">${esc(text)}</span>`;
}

function kv(label, value, t) {
  return `<div class="kv"><dt>${esc(label)}</dt><dd>${na(value, t)}</dd></div>`;
}

function regionLabel(code, t) {
  return t('region_' + code) || code;
}

export function renderDetail(row, { t, lang }) {
  const g = row.game;
  const L = (zh, en) => (lang === 'en' ? en : zh);
  const tests = row._tests || row.tests;
  const html = [];

  // ---- conflict / caution / identification banners ----
  if (row.conflicts && row.conflicts.length) {
    html.push(`<div class="callout conflict">
      <strong>⚠ ${esc(L('存在相互矛盾的测试报告', 'Conflicting test reports'))}</strong>
      ${esc(L('以下报告指向同一游戏、同一 SKU 与同一压缩格式，但结论相反。两条报告都保留，不做覆盖。',
               'The reports below share the same game, SKU and compression format but disagree. Both are retained.'))}
      <ul>${row.conflicts.map((c) => `<li>
        ${esc(c.compression.toUpperCase())} · ${esc(c.ppsa || L('PPSA 待确认', 'PPSA pending'))}
        → ${esc(L('成功报告', 'pass'))}: <span class="source-link">${esc(c.pass_report_ids.join(', ') || '—')}</span>
        / ${esc(L('失败报告', 'fail'))}: <span class="source-link">${esc(c.fail_report_ids.join(', ') || '—')}</span>
        <br><small>${esc(c.basis === 'scope_inferred'
          ? (lang === 'en' ? c.note_en : c.note_zh)
          : (lang === 'en' ? c.note_en : c.note_zh))}</small>
      </li>`).join('')}</ul>
    </div>`);
  }
  if (row.cautions && row.cautions.length) {
    html.push(`<div class="callout caution">
      <strong>◈ ${esc(L('跨格式 / 格式未明的结果分歧', 'Cross-format / unknown-format disagreement'))}</strong>
      ${esc(row.cautions[0][lang === 'en' ? 'note_en' : 'note_zh'])}
      <ul>${row.cautions.map((c) => `<li><span class="source-link">${esc(c.report_id)}</span> · ${esc(c.ppsa || L('PPSA 待确认', 'PPSA pending'))}</li>`).join('')}</ul>
    </div>`);
  }
  if (g.game_identification === 'unidentified' || g.game_identification === 'uncertain') {
    html.push(`<div class="callout info">
      <strong>${esc(L('游戏识别状态：', 'Game identification: ') + (g.game_identification === 'unidentified' ? L('无法识别', 'unidentified') : L('存疑', 'uncertain')))}</strong>
      ${esc(g.notes || L('原始资料无法确认所测实体，本项目不擅自猜测或替换名称。', 'The original data does not confirm the tested title; no name is guessed or substituted.'))}
    </div>`);
  }

  // ---- basic info ----
  html.push(`<section class="detail-block"><h3>${esc(L('基础信息', 'Basic information'))}</h3>
    <dl class="kv-grid">
      ${kv(L('中文名称', 'Chinese title'), g.title_zh, t)}
      ${kv(L('英文名称', 'English title'), g.title_en, t)}
      ${kv(L('原始名称（逐字）', 'Original title (verbatim)'), g.title_original, t)}
      ${kv(L('游戏 ID', 'Game ID'), g.id, t)}
      ${kv(L('平台', 'Platform'), g.platform, t)}
      ${kv(L('聚合状态（当前查询）', 'Aggregated status (current query)'), t(STATUS_LABEL[row._status || row.status] || 'resultUnknown'), t)}
      ${kv(L('别名', 'Aliases'), (g.aliases || []).length ? g.aliases.join(' / ') : null, t)}
      ${kv(L('维护者备注', 'Maintainer notes'), g.notes, t)}
    </dl></section>`);

  // ---- SKUs ----
  const skuRows = (g.skus || []).map((s) => `<tr>
    <td data-label="${esc(L('PPSA', 'PPSA'))}"><span class="chip mono">${esc(s.ppsa || '—')}</span></td>
    <td data-label="${esc(L('地区', 'Region'))}">${(s.regions || []).map((r) => esc(regionLabel(r, t))).join(' / ') || esc(t('region_UNKNOWN'))}</td>
    <td data-label="${esc(L('置信度', 'Confidence'))}">${esc(L('正式 SKU', 'Confirmed SKU'))}</td>
    <td data-label="${esc(L('来源', 'Source'))}"><span class="source-link">${esc((s.source_record_ids || []).join(', '))}</span></td>
  </tr>`).join('');
  const candRows = (g.candidate_skus || []).map((c) => `<tr>
    <td data-label="${esc(L('PPSA', 'PPSA'))}"><span class="chip mono candidate">${esc(c.ppsa || L('非 PPSA 代码', 'non-PPSA code'))}</span></td>
    <td data-label="${esc(L('地区', 'Region'))}">${esc(c.region ? regionLabel(c.region, t) : t('region_UNKNOWN'))}</td>
    <td data-label="${esc(L('置信度', 'Confidence'))}">${esc(L('未确认候选（不得并入正式 SKU）', 'Unconfirmed candidate (never promoted)'))}</td>
    <td data-label="${esc(L('来源', 'Source'))}"><span class="source-link">${esc((c.source_record_ids || []).join(', '))}</span> — ${esc(c.raw)}</td>
  </tr>`).join('');
  html.push(`<section class="detail-block"><h3>${esc(L('地区 SKU', 'Regional SKUs'))}
    <span class="count">${esc(L('正式 ', 'confirmed '))}${(g.skus || []).length} · ${esc(L('候选 ', 'candidates '))}${(g.candidate_skus || []).length}</span></h3>
    ${(skuRows || candRows) ? `<table class="sku-table"><thead><tr>
      <th>${esc(L('PPSA', 'PPSA'))}</th><th>${esc(L('地区', 'Region'))}</th><th>${esc(L('置信度', 'Confidence'))}</th><th>${esc(L('来源 / 原文', 'Source / raw'))}</th>
    </tr></thead><tbody>${skuRows}${candRows}</tbody></table>`
      : `<div class="callout info">${esc(L('原始资料未提供 PPSA，显示为「待确认」。', 'No PPSA was provided in the original data; shown as pending.'))}</div>`}
    <div class="callout info" style="margin-top:10px">${esc(L('候选编号只出现在原始备注中，未经核实，不作为正式 SKU。', 'Candidate numbers appear only in original notes; they are unverified and never treated as confirmed SKUs.'))}</div>
  </section>`);

  // ---- independent test reports ----
  html.push(`<section class="detail-block"><h3>${esc(L('独立测试报告', 'Independent test reports'))}
    <span class="count">${tests.length} ${esc(L('条', 'reports'))}</span></h3>`);
  for (const test of tests) {
    const compCls = test.compression === 'zstd' ? 'zstd' : test.compression === 'lz4' ? 'lz4' : 'unknown';
    const compText = test.compression === 'unknown' ? t('compressionUnknown') : test.compression.toUpperCase();
    const resultCls = test.result === RESULT.PASS ? 'passed' : test.result === RESULT.FAIL ? 'failed' : 'needs_confirmation';
    const env = [
      [L('PPSA', 'PPSA'), test.ppsa],
      [L('地区', 'Region'), (test.regions || []).map((r) => regionLabel(r, t)).join(' / ') || null],
      [L('游戏版本', 'Game version'), test.game_version],
      [L('PS5 固件', 'PS5 firmware'), test.ps5_firmware],
      [L('转换工具', 'Converter'), test.converter],
      [L('运行库版本', 'Runtime version'), test.runtime_version],
      [L('挂载工具', 'Mount tool'), test.mount_tool],
      [L('测试日期', 'Test date'), test.tested_at],
      [L('验证级别', 'Verification'), t('verify_' + test.verification) || test.verification],
      [L('症状', 'Symptom'), test.symptom],
    ];
    html.push(`<article class="test-card">
      <div class="test-head">
        <span class="test-id">${esc(test.id)}</span>
        <span class="badge ${resultCls}">${esc(t(RESULT_LABEL[test.result]))}</span>
        ${chip(compText, compCls)}
        ${(test.tester || []).map((x) => chip('👤 ' + x)).join('')}
        <span class="spacer"></span>
        <a class="source-link" href="https://github.com/Theweil/PS5-ZSTD-Compatibility/blob/main/docs/source-data-original.md" target="_blank" rel="noopener noreferrer">${esc(test.source_record_ids.join(', '))} ↗</a>
      </div>
      <div class="test-env">${env.map(([k, v]) => `<div><b>${esc(k)}：</b>${na(v, t)}</div>`).join('')}</div>
      <div class="gc-chips">${chip(L('原始格式列：', 'Raw format column: ') + (test.compression_raw === null ? L('无（问题表没有该列）', 'none (no such column)') : test.compression_raw), 'mono')}
        ${chip(L('来源：', 'Source: ') + (test.source_table === 'pass' ? L('通过表', 'pass table') : L('问题表', 'problem table')) + ' #' + test.source_row, 'mono')}
        ${test.derivation ? chip(test.derivation, 'candidate') : ''}</div>
      ${test.notes ? `<div class="test-notes"><b>${esc(L('原始备注：', 'Original notes: '))}</b>${esc(test.notes)}</div>` : ''}
      ${test.result_note ? `<div class="callout info">${esc(test.result_note)}</div>` : ''}
      ${test.compression_note ? `<div class="callout info">${esc(test.compression_note)}</div>` : ''}
      ${(test.history || []).length ? `<div><b style="font-size:11px;color:var(--faint)">${esc(L('历史记录 / 备注中的先前状态：', 'History / prior states mentioned in notes:'))}</b>
        <ul class="history-list">${test.history.map((h) => `<li>${esc(h.kind)} — ${esc(h.description)}${h.result ? ` (${esc(h.result)})` : ''}</li>`).join('')}</ul></div>` : ''}
      ${(test.evidence || []).length ? `<ul class="history-list">${test.evidence.map((e) => `<li><a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.label)} ↗</a></li>`).join('')}</ul>` : ''}
    </article>`);
  }
  html.push(`</section>`);

  // ---- related / source ----
  const issueQuery = encodeURIComponent(g.title_en || g.title_original || g.id);
  html.push(`<section class="detail-block"><h3>${esc(L('相关问题与原始数据', 'Related issues & raw data'))}</h3>
    <div class="gc-chips">
      <a class="chip" href="https://github.com/Theweil/PS5-ZSTD-Compatibility/issues?q=${issueQuery}" target="_blank" rel="noopener noreferrer">${esc(L('搜索相关 Issue ↗', 'Search related issues ↗'))}</a>
      <a class="chip" href="https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/new?template=report-problem.yml" target="_blank" rel="noopener noreferrer">${esc(L('报告问题 ↗', 'Report a problem ↗'))}</a>
      <a class="chip" href="data/tests.json" target="_blank" rel="noopener noreferrer">tests.json ↗</a>
      <a class="chip" href="data/sources.json" target="_blank" rel="noopener noreferrer">sources.json ↗</a>
    </div>
    <div class="callout info" style="margin-top:10px">${esc(L('所有数值均为原始资料的转录。未提供 = 原始资料没有该字段，而不是「没有问题」。社区报告不等于维护者独立复现。',
      'All values are transcriptions of the source data. "Not provided" means the field was absent, not "no problem". A community report is not a maintainer reproduction.'))}</div>
  </section>`);

  return html.join('');
}
