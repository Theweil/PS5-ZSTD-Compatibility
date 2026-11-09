# 贡献指南 / Contributing Guide

本数据库由社区共同维护。**Issue 不会自动修改正式数据**。所有变更都必须经过核实、自动校验和 Pull Request 审核。

This database is community-maintained. **Issues never edit the database directly.** Every change goes through verification, automated validation and a reviewed Pull Request.

---

## 1. 三种提交入口 / Three ways to contribute

| 目的 | 入口 |
| --- | --- |
| 提交一次新的独立测试 | [新增测试报告表单](https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/new?template=new-test.yml) |
| 报告卡 logo / 黑屏 / 运行失败等问题 | [报告兼容性问题](https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/new?template=report-problem.yml) |
| 修正名称、PPSA、地区或测试数据 | [修正数据库记录](https://github.com/Theweil/PS5-ZSTD-Compatibility/issues/new?template=correct-record.yml) |
| 直接改动 JSON / 网站（维护者与熟悉数据的贡献者） |  Fork → 分支 → PR |

### 处理流程 / Workflow

```
Issue 提交 → 管理员核实 → 更新 JSON → 自动数据校验 → Pull Request → 审核合并 → GitHub Pages 自动发布
Issue      → verification → JSON update → npm test    → PR            → review/merge → Pages deploy
```

合并到 `main` 之前，任何数据都不会出现在公开网站上。

### 维护者一键收录 / One-click import (recommended)

仓库内置 `.github/workflows/issue-to-pr.yml` + `scripts/issue-to-data.mjs`。维护者**不必拉代码、不必手工改 JSON**：

1. 核实 `new-test` Issue 的内容（PPSA、压缩格式、结果、测试者；未知项是否已填 `unknown`）。
2. 用任一方式表达审核通过（只有仓库所有者 `Theweil` 的操作会触发，可在 workflow 的 `if` 里加维护者）：
   - 给 Issue 评论 `/approve`（**推荐，零配置**）；或
   - 给 Issue 打 `approved` 标签（需在仓库标签列表里预先创建一次）。
3. 工作流自动完成：解析表单 → 生成 `tests.json` 一条（必要时 `games.json` 一款）+ `updates.json` 一条 → 同步 README 统计快照 / 表格 / 中英文摘要与 `CHANGELOG.md` → 运行 `npm test` → 推送分支并创建 PR，并在 Issue 里留一条带 PR 链接的评论。
4. 核对 PR 内容后点 **Merge** → `deploy.yml` 自动发布，刷新网站即显示。

要点：

- **审核仍是闸门**：工作流只生成 PR，不自动合并、不自动发布；合并后的 `deploy.yml` 会再跑一次完整 `npm test`。
- **幂等**：同一个 Issue 只会导入一次；重复审核会跳过（改数据请走「修正数据库记录」流程）。需要重跑时移除标签后重新添加，或再评论一次 `/approve`。
- 由 `GITHUB_TOKEN` 创建的 PR，其 PR 检查可能显示 `Approve workflows to run`，点一次即可；即使不点，合并后 `deploy.yml` 仍会完整校验。
- 表单字段不合规（如 PPSA 不是完整编号、日期格式错误）时工作流失败，**不创建 PR**，并会在 Issue 留下带日志链接的评论。
- 手工改 JSON 仍然是合法的备用方式，步骤见下一节。

### 新增 Issue 报告如何变成网站上的一条记录

1. **核实**表单内容（PPSA、压缩格式、结果、测试者），未填项保持未知；把报告**逐字转录**到 `data/tests.json`。
2. 分配 `source_type: "issue"`、`source_record_ids: ["I-0nn"]`（编号 = GitHub Issue 编号补齐 3 位）、`issue_number` / `issue_url` / `submitted_at`；`source_table: "issue"`，`source_row` = Issue 编号。**不要**为它编造 `P-xxx` / `F-xxx`，也**不要**改逐字存档。
3. 若游戏还不存在，在 `data/games.json` 新建游戏实体（SKU 与游戏的来源 ID 同样用 `I-nnn`）；在 `data/updates.json` 记一条，首页「最近更新」就会显示。
4. `npm run stats -- --write` 同步 README 快照与统计表 → `npm test` 全绿 → `CHANGELOG.md` 记一条 → 提 PR → 合并 `main` → Pages 自动发布。

字段定义与校验规则见 [`docs/DATA-MODEL.md` 第 3.1 节](docs/DATA-MODEL.md)。

---

## 2. 什么是必需信息 / Required vs. optional

**必需 / Required**（没有就无法建立可信记录）：

- 游戏名称（至少中文或英文之一）
- 压缩格式：`zstd` / `lz4` / `unknown`
- 单条报告结果：`pass` / `fail` / `partial` / `unknown`
- 测试者（社区昵称即可）
- 来源：你实际观察到了什么

**可以未知 / May be unknown**：

- PPSA → 填 `unknown` / 待确认；**绝不猜一个相近编号**
- 地区 → 选「未注明」
- PS5 固件、游戏版本、转换器、运行库、挂载工具 → 填 `unknown` 或留空
- 测试日期 → 没记录就填 `unknown`；**不要补造日期**
- 证据 → 没有就留空，不要编造链接

> 本项目初始的 95 条原始记录**没有任何测试日期、固件或结构化环境字段**，因此这些字段在数据中是 `null`。
> `未提供` 的含义是"原始资料没有这个字段"，**不是**"没有问题"。

### 什么绝不能提交 / Never submit

- 游戏文件、PKG、密钥、license 文件、破解内容
- 第三方享有版权的截图、日志全文、商店页面原文
- 猜测出来的 PPSA、版本号、发售日期
- 把机翻名称当作官方名称

对无法确认授权的第三方内容，只保留**必要的文字描述**与**合法来源链接**，不复制原文。

---

## 3. 如何提供日志和证据 / Evidence

1. 优先提供你自己产生的、可公开的文字描述（现象、报错文字、复现步骤）。
2. 需要图片/日志时使用合法来源链接（自建图床、公开 gist 等），不要直接把文件塞进仓库。
3. 如果只能提供第三方资料，**只写必要描述 + 链接**，不要复制其原创内容。
4. 证据链接填入 `tests.json` 的 `evidence[]`（`{ "label": "...", "url": "https://..." }`）。

---

## 4. 相互矛盾的报告怎么处理 / Conflicting reports

- **一条通过报告不能覆盖另一条失败报告**。两者都作为独立 `tests.json` 记录保留，各自带自己的 `tester`、`source_record_ids` 和 `notes`。
- 同一游戏 + 同一 PPSA + 同一压缩格式出现 pass 与 fail → 聚合状态 `conflict`。
- 问题表原始记录**没有压缩格式列**：标为 `compression: "unknown"` + `compression_scope: "zstd_issue_scope"`。这个范围标记只在明确标注为「范围推断」时用作冲突线索，**永远不会**被当成 ZSTD 测试数据。
- 压缩格式不同的报告（例如 ZSTD 通过 + LZ4 失败）**不合并统计**，游戏状态记为 `needs_confirmation` 并给出跨格式提示。
- 完整定义见 [`docs/STATUS-DEFINITIONS.md`](docs/STATUS-DEFINITIONS.md)。

实例：`P-034`（zhangyun111 通过）与 `F-002`（nisec_eric 卡 logo）同时保留，游戏「羊蹄山之魂」显示 `conflict`。

---

## 5. 如何维护原始记录 / Preserving the source archive

- `docs/source-data-original.md` 是**逐字存档，只读**。不得修改、重排、精简或"更正"其中任何一行。
- `data/sources.json` 是该存档的机器可读镜像，`raw_line` 必须与 Markdown 完全一致（CI 会逐行比对）。
- 每条原始记录有唯一 ID：通过表 `P-001`…`P-085`，问题表 `F-001`…`F-010`，共 95 条。
- 每条 `tests.json` 记录都必须通过 `source_record_ids[]` 回溯到原始记录；任何一条原始记录没有被任何测试引用，CI 会失败（防止静默丢失）。
- 原始测试者名称、备注、游戏名称、PPSA 原文必须逐字保留（`tester_raw` / `notes` / `game_title_raw` / `ppsa_raw`）。
- 同一原始行包含多种压缩格式时（如 `P-044` 的 zstd / LZ4），**必须拆成多条独立报告**，不能合并。

---

## 6. 如何修正错误资料 / Correcting records

1. 提交「修正数据库记录」Issue，提供**原数据 → 建议数据 → 修改理由 → 相关来源**。
2. 管理员核实后修改 `data/*.json`，并在 `CHANGELOG.md` 记录。
3. 疑似但未经核实的编号只能加入 `candidate_skus`（`confidence: "unconfirmed"`），不得提升为正式 `skus`。
4. 原始清单中标注「未识别」「存疑」的游戏（如 `P-030`、`P-045`）**不得自行猜测替换**。
5. 修改后运行 `npm ci && npm test`；如统计数字变化，运行 `npm run stats -- --write` 同步 README。

> **只改游戏描述说明？** 属于最轻量的变更：在 `data/games.json` 按 `id` 填 `description_zh` / `description_en` / `description`（值为 `null` 表示无说明），跑 `npm test`、`CHANGELOG.md` 记一条、提 PR 即可。描述不影响统计，无需更新 README 快照。详见 [`docs/DATA-MODEL.md`「修改游戏描述说明」](docs/DATA-MODEL.md)。

---

## 7. 直接提交 PR / Direct JSON PRs

```bash
git clone https://github.com/Theweil/PS5-ZSTD-Compatibility.git
npm ci
# 修改 data/*.json（必要时同步 schema/ 与 docs/DATA-MODEL.md）
npm test                       # validate + stats:check + build
npm run stats -- --write       # 仅当统计数字变化时
npm run dev                    # 本地预览 http://127.0.0.1:4173/
```

`npm test` 会执行：JSON 语法与 Schema 校验、ID 唯一性、PPSA 格式与可追溯性、`game_id` 引用、压缩格式/结果枚举、95 条原始记录覆盖率与逐字一致性、冲突保留规则、README 统计一致性、站点构建。

PR 请使用 [Pull Request 模板](.github/PULL_REQUEST_TEMPLATE.md) 中的检查清单。

---

## 8. 分支与发布 / Branches & release

- `main` 是受信任分支；只有合并到 `main` 才会触发 GitHub Pages 正式部署。
- 请从独立开发分支提 PR，**不要直接推送 main**。
- `validate.yml` 在 PR 与 `main` 推送（涉及数据/结构变更时）运行；`deploy.yml` 只在 `main` 推送时部署。

---

## 9. 行为准则 / Ground rules

1. 不丢失原始数据。 2. 不伪造测试信息。 3. 不擅自修正未验证的 PPSA。 4. 不混淆 ZSTD 与 LZ4。 5. 不覆盖冲突结果。 6. 不把社区报告冒充独立复现。 7. 不把原始记录数当作独立游戏数。 8. 不上传游戏文件或受版权保护的内容。 9. 不绕过数据审核流程。 10. 不为了速度降低数据质量。

社区讨论请保持友善、就事论事；技术分歧以可核验的来源与规范测试为准。
