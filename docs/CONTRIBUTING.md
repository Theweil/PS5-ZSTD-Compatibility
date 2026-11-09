# 数据维护细则 / Data Maintenance Notes

完整的贡献流程、Issue 表单入口与 PR 检查清单见仓库根目录的 [CONTRIBUTING.md](../CONTRIBUTING.md)。
本页只记录**直接编辑 `data/*.json` 时**必须遵守的细则。

For the full contributor workflow, issue forms and PR checklist see [CONTRIBUTING.md](../CONTRIBUTING.md).

## 文件职责 / File responsibilities

| 文件 | 谁可以改 | 说明 |
| --- | --- | --- |
| `docs/source-data-original.md` | **只读，永不修改** | 95 行原始表格的逐字存档 |
| `data/sources.json` | 仅当新增原始清单时追加 | 逐字镜像；`raw_line` 必须与存档完全一致。社区 Issue 报告**不写入**此文件 |
| `data/games.json` | 新增游戏 / **描述说明** / 名称 / SKU 变更 | 一款游戏一条记录；正式 SKU 只来自 PPSA 列 |
| `data/tests.json` | 新增独立测试 / 修正结果 | 一次独立报告一条记录；必带 `source_record_ids`（存档用 `P/F-nnn`，社区提交用 `I-nnn`） |
| `data/regions.json` | 地区代码表扩展 | 不随意新增推断地区 |
| `data/updates.json` | 每次数据或项目事件 | 只记项目事件日期，**不是**测试日期 |
| `schema/*.schema.json` | 数据模型变更 | 必须与 JSON 同步 |
| `CHANGELOG.md` | 每次数据变化 | 逐项记录 |
| `README.md` | 统计数字变化时 | 用 `npm run stats -- --write` 更新快照 |

## 每次数据变更的四步 / Four steps per change

1. **改 JSON**：保持所有 `*_raw` 字段逐字、未知值 `null` / `unknown`。
2. **改 CHANGELOG**：写清新增/修改/删除了什么、涉及哪些 `source_record_ids`。
3. **跑校验**：`npm ci && npm test`；统计变化时再跑 `npm run stats -- --write`。
4. **提 PR**：使用模板勾选数据准确性清单，等待审核。

## CI 会拒绝的情况 / CI will fail when

- 出现重复 `id` / `test id` / `source_record_id`
- PPSA 不符合 `^PPSA[0-9]{5}$`，或原始 PPSA 无法追溯到某个游戏 SKU
- `game_id` 指向不存在的游戏
- 压缩格式或结果不在枚举内；问题表记录被填上明确格式
- `P-001`…`P-085` / `F-001`…`F-010` 任一缺失，或某条原始记录没有任何测试引用
- `raw_line` / `notes` / `tester_raw` / `game_title_raw` / `ppsa_raw` 与原始存档不一致
- `P-044` 的 ZSTD / LZ4 被合并；`P-034`/`F-002` 等冲突报告被覆盖；候选 SKU 被提升为正式 SKU
- 社区来源记录被标记为 `maintainer_reproduced`，出现补造的测试日期，或 Issue 报告缺少 `issue_url` / `I-nnn` 来源 ID
- README 的 `STATS-SNAPSHOT` 与 JSON 自动统计不一致

## 修改游戏描述说明 / Editing game descriptions

在 `data/games.json` 中按 `id` 找到游戏，填写 `description_zh`（中文）、`description_en`（英文）或 `description`（通用）。三者都允许 `null`；`description` **必须保留键**，删除时改成 `null`。

- 只改这三个字段即可，网站详情会按当前界面语言自动选择并显示；同时这三个字段也会进入搜索索引。
- **不要**改 `title_original`（原始名称逐字存档）或 `tests.json` 里的 `notes`（CI 逐字校验）。
- `notes`（`games.json`）是维护者备注，与面向读者的 `description*` 不同，不要混用。
- 描述变更不影响统计，`npm run stats -- --write` **不需要**；但 `npm test` 必须跑，`CHANGELOG.md` 必须记一条。
- 详细示例见 [DATA-MODEL.md](DATA-MODEL.md#修改游戏描述说明最常见的一次数据变更)。

## 命名约定 / Naming

- `games.json` 的 `id`：小写 kebab-case slug，稳定不变；跨表重复出现的游戏共用一个 id。
- `tests.json` 的 `id`：`test-0001` 递增，不复用、不重排。
- 新增正式测试报告若对应一条新的原始记录，先在 `sources.json` 追加该记录并分配 `P-xxx` / `F-xxx`。
- 社区 Issue 表单提交用 `I-nnn`（编号 = Issue 号，补齐 3 位），并在 `tests.json` 写 `source_type: "issue"` + `issue_url`；`sources.json` 与逐字存档保持 95 条不变。
