/**
 * PS5 ZSTD Compatibility Database — shared data model / aggregation.
 *
 * This is a plain ES module with NO DOM and NO Node-only APIs, so the exact same
 * logic is used by the browser (site/assets/js/app.js) and by the CI scripts
 * (scripts/validate-data.mjs, scripts/generate-stats.mjs). Keeping one
 * implementation avoids the classic "website and README disagree" problem.
 *
 * Golden rules encoded here:
 *   - A pass report NEVER overwrites a fail report.
 *   - ZSTD and LZ4 are never mixed in one group or one statistic.
 *   - "unknown" compression is never counted as ZSTD or LZ4.
 *   - community_report is never treated as maintainer_reproduced.
 *   - An original-record count is never reported as a distinct-game count.
 */

export const RESULT = Object.freeze({
  PASS: 'pass',
  FAIL: 'fail',
  PARTIAL: 'partial',
  UNKNOWN: 'unknown',
});

export const STATUS = Object.freeze({
  PASSED: 'passed',
  FAILED: 'failed',
  CONFLICT: 'conflict',
  NEEDS_CONFIRMATION: 'needs_confirmation',
});

export const COMPRESSION = Object.freeze({
  ZSTD: 'zstd',
  LZ4: 'lz4',
  UNKNOWN: 'unknown',
});

export const REGION_CODES = Object.freeze([
  'HK', 'US', 'EU', 'JP', 'AS', 'MULTI', 'UNKNOWN',
]);

/** Normalise a search term (case + whitespace + full-width digits). */
export function normalise(value) {
  return String(value ?? '')
    .replace(/[\uFF10-\uFF19]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/\u3000/g, ' ')
    .toLowerCase()
    .trim();
}

/** All searchable strings for one game, including SKUs, aliases and testers. */
export function searchableText(game, tests) {
  const parts = [
    game.title_zh, game.title_en, game.title_original,
    ...(game.aliases || []),
    ...(game.skus || []).map((s) => s.ppsa),
    ...(game.candidate_skus || []).flatMap((s) => [s.ppsa, s.raw]),
  ];
  for (const t of tests) {
    parts.push(t.game_title_raw, t.ppsa, t.ppsa_raw, ...(t.ppsa_all || []),
      ...(t.tester || []), t.tester_raw, t.notes, t.symptom);
  }
  return normalise(parts.filter(Boolean).join(' '));
}

function groupKey(t) {
  return `${t.game_id}|${t.ppsa ?? '_'}|${t.compression}`;
}

/**
 * Aggregate an arbitrary set of test reports into groups, conflicts and
 * per-game statuses. When the UI applies filters, it passes only the filtered
 * reports, so statuses always describe "the current query", not the whole DB.
 */
