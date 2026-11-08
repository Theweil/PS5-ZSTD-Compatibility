# 状态定义 / Status Definitions

[English below](#status-definitions-en)

本项目严格区分**单条报告结果**、**游戏聚合状态**、**验证级别**与**证据范围**。这四者不能互相替代。

统一实现位于 `site/assets/js/data.js` 的 `aggregate()` / `computeStats()`；网站与 CI 脚本共用同一份代码。

---

## 1. 单条报告结果 / Per-report `result`

`tests.json` 中**每一条独立报告**的结果，四选一：

| 值 | 中文 | 定义 |
| --- | --- | --- |
| `pass` | 成功 | 该次测试成功运行，未见明显限制 |
| `fail` | 失败 | 该次测试失败：卡 logo、黑屏、运行失败、崩溃、无法运行等 |
| `partial` | 部分成功 | 能运行但存在明显限制或部分功能异常 |
| `unknown` | 无法判断 | 证据不足、结果存疑或仅有第三方转述 |

**规则**：一条 `pass` 报告不能覆盖另一条 `fail` 报告；两者都是独立记录，永久保留。
原始问题表的症状映射：`卡 logo`/`黑屏`/`运行失败`/`无法运行`/`signal 11 出错` → `fail`；`待确认` → `unknown`。

初始数据：85 条 `pass`、9 条 `fail`、0 条 `partial`、2 条 `unknown`（`P-044` 的 ZSTD 存疑部分与 `F-007`）。

## 2. 压缩格式 / Compression

| 值 | 定义 |
| --- | --- |
| `zstd` | 原始记录明确指出 ZSTD |
| `lz4` | 原始记录明确指出 LZ4 |
| `unknown` | **原始记录没有提供压缩格式** |

- 分组键 = `game_id | ppsa | compression`。`unknown` 报告不进入任何格式分组，也不计入 ZSTD / LZ4 报告数。
- **ZSTD 通过不能代表 LZ4 通过，反之亦然**。不同压缩格式永不混合统计。
- 问题表 10 行**没有压缩格式列**，全部为 `compression: "unknown"` + `compression_scope: "zstd_issue_scope"`。
- `compression_scope: "zstd_issue_scope"` 只表示"该问题表属于 ZSTD 问题收集范围"，**不是测试结论，不是推断出的格式**。它只用于生成明确标注的冲突线索（见第 4 节）。
- `compression_raw: null` 表示原始表格根本没有这一列（问题表），而非"忘记填写"。

初始数据：84 条 `zstd`、2 条 `lz4`、10 条 `unknown`，共 96 条独立报告。

## 3. 游戏聚合状态 / Aggregated `status`

聚合状态**基于当前查询范围内的报告**动态计算（切换筛选条件会重算），四选一：

| 值 | 中文 | 定义 |
| --- | --- | --- |
| `passed` | 通过 | 当前查询范围内有成功报告，**且没有相应的失败冲突**；同时没有跨格式分歧、未知结果或部分结果 |
| `failed` | 失败 | 当前查询范围内只有失败报告 |
| `conflict` | 冲突 | 同一游戏、同一 SKU、同一压缩格式存在互相矛盾的报告；或明确标注的「范围推断冲突」 |
| `needs_confirmation` | 待确认 | 证据不足、关键环境信息缺失、存在未知/部分结果，或存在跨格式 / 格式未明的结果分歧 |

初始数据（无筛选时）：**81 通过 / 6 失败 / 1 冲突 / 3 待确认**，合计 91 款独立游戏。

> 「通过」不代表该游戏所有 SKU、所有压缩格式、所有测试环境都通过。

## 4. 冲突判定的两种依据 / Conflict basis

### 4.1 `explicit` — 明确冲突

同一 `game_id` + 同一 `ppsa` + 同一 `compression` 分组内同时存在 `pass` 与 `fail`。这是最严格、最可信的冲突。当前初始数据中没有此类冲突（0 组）。

### 4.2 `scope_inferred` — 范围推断冲突（明确标注，不是测试数据）

问题表原始行**未注明压缩格式**，但因该表本身是「ZSTD 问题收集清单」，当它与**同一游戏 + 同一 PPSA** 的 ZSTD 通过报告同时出现时，系统生成一条冲突线索：

- 依据：`basis: "scope_inferred"`
- 文案：**「范围推断冲突：问题表原始记录未注明压缩格式，仅因该表属于 ZSTD 问题收集范围而作为冲突线索；不是明确的同格式测试结果。」**
- 该失败报告仍然保持 `compression: "unknown"`，**不会**被改写为 `zstd`，也**不会**计入 ZSTD 报告数。

初始实例：`P-034`（zhangyun111，ZSTD 通过）与 `F-002`（nisec_eric，卡 logo）→ 游戏「羊蹄山之魂 Ghost of Yotei」= `conflict`。

### 4.3 `caution` — 跨格式 / 格式未明的结果分歧（不是 conflict）

存在成功报告与"格式未注明"的失败报告，但两者**不能证明是同一压缩格式**时不判为冲突，而是给出醒目提示，且游戏状态记为 `needs_confirmation`：

- `P-054`（hmh715，**LZ4** 通过）与 `F-001`（nisec_eric，卡 logo，格式未注明）→ 宇宙机器人 ASTRO BOT
- `P-044`（拆分为 ZSTD 存疑 + LZ4 通过）与 `F-003`（nisec_eric，黑屏，格式未注明）→ 金刚狼

另有 `P-063`（通过）与 `F-007`（待确认，格式未注明）→ 最后生还者 第一部：该问题报告结果本身就是 `unknown`，因此不产生 conflict / caution，但因「存在未知结果」同样记为 `needs_confirmation`，不得简单认定全部成功。

初始数据：1 组范围推断冲突、2 条跨格式提示（涉及 2 款游戏）、3 款游戏记为待确认。

---

## 5. 验证级别 / `verification`

| 值 | 定义 |
| --- | --- |
| `community_report` | 社区成员提交的报告；**初始 96 条报告中的绝大多数** |
| `single_source` | 仅单一来源、未经交叉验证（如 `P-074` 的编号来源） |
| `maintainer_reproduced` | 维护者按 `docs/TESTING-GUIDE.md` 独立复现并留有证据 |
| `unknown` | 无法判断 |

**社区报告不能直接称为维护者独立复现。** 当前 `maintainer_reproductions = 0`，网站单独展示这个数字。

## 6. 其他状态字段

| 字段 | 含义 |
| --- | --- |
| `ppsa_status: "missing"` | 原始资料没有 PPSA，网站显示「待确认」；不得猜编号 |
| `game_identification: "unidentified"` | 游戏名称无法识别（`P-030`）；不得猜测替换 |
| `game_identification: "uncertain"` | 所测实体存疑（`P-045`）；不得擅自更正 |
| `skus[].confidence: "confirmed"` | 来自 PPSA 列的正式 SKU |
| `candidate_skus[].confidence: "unconfirmed"` | 仅出现在备注中的疑似编号，**永不并入正式 SKU** |
| `tested_at: null` | 原始资料没有测试日期；**不是**「未测试」 |

## 7. 三条不可违反的原则

1. **不同压缩格式不能混合统计**：ZSTD 通过 ≠ LZ4 通过。
2. **报告不能互相覆盖**：通过报告与失败报告同时保留，冲突时醒目展示相反报告的具体 ID。
3. **推断必须显式标注**：`scope_inferred` / `caution` 都有明确文案，绝不把推断伪装成原始测试数据。

---

<a id="status-definitions-en"></a>

## Status Definitions (EN)

Four distinct concepts: **per-report `result`** (`pass` / `fail` / `partial` / `unknown`), **aggregated game `status`** (`passed` / `failed` / `conflict` / `needs_confirmation`), **`verification`** (`community_report` / `single_source` / `maintainer_reproduced` / `unknown`) and **compression scope**.

Reports are grouped by `game_id | ppsa | compression`. `unknown`-compression reports never enter a ZSTD or LZ4 group and never count toward those statistics. ZSTD and LZ4 are never mixed. A `pass` report never overwrites a `fail` report.

Aggregated status is recomputed for the current query. Initial dataset (no filters): **81 passed / 6 failed / 1 conflict / 3 needs confirmation = 91 distinct games**. "Passed" does not mean every SKU, format or environment passes.

Conflicts come in two explicit flavours:

- `explicit`: pass and fail reports share the same game, SKU **and** compression format (0 in the initial data).
- `scope_inferred`: the problem table has no compression column, so its rows keep `compression: "unknown"`; when such a fail report shares a game + PPSA with a ZSTD pass report, a clearly-labelled conflict **clue** is produced (e.g. `P-034` vs `F-002`, Ghost of Yotei). The row is never relabelled `zstd` and never counted as a ZSTD test.

`cautions` cover cross-format / unknown-format disagreement (e.g. `P-054` LZ4 pass vs `F-001` problem report) and force `needs_confirmation` instead of a misleading "passed".

Community reports are never relabelled as maintainer reproductions; the current maintainer-reproduction count is 0. Missing PPSAs display as "pending"; unidentified games are never guessed; note-only SKU numbers stay `unconfirmed` candidates.
