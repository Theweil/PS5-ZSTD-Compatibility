# Pull Request — PS5 ZSTD Compatibility Database

<!--
数据变更 PR 检查清单。请逐项确认；不满足的项请说明原因。
Checklist for data-changing PRs. Explain anything you cannot satisfy.
-->

## 变更类型 / Type of change

- [ ] 新增游戏 / New game
- [ ] 新增独立测试报告 / New independent test report
- [ ] 修正名称 / Title correction
- [ ] 修正 PPSA / 地区 SKU / PPSA or SKU correction
- [ ] 修正测试结果 / Test result correction
- [ ] 网站 / 文档 / 工具链 / Site, docs or tooling
- [ ] 其他 / Other：______

## 关联 / Related

- 关联 Issue：<!-- 例如 #12 -->
- 涉及的原始记录 ID：<!-- 例如 P-034、F-002；无则填 none -->

## 数据准确性 / Data accuracy

- [ ] 所有新增/修改的字段都有可核验来源；未知值使用 `null` 或明确的 `unknown`，没有编造
- [ ] 未修改 `docs/source-data-original.md` 中的任何一行（原始存档只读）
- [ ] 未删除或覆盖任何已有的独立测试报告，包括相互冲突的报告
- [ ] ZSTD 与 LZ4 分开存储；格式未注明的记录保持 `compression: "unknown"`
- [ ] 疑似 SKU 只放在 `candidate_skus` 且 `confidence: "unconfirmed"`，未并入正式 `skus`
- [ ] 社区报告没有被标记为 `maintainer_reproduced`
- [ ] 未上传游戏文件、PKG、密钥、截图或任何第三方享有版权的内容
- [ ] 如新增了证据链接，链接指向合法来源

## 工程检查 / Engineering checks

- [ ] 已本地运行 `npm ci && npm test`（校验 / README 统计核对 / 构建）并全部通过
- [ ] 如修改了统计结果，已运行 `npm run stats -- --write` 更新 README 的 `STATS-SNAPSHOT`
- [ ] 如修改数据模型，已同步更新 `schema/*.schema.json` 与 `docs/DATA-MODEL.md`
- [ ] 已在 `CHANGELOG.md` 记录本次数据变化
- [ ] 网站统计、列表、详情不需要手改 HTML —— 全部由 `data/*.json` 驱动

## 说明 / Notes

<!-- 简述变更内容、验证方式与任何遗留问题。 -->
