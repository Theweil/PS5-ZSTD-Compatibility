# Changelog

本项目所有数据变化都记录在此。格式参考 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循语义化版本。

> 维护规则：每次新增游戏、新增测试、修改 PPSA、修正名称、状态变化或修复错误记录，都必须在此追加条目，并注明涉及的 `source_record_ids`。
> `docs/source-data-original.md` 是只读的逐字存档，**不随变更修改**。

---

## [Unreleased]

### Added — 描述说明可编辑 / Editable game descriptions

- `schema/game.schema.json`：`games.json` 新增可选 `description_zh` / `description_en` 双语字段（向后兼容，现有 91 条记录无需改动）。
- `site/assets/js/details.js`：详情「基础信息」新增整行「游戏说明」，按界面语言选择 `description_zh` / `description_en`，回退 `description`；只有另一种语言时明确标注，不编造译文；无说明显示「未提供」。
- `site/assets/js/data.js`：三个描述字段与 `notes` 进入搜索索引。
- `site/assets/css/style.css`：新增 `.kv.wide` 整行样式，支持长文本换行。
- `docs/DATA-MODEL.md`、`docs/CONTRIBUTING.md`、`CONTRIBUTING.md`：补充「修改游戏描述说明」操作说明，明确 `description*` / `notes` / 逐字原始备注的区别。
- **未向 91 条游戏写入任何示例描述内容**（不编造说明）。

---

## [1.0.0] - 2026-11-08

### Added — 数据与模型 / Data & model

- 建立 `data/sources.json`：逐字存档 **95 条原始记录**（通过表 `P-001`…`P-085` 共 85 条；问题表 `F-001`…`F-010` 共 10 条），每行保留 `raw_line` 与原始游戏名称、PPSA、压缩格式/症状、测试者、备注。
- 建立 `docs/source-data-original.md`：两张原始表格的完整逐字副本与迁移检查点。
- 建立 `data/games.json`：**91 款独立游戏**，含中文 / 英文 / 原始名称、别名、正式 SKU、候选 SKU、识别状态与来源 ID。
- 建立 `data/tests.json`：**96 条独立测试报告**；每条带 `source_record_ids`、逐字备注、测试者、结构化环境字段（未提供为 `null`）。
- 建立 `data/regions.json`（地区代码表）与 `data/updates.json`（项目更新记录；日期为项目事件，不是测试日期）。
- 建立 `schema/game.schema.json`、`schema/test.schema.json`、`schema/source.schema.json`、`schema/regions.schema.json`、`schema/updates.schema.json`（JSON Schema draft-07）。

### Added — 迁移规则落地 / Migration decisions

- `P-044` 拆分为两条独立报告：`tiga6367` 的 ZSTD（`unknown`，版本存疑）与 `hmh715` 的 LZ4（`pass`）。
- `P-034`（通过）与 `F-002`（卡 logo）同时保留，游戏「羊蹄山之魂」聚合状态为 `conflict`（`basis: scope_inferred`）。
- `P-054`（LZ4 通过）与 `F-001`（问题报告）不合并、不判为同格式冲突，另记跨格式提示。
- `P-063`（通过）与 `F-007`（待确认）同时保留，游戏「最后生还者 第一部」为 `needs_confirmation`。
- `P-030` 名称未识别，`title_zh` / `title_en` 保持 `null`；`P-045` 标记 `uncertain`。
- `P-025` 只保留日服 PPSA；`P-075` 的 `PPSA20318`、`P-037` 的 `09418`、`P-080` 的 `04452` 等备注编号只存 `candidate_skus`（`unconfirmed`）。
- `P-008`、`P-011`、`P-016`、`F-010` 的缩写 PPSA 在同编号体系明确时补全前缀；`P-080` 的 `PPSA04451(港/欧)` 保留为多地区单 SKU。
- `F-004`、`F-005`、`F-006`、`F-008` 无 PPSA，保留 `ppsa: null` + `ppsa_status: missing`。
- 问题表 10 行统一 `compression: "unknown"` + `compression_scope: "zstd_issue_scope"`，不计入 ZSTD / LZ4 报告数。
- 所有记录 `tested_at: null`、`verification` 为 `community_report` / `single_source`；**维护者独立复现数为 0**。

### Added — 网站 / Site

- `site/index.html` + 原生 CSS/JS：响应式首页、动态统计、中文/英文/PPSA/别名/测试者搜索、状态/压缩格式/地区/测试者筛选与排序、游戏详情抽屉、独立报告展示、冲突与跨格式提示、历史记录、最近更新、社区贡献入口。
- 深色 / 浅色主题、中英文切换、手机 / 平板适配、详情深链接 `#game=<id>`。
- 统计、列表、详情全部由 `data/*.json` 驱动；`fetch` 使用 `cache: 'no-store'`，JSON 更新后无需手改 HTML。

### Added — 自动化与文档 / Automation & docs

- `scripts/validate-data.mjs`：JSON 语法、JSON Schema、ID 唯一性、PPSA 格式与可追溯性、`game_id` 引用、压缩格式 / 结果枚举、95 条原始记录覆盖率与逐字一致性、冲突保留规则、README 统计一致性。
- `scripts/generate-stats.mjs`：自动统计 + README `STATS-SNAPSHOT` 核对（`--check`）/ 更新（`--write`）。
- `scripts/build-site.mjs`：把 `site/` 与 `data/*.json` 组装成 `dist/`；`scripts/serve.mjs` 本地预览。
- `.github/workflows/validate.yml`（PR / main 推送 / 手动）与 `.github/workflows/deploy.yml`（仅 `main`，官方 Pages Actions）。
- `.github/ISSUE_TEMPLATE/`：`new-test.yml`、`report-problem.yml`、`correct-record.yml`；`.github/PULL_REQUEST_TEMPLATE.md`。
- `CONTRIBUTING.md`、`docs/CONTRIBUTING.md`、`docs/TESTING-GUIDE.md`、`docs/STATUS-DEFINITIONS.md`、`docs/DATA-MODEL.md`。
- `README.md`（中英双语）、`LICENSE`（MIT）、`DATA-LICENSE.md`（CC BY 4.0）、`.gitignore`、`package.json`。

### Notes — 已知限制 / Known limitations

- 原始资料没有测试日期、PS5 固件、转换器 / 运行库 / 挂载工具的结构化字段，也没有证据链接；这些字段全部为 `null` / `[]`，网站显示「未提供」。
- `P-083`、`P-084` 备注中的 `0.3.2` / `0.3.3` 环境变化保存在 `notes` 与 `history[]`，未强行归入某个结构化字段。
- 问题表没有压缩格式列；`scope_inferred` 冲突是被明确标注的冲突线索，不是明确的同格式测试数据。
- 本版本尚未包含任何维护者独立复现记录，也未包含任何截图、日志或游戏文件。

---

## 记录模板 / Entry template

```markdown
## [x.y.z] - YYYY-MM-DD
### Added / Changed / Fixed
- 描述（涉及：`P-xxx` / `F-xxx`；来源：Issue #nn）
```