export function aggregate(tests) {
  const byKey = new Map();
  const explicit = [];
  const unknownCompression = [];

  for (const t of tests) {
    if (t.compression === COMPRESSION.UNKNOWN) {
      unknownCompression.push(t);
      continue;
    }
    explicit.push(t);
    const key = groupKey(t);
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        game_id: t.game_id,
        ppsa: t.ppsa,
        compression: t.compression,
        tests: [],
      });
    }
    byKey.get(key).tests.push(t);
  }

  const groups = [...byKey.values()].map((g) => {
    const has = (r) => g.tests.some((t) => t.result === r);
    const pass = has(RESULT.PASS);
    const fail = has(RESULT.FAIL);
    const partial = has(RESULT.PARTIAL);
    let status;
    if (pass && fail) status = STATUS.CONFLICT;
    else if (pass) status = STATUS.PASSED;
    else if (fail) status = STATUS.FAILED;
    else if (partial) status = STATUS.NEEDS_CONFIRMATION;
    else status = STATUS.NEEDS_CONFIRMATION;
    return {
      ...g,
      pass_count: g.tests.filter((t) => t.result === RESULT.PASS).length,
      fail_count: g.tests.filter((t) => t.result === RESULT.FAIL).length,
      unknown_count: g.tests.filter((t) => t.result === RESULT.UNKNOWN).length,
      status,
    };
  });

  // Conflicting reports within the SAME game + SKU + compression.
  const conflicts = [];
  for (const g of groups) {
    if (g.status !== STATUS.CONFLICT) continue;
    conflicts.push({
      game_id: g.game_id,
      ppsa: g.ppsa,
      compression: g.compression,
      basis: 'explicit',
      pass_report_ids: g.tests.filter((t) => t.result === RESULT.PASS).map((t) => t.id),
      fail_report_ids: g.tests.filter((t) => t.result === RESULT.FAIL).map((t) => t.id),
      note_zh: '同一游戏、同一 SKU、同一压缩格式存在成功与失败报告。',
      note_en: 'Pass and fail reports share the same game, SKU and compression format.',
    });
  }

  // The problem table has NO compression column. Its rows are marked
  // compression="unknown" + compression_scope="zstd_issue_scope".
  // They are NEVER counted as ZSTD reports. They may, however, be surfaced as
  // an explicitly-labelled conflict *clue* against a ZSTD pass group with the
  // same game + PPSA. This keeps P-034/F-002 detectable without pretending the
  // original record named a compression format.
  for (const t of unknownCompression) {
    if (t.result !== RESULT.FAIL || t.compression_scope !== 'zstd_issue_scope') continue;
    const match = groups.find((g) => g.game_id === t.game_id && g.ppsa === t.ppsa
      && g.compression === COMPRESSION.ZSTD && g.pass_count > 0);
    if (!match) continue;
    const exists = conflicts.some((c) => c.game_id === t.game_id && c.ppsa === t.ppsa
      && c.compression === COMPRESSION.ZSTD && c.basis === 'scope_inferred');
    if (exists) {
      conflicts.find((c) => c.game_id === t.game_id && c.basis === 'scope_inferred')
        .fail_report_ids.push(t.id);
      continue;
    }
    conflicts.push({
      game_id: t.game_id,
      ppsa: t.ppsa,
      compression: COMPRESSION.ZSTD,
      basis: 'scope_inferred',
      pass_report_ids: match.tests.filter((x) => x.result === RESULT.PASS).map((x) => x.id),
      fail_report_ids: [t.id],
      note_zh: '范围推断冲突：问题表原始记录未注明压缩格式，仅因该表属于 ZSTD 问题收集范围而作为冲突线索；不是明确的同格式测试结果。',
      note_en: 'Scope-inferred conflict: the problem-table row did not state a compression format. It is only a conflict clue from the ZSTD issue-collection scope, not an explicit same-format test.',
    });
  }

  // Cross-format / unknown-format disagreement that is NOT a same-format
  // conflict: e.g. P-054 (LZ4 pass) vs F-001 (problem row, format unstated).
  // These must be visibly flagged, never silently collapsed into "passed".
  const inferredConflictKeys = new Set(conflicts.filter((c) => c.basis === 'scope_inferred')
    .map((c) => `${c.game_id}|${c.ppsa}`));
  const cautions = [];
  for (const t of unknownCompression) {
    if (t.result !== RESULT.FAIL) continue;
    const hasPass = groups.some((g) => g.game_id === t.game_id && g.pass_count > 0);
    if (!hasPass || inferredConflictKeys.has(`${t.game_id}|${t.ppsa}`)) continue;
    cautions.push({
      game_id: t.game_id,
      report_id: t.id,
      ppsa: t.ppsa,
      note_zh: '存在成功报告与压缩格式未注明的问题报告，但两者压缩格式不同/无法比较，不能判定为同格式冲突，也不得据此认定游戏已确认通过。',
      note_en: 'A pass report and a problem report with unstated compression coexist; their formats differ or cannot be compared, so this is not a same-format conflict and must not be read as confirmed compatibility.',
    });
  }

  // Per-game status over the supplied reports.
  const gameIds = new Set(tests.map((t) => t.game_id));
  const statusByGame = new Map();
  const conflictGameIds = new Set(conflicts.map((c) => c.game_id));
  const cautionGameIds = new Set(cautions.map((c) => c.game_id));
  for (const gid of gameIds) {
    if (conflictGameIds.has(gid)) {
      statusByGame.set(gid, STATUS.CONFLICT);
      continue;
    }
    const own = groups.filter((g) => g.game_id === gid);
    const mine = tests.filter((t) => t.game_id === gid);
    const hasUnknownResult = mine.some((t) => t.result === RESULT.UNKNOWN || t.result === RESULT.PARTIAL);
    if (own.length === 0) {
      // No explicit-format group at all: e.g. the problem-table-only games.
      // If every matching report is a failure we still surface it as FAILED
      // (the report result is explicit), while the missing format and PPSA are
      // shown separately on the card and in the detail drawer.
      const allFail = mine.length > 0 && mine.every((t) => t.result === RESULT.FAIL);
      statusByGame.set(gid, allFail ? STATUS.FAILED : STATUS.NEEDS_CONFIRMATION);
    } else if (cautionGameIds.has(gid) || hasUnknownResult) {
      // A pass report plus a format-unstated failure, an unknown result, or a
      // partial result must NEVER be collapsed into "passed".
      statusByGame.set(gid, STATUS.NEEDS_CONFIRMATION);
    } else if (own.every((g) => g.status === STATUS.PASSED)) {
      statusByGame.set(gid, STATUS.PASSED);
    } else if (own.every((g) => g.status === STATUS.FAILED)) {
      statusByGame.set(gid, STATUS.FAILED);
    } else {
      statusByGame.set(gid, STATUS.NEEDS_CONFIRMATION);
    }
  }

  return { groups, conflicts, cautions, statusByGame, unknownCompression };
}

