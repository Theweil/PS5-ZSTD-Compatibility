# PS5 ZSTD Compatibility Database

> 由社区共同维护的 PS5 游戏 **ZSTD / LZ4** 压缩、转换与运行兼容性数据库。
> Community-maintained PS5 game compatibility database for ZSTD / LZ4 compression, conversion and runtime behaviour.

[English section below](#english)

---

## 在线查询入口

**<https://theweil.github.io/PS5-ZSTD-Compatibility/>**

网站由 `.github/workflows/deploy.yml` 在推送到 `main` 时通过 GitHub Pages 自动发布。若这是首次部署，仓库所有者需要在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**；启用后每次合并都会自动更新站点，无需手动改动 HTML。

- 仓库：<https://github.com/Theweil/PS5-ZSTD-Compatibility>
- 提交测试：[新增测试报告](https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/new?template=new-test.yml)
- 报告问题：[报告兼容性问题](https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/new?template=report-problem.yml)
- 修正资料：[修正数据库记录](https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/new?template=correct-record.yml)

## 这个数据库用来做什么

- 搜索游戏中文名、英文名、别名、PPSA 与测试者。
- 按 ZSTD / LZ4、聚合状态、地区、测试者筛选并排序。
- 查看每款游戏的所有地区 SKU、未确认候选 SKU 与**每一条独立测试报告**。
- 查看测试者、游戏版本、转换工具、运行库、固件、挂载工具、症状、原始备注、历史记录与证据链接。
- 明确展示互相矛盾的报告，列出相反结果的具体报告 ID。
- 查看项目更新记录，并通过 Issue / PR 参与长期维护。

它不是一份 README 名单：数据分成 **95 条原始记录 → 93 款独立游戏 → 98 条独立测试报告** 三层，全部以仓库中的 JSON 为唯一数据源。社区新提交的报告使用 `I-nnn` 来源 ID，与 `P-xxx` / `F-xxx` 逐字存档分开管理。

## 核心功能

| 功能 | 实现 |
| --- | --- |
| 中英文双语 | 全站文案可切换，游戏名称保留中文 / 英文 / 原始名称 |
| 深色 / 浅色主题 | 跟随系统偏好，可手动切换并记住选择 |
| 动态统计 | 首页所有数字由 `data/*.json` 实时计算，不写死在 HTML 中 |
| 搜索 | 中文名、英文名、别名、PPSA（含缩写数字）、测试者、备注 |
| 筛选 | 状态、压缩格式、地区、测试者；排序支持名称 / 状态 / 报告数 / PPSA |
| 详情 | 所有 SKU、候选 SKU、独立报告、冲突说明、跨格式提示、历史记录 |
| 响应式 | 桌面优先，适配平板与手机，无水平溢出 |
| 无后端 | 纯静态 HTML/CSS/JS，通过 `fetch` 读取 JSON，无需登录、无需服务器 |

## 数据统计

> 所有数字由 `npm run stats` 从 `data/*.json` 自动计算；CI 会核对 README 中的 `STATS-SNAPSHOT`，不一致即失败。

| 指标 | 数值 | 说明 |
| --- | ---: | --- |
| 原始记录合计 | **95** | 社区清单表格行数（85 通过表 + 10 问题表） |
| 通过表原始记录 | 85 | **不是** 85 款经独立验证的游戏 |
| 问题表原始记录 | 10 | 该表没有压缩格式列 |
| 独立游戏 | **93** | 去重后的游戏实体（91 款来自原始清单 + 2 款来自社区 Issue） |
| 独立测试报告 | **98** | `P-044` 拆成两条，另含 2 条社区 Issue 报告 |
| 正式 SKU / 不同 PPSA | 93 | 原始清单 91 + 社区提交 2 |
| 未确认候选 SKU | 14 | 只出现在备注中，永不并入正式 SKU |
| 不同测试者 | 27 | 原始昵称逐字保留 |
| ZSTD 测试报告 | **86** | 仅 `compression=zstd` |
| LZ4 测试报告 | **2** | 仅 `compression=lz4` |
| 格式未注明报告 | 10 | 问题表 10 行，不计入任何格式 |
| 单条结果：通过 / 失败 / 部分 / 无法判断 | 86 / 10 / 0 / 2 | 单条报告结果 |
| 聚合状态：通过 / 失败 / 冲突 / 待确认 | **82 / 7 / 1 / 3** | 无筛选时的游戏聚合状态 |
| 冲突 | 1 组（1 款游戏） | 0 组明确冲突 + 1 组范围推断冲突 |
| 跨格式分歧提示 | 2 条（2 款游戏） | 不作为同格式冲突 |
| 缺少 PPSA 的报告 | 4 | 显示为「待确认」 |
| 社区报告 / 单一来源 | 97 / 1 | `verification` |
| **维护者独立复现** | **0** | 社区报告绝不冒充独立复现 |
| 有测试日期 / 证据链接的报告 | 2 / 0 | 2 条日期来自 Issue 表单如实记录；原始 95 条存档无日期，不补造 |

## 测试结果含义（摘要）

- **单条报告结果**：`pass` 成功 / `fail` 失败 / `partial` 部分成功 / `unknown` 无法判断。
- **游戏聚合状态**：`passed` 有成功报告且无相应失败冲突 / `failed` 只有失败报告 / `conflict` 同游戏同 SKU 同格式存在相反报告 / `needs_confirmation` 证据不足或存在跨格式分歧。
- **一条通过报告不能覆盖另一条失败报告**；ZSTD 与 LZ4 分开统计；ZSTD 通过不代表 LZ4 通过。
- 问题表原始行没有压缩格式列，保存为 `compression: "unknown"`；「属于 ZSTD 问题收集范围」只是明确标注的冲突线索（`basis: scope_inferred`），**不是**测试数据。
- 完整定义：[docs/STATUS-DEFINITIONS.md](docs/STATUS-DEFINITIONS.md)。

## 支持的压缩格式

`zstd`、`lz4`、`unknown`（原始记录未提供格式）。任何报告只对应一种格式；格式未注明的报告不计入 ZSTD 或 LZ4 统计。

## 数据如何更新

1. 社区通过 Issue 表单提交 → 管理员核实 → 更新 `data/*.json`（原始存档 `docs/source-data-original.md` **永不修改**）。Issue 报告写入 `games.json` / `tests.json`，来源 ID 用 `I-nnn` 并保留 `issue_url`，详见 [docs/DATA-MODEL.md](docs/DATA-MODEL.md)。
2. `npm test` 自动校验 JSON 语法、JSON Schema、ID 唯一性、PPSA 可追溯性、95 条原始记录覆盖率、冲突保留规则与 README 统计一致性。
3. Pull Request 审核合并到 `main` → `deploy.yml` 自动构建 `dist/` 并发布到 GitHub Pages。
4. 网站通过 `fetch(..., {cache:'no-store'})` 读取 JSON；**JSON 一变，统计、列表、详情同步更新，不需要手改 HTML**。

本地开发：

```bash
npm ci
npm test        # validate + stats:check + build
npm run dev     # http://127.0.0.1:4173/
```

## 目录结构

```text
data/        games.json tests.json sources.json regions.json updates.json
schema/      game/test/source/regions/updates JSON Schema
docs/        source-data-original.md（逐字存档）DATA-MODEL.md STATUS-DEFINITIONS.md
             TESTING-GUIDE.md CONTRIBUTING.md
site/        index.html + assets/{css,js,images}
scripts/     validate-data.mjs generate-stats.mjs build-site.mjs serve.mjs
             site/assets/js/data.js（网站与 CI 共用的唯一聚合实现）
.github/     ISSUE_TEMPLATE（3 个表单）PULL_REQUEST_TEMPLATE.md workflows（validate / deploy）
```

## 技术架构

| 模块 | 技术 |
| --- | --- |
| 前端 | 原生 HTML5 + CSS3 + JavaScript（ES Modules，无框架） |
| 数据 | JSON + JSON Schema（draft-07） |
| 校验 / 统计 / 构建 | Node.js 22 + Ajv（仅开发依赖） |
| 静态托管 / 部署 | GitHub Pages + 官方 Pages Actions |
| 社区反馈 / 协作 | GitHub Issues（Issue Forms）+ Pull Requests |
| 版本管理 | Git |

不使用数据库、后端 API、用户系统、付费服务或重型前端框架。

## 文档

- [贡献指南](CONTRIBUTING.md) · [测试指南](docs/TESTING-GUIDE.md)
- [状态定义](docs/STATUS-DEFINITIONS.md) · [数据模型](docs/DATA-MODEL.md)
- [原始表格逐字存档](docs/source-data-original.md) · [变更记录](CHANGELOG.md)

## 开源协议

- 代码：[MIT](LICENSE)
- 本项目整理的兼容性元数据：[CC BY 4.0](DATA-LICENSE.md)
- 第三方内容版权归原作者所有；对授权无法确认的资料只保留必要描述与合法来源链接，不复制原文。

## 免责声明

本项目只收录社区提供的**事实性元数据**（游戏名称、PPSA、结果描述、测试者昵称、文字备注），不含任何游戏文件、PKG、密钥或破解内容。
所有初始记录均来自社区整理清单，`verification=community_report`，**维护者独立复现数为 0**；`未提供` 表示原始资料没有该字段，不代表"没有问题"。
测试结果受固件、游戏版本、转换器、运行库、挂载工具与地区 SKU 影响，仅供社区参考，不构成任何保证。使用相关工具请遵守所在地法律与游戏服务条款。

---

<a id="english"></a>

## English

**PS5 ZSTD Compatibility Database** is a community-maintained, open-source database of PS5 game compatibility after ZSTD / LZ4 compression and conversion. Browse it at <https://theweil.github.io/PS5-ZSTD-Compatibility/> (published by GitHub Actions from `main`; on first setup the owner selects **Settings → Pages → Source: GitHub Actions**).

**Core features:** bilingual UI (中文 / English), dark & light themes, live statistics computed from JSON, search by Chinese/English title, alias, PPSA (including abbreviated digits) and tester, filters for status / compression / region / tester, sorting, and a detail view showing every regional SKU, unconfirmed candidate SKU, independent test report, conflict banner, cross-format caution, environment fields and history. No login, no backend, no framework.

**Data model:** **95 verbatim source rows** (`docs/source-data-original.md` + `data/sources.json`) → **93 distinct games** (`data/games.json`) → **98 independent test reports** (`data/tests.json`). 85 pass-table rows are **not** 85 independently verified games. ZSTD and LZ4 are never mixed; the 10 problem-table rows have no compression column and keep `compression: "unknown"`. Opposing reports are all retained (e.g. `P-034` pass vs `F-002` fail → `conflict`); `P-044` is split into separate ZSTD and LZ4 reports. Reports submitted later through GitHub Issues use `I-nnn` provenance ids and never enter the verbatim archive.

**Key figures:** 95 original rows (85 pass + 10 problem), 93 games, 98 reports (86 ZSTD / 2 LZ4 / 10 format-unstated), 93 confirmed SKUs + 14 unconfirmed candidates, 27 testers, 82 passed / 7 failed / 1 conflict / 3 needs-confirmation games, **0 maintainer reproductions**, 2 reports with a test date stated in their Issue form, 0 invented dates or evidence links.

**Status meanings:** per-report `pass` / `fail` / `partial` / `unknown`; aggregated `passed` / `failed` / `conflict` / `needs_confirmation`. A pass never overwrites a fail; a ZSTD pass never implies an LZ4 pass. `scope_inferred` conflicts are explicitly labelled conflict *clues* from the ZSTD issue-collection scope, never test data. See [STATUS-DEFINITIONS.md](docs/STATUS-DEFINITIONS.md).

**Contributing:** use the three [Issue Forms](https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/new/choose) or open a PR. Issues never edit the database directly: `Issue → verification → JSON update → npm test → PR → review/merge → Pages deploy`. Unknown fields must use `null` / `unknown`, never guesses. See [CONTRIBUTING.md](CONTRIBUTING.md) and [TESTING-GUIDE.md](docs/TESTING-GUIDE.md).

**Stack:** static HTML/CSS/JS, JSON + JSON Schema, Node.js validation (Ajv), GitHub Pages + official Pages Actions, GitHub Issues/PRs. No database, backend, user accounts or paid services.

**Licence & disclaimer:** code [MIT](LICENSE), curated metadata [CC BY 4.0](DATA-LICENSE.md), third-party content belongs to its owners. Only factual metadata is collected — no game files, PKGs, keys or copyrighted material. All initial rows are community reports (`verification=community_report`); results depend on firmware, game version, converter, runtime, mount tool and regional SKU and are provided for reference only, without warranty. Comply with local laws and platform terms.

<!-- STATS-SNAPSHOT
{
  "source_records_total": 95,
  "source_pass_records": 85,
  "source_problem_records": 10,
  "distinct_games": 93,
  "distinct_ppsa": 93,
  "confirmed_skus": 93,
  "candidate_skus": 14,
  "distinct_testers": 27,
  "test_reports_total": 98,
  "zstd_reports": 86,
  "lz4_reports": 2,
  "unknown_compression_reports": 10,
  "pass_reports": 86,
  "fail_reports": 10,
  "partial_reports": 0,
  "unknown_reports": 2,
  "community_reports": 97,
  "single_source_reports": 1,
  "maintainer_reproductions": 0,
  "reports_with_test_date": 2,
  "reports_with_evidence": 0,
  "reports_missing_ppsa": 4,
  "needs_confirmation_reports": 11,
  "status_passed_games": 82,
  "status_failed_games": 7,
  "status_conflict_games": 1,
  "status_needs_confirmation_games": 3,
  "conflict_groups": 1,
  "conflict_games": 1,
  "explicit_conflicts": 0,
  "scope_inferred_conflicts": 1,
  "cross_format_caution_reports": 2,
  "cross_format_caution_games": 2
}
STATS-SNAPSHOT -->
