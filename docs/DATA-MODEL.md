# 数据模型 / Data Model

[English below](#data-model-en)

## 1. 三层结构

本项目**不是**一张"游戏 → 结果"的扁平表。数据分成三层，任何一层都不能被另一层替代：

| 层 | 文件 | 含义 | 数量（初始迁移） |
| --- | --- | --- | --- |
| 原始记录 | `data/sources.json` + `docs/source-data-original.md` | 社区清单中的**一行**，逐字存档 | 95（P-001…P-085、F-001…F-010） |
| 游戏实体 | `data/games.json` | **一款独立游戏**（可对应多个 SKU、多条测试） | 91 |
| 独立测试报告 | `data/tests.json` | **一次独立测试 / 一个独立报告**，含来源 ID | 96 |

辅助数据：`data/regions.json`（地区代码表）、`data/updates.json`（项目更新记录）。

> 95 是**原始表格行数**，不是 95 款游戏，也不是 95 次经过独立验证的测试。
> 96 条测试报告 > 95 条原始记录，是因为 `P-044` 同时含 ZSTD 与 LZ4 信息，按规则必须拆成两条。

## 2. `games.json`

| 字段 | 说明 |
| --- | --- |
| `id` | 稳定、唯一的 slug；跨表重复出现的游戏共用同一个 `id` |
| `title_zh` / `title_en` | 规范化中文 / 英文名称；**无法确认时为 `null`** |
| `title_original` | 原始表格中的游戏名称字符串，**逐字保留**，用于校对与搜索 |
| `platform` | 固定 `PS5` |
| `skus[]` | 来自 PPSA 列的**正式 SKU**；`confidence: "confirmed"` |
| `candidate_skus[]` | 仅出现在备注中的疑似编号；`confidence: "unconfirmed"`，**永远不会**并入 `skus` |
| `aliases[]` | 别名 / 机翻名 / 社区译名（含问题表带来的别名） |
| `description` / `notes` | 说明与维护者备注 |
| `game_identification` | `confirmed` / `uncertain` / `unidentified` |
| `source_record_ids[]` | 该游戏关联的全部原始记录 ID |

### SKU 规则

1. 地区只在原文明确标注时赋值：`港→HK`、`美→US`、`欧→EU`、`日→JP`、`亚→AS`；未标注一律 `UNKNOWN`，**不推断**。
2. `PPSA01317(美)/01318(亚)` 这类缩写，只有在同一原始文本明确指向同一编号体系时才补全前缀为 `PPSA01318`。
3. `PPSA04451(港/欧)` 是**一个 PPSA、多个地区**，保存为一条 SKU，`regions: ["HK","EU"]`，测试记录 `region: "MULTI"`。
4. 备注中的 `28465`、`09418`、`31544`、`07632`、`20318`、`04452`、`29683`、`34974/34975` 等编号全部进入 `candidate_skus`，不覆盖、不合并正式 SKU。
5. `—` / 空白 PPSA 保留为 `ppsa: null` + `ppsa_status: "missing"`，网站显示"待确认"。
6. `HP9000-PPSA01287`、`UP4040-PPSA09518` 等 SKU 代码作为候选记录保存（`ppsa: null`，`raw` 逐字），不伪造新的 PPSA 编号。

## 3. `tests.json`

每条记录是**一次独立报告**。字段与 `docs/STATUS-DEFINITIONS.md` 中的枚举一致。

| 字段 | 说明 |
| --- | --- |
| `id` | `test-0001`…；全局唯一 |
| `game_id` | 指向 `games.json` 的 `id` |
| `ppsa` / `ppsa_raw` / `ppsa_all` | 规范化主 PPSA / 原始字符串 / 该行全部 PPSA |
| `region` / `regions` / `region_raw` | 地区代码 / 全部地区 / 原始地区标注 |
| `compression` | `zstd` / `lz4` / `unknown` |
| `compression_raw` | 原始压缩格式列；**问题表没有该列，值为 `null`** |
| `compression_scope` | `explicit` / `zstd_issue_scope` / `unknown` |
| `result` | `pass` / `fail` / `partial` / `unknown`（单条报告结果） |
| `verification` | `community_report` / `maintainer_reproduced` / `single_source` / `unknown` |
| `tester[]` / `tester_raw` | 测试者列表 / 原始测试者字符串 |
| `tested_at` | **原始资料未提供任何测试日期，全部为 `null`** |
| `ps5_firmware` / `converter` / `runtime_version` / `mount_tool` | 原始资料没有结构化字段，全部为 `null` |
| `game_version` | 仅当原始备注中出现明确版本字符串时逐字转录（如 `01.018`）；该字符串在原文中**没有字段标签**，属未经独立核实的转录值，详见备注 |
| `evidence[]` | 证据链接；初始数据为空数组（原始资料未给链接） |
| `source_record_ids[]` / `source_table` / `source_row` | 回溯到原始表格 |
| `symptom` / `notes` / `history[]` | 原始症状、逐字备注、备注中提及的历史状态 |
| `game_identification` / `derivation` / `result_note` | 特殊迁移说明 |

### 为什么 `game_version` 有值但 `runtime_version` 全为 `null`

原始备注中 `01.000 / 42G`、`01.018 / 50G`、`01.041.000` 等是**没有字段标签的版本字符串**，按字面转录到 `game_version` 并在备注中保留原文；它们不是经核实的"游戏版本"字段。而 `0.3.2` / `0.3.3` / `libSceAmpr-0.3.3.sprx` / `ampr-emu-ng 0.3.3` 出现在 P-083、P-084 的叙述性备注中，无法无歧义判定属于"转换器"还是"运行库"，因此**不填入结构化字段**，只保留在 `notes` 与 `history[]`，避免伪造环境信息。

### 压缩格式缺失的处理

问题表的 10 行**没有压缩格式列**。它们全部保存为：

```json
"compression": "unknown",
"compression_raw": null,
"compression_scope": "zstd_issue_scope",
"compression_note": "……该表属于 ZSTD 问题收集范围，此上下文仅作冲突线索……"
```

`zstd_issue_scope` **不是**测试数据：这 10 条记录不计入 ZSTD 报告数，也不计入 LZ4 报告数。它只用于把"通过表成功报告 + 问题表失败报告"识别为**范围推断冲突线索**（见 `STATUS-DEFINITIONS.md`）。

## 4. 冲突与拆分规则的具体落地

| 原始记录 | 处理 |
| --- | --- |
| `P-034` + `F-002` | 同一游戏两条独立报告（pass / fail）同时保留；聚合状态 `conflict`（`basis: scope_inferred`） |
| `P-054` + `F-001` | `P-054` 为 `lz4` pass；`F-001` 为 `unknown` 格式 fail；不合并、不判为同格式冲突，另记 `caution` |
| `P-044` | 拆为 `zstd`（tiga6367，`unknown` 存疑）+ `lz4`（hmh715，`pass`）两条报告；`F-003` 独立 fail |
| `P-063` + `F-007` | pass 与 unknown 报告同时保留，游戏状态 `needs_confirmation` |
| `P-030` | `title_zh`/`title_en` 为 `null`，`game_identification: unidentified`，仅保留原文 |
| `P-025` | 仅 `JP` SKU；无港服 ID |
| `P-075` | `PPSA20318` 仅存 `candidate_skus` |
| `P-080` | `PPSA04451` (`HK`,`EU`) 为正式 SKU；`04452` 仅存候选 |
| `P-037` | `PPSA07411` (`US`) 为正式 SKU；`09418` 仅存候选 |
| `F-004`…`F-006`、`F-008` | `ppsa: null`，网站显示"待确认" |

## 5. 聚合逻辑（唯一实现）

`site/assets/js/data.js` 中的 `aggregate()` / `computeStats()` 是**唯一**聚合实现，浏览器与 Node 校验脚本共用同一份代码，避免"网站显示一套数字、README 写另一套数字"。

分组键 = `game_id | ppsa | compression`（`compression === "unknown"` 的报告单独存放，不进入任何格式分组）。

## 6. 禁止事项

- 不得把社区报告标成 `maintainer_reproduced`。
- 不得用 `P-001…P-085` 的数量当作"已验证游戏数"。
- 不得把 ZSTD 结论套用到 LZ4，反之亦然。
- 不得删除 `docs/source-data-original.md` 中的任何一行。
- 不得上传 PKG、密钥、游戏文件、截图或第三方享有版权的资料。

---

<a id="data-model-en"></a>

## Data Model (EN)

Three layers, never conflated: **95 verbatim source rows** → **91 distinct game entities** → **96 independent test reports**. `sources.json` is the machine-readable mirror of `docs/source-data-original.md`; every `raw_line` must match the Markdown byte-for-byte (CI enforces this).

`games.json` holds one record per game with confirmed `skus[]` (from the PPSA column only) and `candidate_skus[]` (numbers found only in notes, always `unconfirmed`). Regions are never inferred; unlabelled PPSAs use `UNKNOWN`, missing PPSAs use `null` + `ppsa_status: "missing"`.

`tests.json` holds one record per independent report. All original community rows have `tested_at: null`, `verification: "community_report"` and no invented firmware/converter/runtime values. The problem table has no compression column, so all ten rows keep `compression: "unknown"` with a `zstd_issue_scope` context flag that is **not** counted as test data.

Conflicting reports are retained, never overwritten. `P-044` is split into separate ZSTD and LZ4 reports. Aggregation lives in one shared ES module (`site/assets/js/data.js`) used by both the browser and the CI scripts.