/** Full dataset statistics. Every number here is derived from the JSON files. */
export function computeStats({ games, tests, sources }) {
  const all = aggregate(tests);
  const sourceRecords = sources.records;
  const passSources = sourceRecords.filter((s) => s.source_table === 'pass');
  const problemSources = sourceRecords.filter((s) => s.source_table === 'problem');

  const byCompression = {};
  const byResult = {};
  for (const t of tests) {
    byCompression[t.compression] = (byCompression[t.compression] || 0) + 1;
    byResult[t.result] = (byResult[t.result] || 0) + 1;
  }

  const byStatus = {};
  for (const status of all.statusByGame.values()) {
    byStatus[status] = (byStatus[status] || 0) + 1;
  }

  const confirmedSkus = games.reduce((n, g) => n + (g.skus || []).length, 0);
  const candidateSkus = games.reduce((n, g) => n + (g.candidate_skus || []).length, 0);
  const distinctPpsa = new Set(games.flatMap((g) => (g.skus || []).map((s) => s.ppsa))).size;
  const testers = new Set(tests.flatMap((t) => t.tester || []));

  const needsConfirmationReports = tests.filter((t) => t.result === RESULT.UNKNOWN
    || t.compression === COMPRESSION.UNKNOWN || t.ppsa === null).length;
  const conflictGames = new Set(all.conflicts.map((c) => c.game_id)).size;
  const explicitConflicts = all.conflicts.filter((c) => c.basis === 'explicit').length;
  const inferredConflicts = all.conflicts.filter((c) => c.basis === 'scope_inferred').length;

  return {
    // Source archive (original table rows, NOT independent tests / NOT games)
    source_records_total: sourceRecords.length,
    source_pass_records: passSources.length,
    source_problem_records: problemSources.length,
    // Entities
    distinct_games: games.length,
    distinct_ppsa: distinctPpsa,
    confirmed_skus: confirmedSkus,
    candidate_skus: candidateSkus,
    distinct_testers: testers.size,
    // Independent test reports
    test_reports_total: tests.length,
    zstd_reports: byCompression.zstd || 0,
    lz4_reports: byCompression.lz4 || 0,
    unknown_compression_reports: byCompression.unknown || 0,
    pass_reports: byResult.pass || 0,
    fail_reports: byResult.fail || 0,
    partial_reports: byResult.partial || 0,
    unknown_reports: byResult.unknown || 0,
    // Verification / evidence quality
    community_reports: tests.filter((t) => t.verification === 'community_report').length,
    single_source_reports: tests.filter((t) => t.verification === 'single_source').length,
    maintainer_reproductions: tests.filter((t) => t.verification === 'maintainer_reproduced').length,
    reports_with_test_date: tests.filter((t) => t.tested_at).length,
    reports_with_evidence: tests.filter((t) => (t.evidence || []).length > 0).length,
    reports_missing_ppsa: tests.filter((t) => t.ppsa === null).length,
    needs_confirmation_reports: needsConfirmationReports,
    // Aggregated compatibility (NOT the same thing as "85 pass rows")
    status_passed_games: byStatus.passed || 0,
    status_failed_games: byStatus.failed || 0,
    status_conflict_games: byStatus.conflict || 0,
    status_needs_confirmation_games: byStatus.needs_confirmation || 0,
    conflict_groups: all.conflicts.length,
    conflict_games: conflictGames,
    explicit_conflicts: explicitConflicts,
    scope_inferred_conflicts: inferredConflicts,
    cross_format_caution_reports: all.cautions.length,
    cross_format_caution_games: new Set(all.cautions.map((c) => c.game_id)).size,
  };
}

/** Index games once so filtering stays fast even if the dataset grows. */
export function buildIndex(games, tests, updates) {
  const testsByGame = new Map();
  for (const t of tests) {
    if (!testsByGame.has(t.game_id)) testsByGame.set(t.game_id, []);
    testsByGame.get(t.game_id).push(t);
  }
  const rows = games.map((g) => {
    const own = testsByGame.get(g.id) || [];
    const agg = aggregate(own);
    return {
      game: g,
      tests: own,
      conflicts: agg.conflicts,
      cautions: agg.cautions,
      status: agg.statusByGame.get(g.id) || STATUS.NEEDS_CONFIRMATION,
      groups: agg.groups,
      search: searchableText(g, own),
      testers: [...new Set(own.flatMap((t) => t.tester || []))],
      regions: [...new Set((g.skus || []).flatMap((s) => s.regions || []))],
      compressions: [...new Set(own.map((t) => t.compression))],
    };
  });
  return { rows, testsByGame, updates: updates || [] };
}
