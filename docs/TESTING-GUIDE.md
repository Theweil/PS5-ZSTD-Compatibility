# 兼容性测试指南 / Compatibility Testing Guide

[English below](#compatibility-testing-guide-en)

本指南说明如何产生一条**可核验、可长期维护**的测试报告。数据库的可信度取决于字段是否真实、是否可追溯，而不是结果数量。

> 本项目只收录**事实性元数据**。请勿上传游戏文件、PKG、密钥、破解内容或第三方享有版权的截图与日志。

---

## 1. 一次测试 = 一条独立报告

- 同一游戏、不同测试者 → 各提交一条。
- 同一游戏、不同压缩格式（ZSTD / LZ4）→ 各提交一条，**不要合并**。
- 同一游戏、不同地区 SKU（PPSA）→ 若分别测试过，各提交一条。
- 一次测试的通过结论**不会覆盖**其他人的失败结论；两者都会保留。

## 2. 测试前记录环境

| 字段 | 记录内容 | 未知时 |
| --- | --- | --- |
| `ps5_firmware` | PS5 主机固件版本 | `unknown` |
| `ppsa` | 完整 PPSA 编号，如 `PPSA26344` | `unknown` / 待确认 |
| `region` | 港 / 美 / 欧 / 日 / 亚 / 多地区 | `UNKNOWN` |
| `game_version` | 游戏版本字符串（如 `01.018`） | `unknown` |
| `compression` | 实际使用的压缩格式：`zstd` 或 `lz4` | `unknown`，**不要因为本库以 ZSTD 为主就默认填 zstd** |
| `converter` | 转换器名称与版本 | `unknown` |
| `runtime_version` | 运行库名称与版本（如 `libSceAmpr-0.3.3.sprx`） | `unknown` |
| `mount_tool` | 挂载工具与版本 | `unknown` |
| `tested_at` | 实际测试日期 `YYYY-MM-DD` | `unknown`；**不要补造** |

**特别注意**：版本号出现变化时，请把"变化前"与"变化后"当作两条不同的观察记录，并在备注里写明。
初始数据 `P-083`、`P-084` 就是这样记录 0.3.2 → 0.3.3 变化的：结构化字段保持 `null`，叙述保存在 `notes` 与 `history[]`，避免把无法归类的字符串硬塞进"转换器"或"运行库"。

## 3. 测试执行与结果判定

1. 确认测试的 PPSA / SKU 与游戏版本，避免把试玩版、豪华版、合集的编号混用。
2. 只改变一个变量（压缩格式、转换器版本或运行库版本），否则结论无法归因。
3. 记录观察到的现象，落在以下四选一：

| 单条报告结果 | 含义 |
| --- | --- |
| `pass` | 成功运行，未见明显限制 |
| `fail` | 卡 logo、黑屏、运行失败、崩溃、无法运行等 |
| `partial` | 能运行但有明显限制或部分功能异常 |
| `unknown` | 无法判断（例如只有第三方转述、结果存疑） |

4. 症状文字（如"卡 logo"、"signal 11 出错"）写入 `symptom`；原始备注逐字写入 `notes`。

## 4. 证据 / Evidence

- 优先提供你自己产生的可公开文字描述：现象、报错文字、复现步骤。
- 需要截图或日志时使用**合法来源链接**，填入 `evidence[]`：`{ "label": "…", "url": "https://…" }`。
- 不要复制第三方享有版权的原创内容；无法确认授权的资料只写必要描述 + 链接。
- 没有证据也可以提交，但请在备注写明「无证据，社区报告」，不要把无证据的记录标成维护者复现。

## 5. 验证级别 / Verification

| 值 | 含义 |
| --- | --- |
| `community_report` | 社区成员提交的报告（**本项目初始 95 条全部属于此类**） |
| `single_source` | 仅单一来源、未经交叉验证（如 `P-074`） |
| `maintainer_reproduced` | 维护者按本指南独立复现并留有证据 |
| `unknown` | 无法判断 |

社区报告**不能**直接称为维护者独立复现。本库当前的 `maintainer_reproductions` 统计为 0。

## 6. 提交

使用 [新增测试报告表单](../.github/ISSUE_TEMPLATE/new-test.yml) 或 [报告兼容性问题表单](../.github/ISSUE_TEMPLATE/report-problem.yml)。
未知项一律填 `unknown`。提交后由管理员核实 → 更新 JSON → 自动校验 → PR 审核 → 发布。

## 7. 常见错误

- ❌ 把 85 条通过表原始记录说成「85 款已验证游戏」
- ❌ 把 ZSTD 通过当成 LZ4 通过
- ❌ 把备注中出现的编号（如 `美服 04452`）提升为正式 SKU
- ❌ 把缩写 `01318` 在没有上下文时补全成 `PPSA01318`
- ❌ 为没有日期的记录补一个"大概的日期"
- ❌ 把机翻名（如"分裂小说""星刃""落镇"）当作官方名称
- ❌ 删除或修改 `docs/source-data-original.md`

---

<a id="compatibility-testing-guide-en"></a>

## Compatibility Testing Guide (EN)

One independent test = one report. Different testers, compression formats (ZSTD / LZ4) and regional SKUs are reported separately; a pass report never overwrites a fail report.

Record the environment **before** testing: `ps5_firmware`, `ppsa`, `region`, `game_version`, `compression`, `converter`, `runtime_version`, `mount_tool`, `tested_at`. Use `unknown` for anything you did not observe — never guess a PPSA, version or date, and never default to `zstd` just because the project is named after it. When a version change flips the outcome, keep both observations in `notes` / `history[]` instead of forcing ambiguous strings into structured fields.

Classify a single report as `pass`, `fail`, `partial` or `unknown`; put observed symptoms in `symptom` and verbatim notes in `notes`. Evidence should be your own public description or a legally hosted link in `evidence[]` — no game files, PKGs, keys or third-party copyrighted screenshots/log text.

Verification levels: `community_report` (all 95 initial rows), `single_source`, `maintainer_reproduced`, `unknown`. A community report is never relabelled as a maintainer reproduction; the current maintainer-reproduction count is 0.

Submit via the [new-test](../.github/ISSUE_TEMPLATE/new-test.yml) or [report-problem](../.github/ISSUE_TEMPLATE/report-problem.yml) issue form. Issues are verified by a maintainer, then applied to JSON, validated, reviewed in a PR and published.
