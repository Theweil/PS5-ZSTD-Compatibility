/**
 * Search / filter / sort. Statuses are recomputed from the CURRENT query's
 * reports, so "passed" always means "passed among the reports matching this
 * query" — never a stale, globally cached verdict.
 */
import { aggregate, normalise, STATUS } from './data.js';

const STATUS_ORDER = {
  [STATUS.CONFLICT]: 0,
  [STATUS.NEEDS_CONFIRMATION]: 1,
  [STATUS.FAILED]: 2,
  [STATUS.PASSED]: 3,
};

export function collectFilterOptions(index) {
  const regions = new Set();
  const testers = new Set();
  for (const row of index.rows) {
    for (const r of row.regions) regions.add(r);
    for (const t of row.testers) testers.add(t);
  }
  return {
    regions: [...regions].sort(),
    testers: [...testers].sort((a, b) => a.localeCompare(b)),
  };
}

function ppsaMatches(row, query) {
  if (!query) return true;
  const q = normalise(query).replace(/^ppsa/, '').replace(/[^0-9a-z]/g, '');
  if (!q) return true;
  const values = [
    ...(row.game.skus || []).map((s) => s.ppsa),
    ...(row.game.candidate_skus || []).map((s) => s.ppsa),
  ].filter(Boolean).map((p) => normalise(p).replace(/^ppsa/, ''));
  return values.some((p) => p.includes(q));
}

export function filterRows(index, state) {
  const q = normalise(state.q);
  const hasCompression = Boolean(state.compression);
  const hasTester = Boolean(state.tester);
  const hasRegion = Boolean(state.region);
  const recompute = hasCompression || hasTester;

  const out = [];
  for (const row of index.rows) {
    if (q && !row.search.includes(q)) continue;
    if (!ppsaMatches(row, state.ppsa)) continue;
    if (hasRegion && !row.regions.includes(state.region)) continue;

    let visibleTests = row.tests;
    if (hasCompression) {
      visibleTests = visibleTests.filter((t) => t.compression === state.compression);
    }
    if (hasTester) {
      visibleTests = visibleTests.filter((t) => (t.tester || []).includes(state.tester));
    }
    if (visibleTests.length === 0) continue;

    const status = recompute
      ? (aggregate(visibleTests).statusByGame.get(row.game.id) || STATUS.NEEDS_CONFIRMATION)
      : row.status;
    if (state.status && status !== state.status) continue;

    out.push({ ...row, _status: status, _tests: visibleTests });
  }

  const titleOf = (r) => normalise(r.game.title_en || r.game.title_zh || r.game.title_original || r.game.id);
  const ppsaOf = (r) => (r.game.skus?.[0]?.ppsa || 'ZZZZZ');
  switch (state.sort) {
    case 'status':
      out.sort((a, b) => (STATUS_ORDER[a._status] ?? 9) - (STATUS_ORDER[b._status] ?? 9)
        || titleOf(a).localeCompare(titleOf(b)));
      break;
    case 'reports':
      out.sort((a, b) => b._tests.length - a._tests.length || titleOf(a).localeCompare(titleOf(b)));
      break;
    case 'ppsa':
      out.sort((a, b) => ppsaOf(a).localeCompare(ppsaOf(b)));
      break;
    default:
      out.sort((a, b) => titleOf(a).localeCompare(titleOf(b), 'en'));
  }
  return out;
}

export function readState(form) {
  return {
    q: form.querySelector('#q').value,
    ppsa: form.querySelector('#ppsa-q').value,
    status: form.querySelector('#f-status').value,
    compression: form.querySelector('#f-compression').value,
    region: form.querySelector('#f-region').value,
    tester: form.querySelector('#f-tester').value,
    sort: form.querySelector('#f-sort').value,
  };
}

export function activeFilterCount(state) {
  return ['q', 'ppsa', 'status', 'compression', 'region', 'tester']
    .filter((k) => Boolean(state[k])).length;
}
