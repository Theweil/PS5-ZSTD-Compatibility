# 数据许可 / Data Licence

[English below](#data-licence-en)

## 适用范围 / Scope

本项目**自行整理、结构化、规范化**的兼容性元数据采用
**[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)** 许可：

- `data/games.json`、`data/tests.json`、`data/sources.json`、`data/regions.json`、`data/updates.json`
- `docs/source-data-original.md` 中由本项目添加的说明、编号体系、迁移规则与文档结构
- `schema/*.schema.json`、`docs/` 中本项目撰写的文档

代码部分（网站、脚本、工作流、Schema 文件）采用 [MIT](LICENSE)。

### 使用条件 / Conditions

使用这些数据时，请注明来源，例如：

> 数据来源：PS5 ZSTD Compatibility Database（<https://github.com/Theweil/PS5-ZSTD-Compatibility>），社区共同维护，CC BY 4.0。

并请保留以下重要事实：

- 数据来自社区报告，**不是**维护者独立验证结论；
- 85 条通过表原始记录不代表 85 款已验证游戏；
- ZSTD 与 LZ4 结论不能互推；格式未注明的报告不属于任何格式；
- 相互矛盾的报告会同时保留。

## 明确不主张权利的内容 / What we do NOT claim

本项目**不主张**、也**不声称拥有**以下内容的版权，且从未将它们复制进仓库：

- 游戏文件、PKG、密钥、license 文件、破解或绕过保护措施的内容；
- 玩家或第三方制作的截图、录像、日志全文、商店页面原文、论坛或群聊原创文字；
- 游戏名称、商标、封面、角色形象、官方文案（权利归各自权利人）；
- 第三方网站、数据库、社区清单中享有版权的原创表达。

`data/sources.json` 与 `docs/source-data-original.md` 只保存**事实性元数据**：游戏名称字符串、PPSA 编号、压缩格式、结果描述、测试者昵称与简短文字备注。这些是事实记录，不是对第三方原创表达的主张；测试者昵称按原始清单逐字保留，仅作署名与溯源，不表示该项目拥有这些昵称的权利。

对于**无法确认授权**的第三方资料：

- 不直接复制原文、图片或完整日志；
- 只保留必要的客观描述与合法来源链接；
- 若权利人提出异议，可在核实后移除相关描述或链接。

## 贡献者授权 / Contributor attribution

提交 Issue / PR 即表示：你确认所提交的信息是你有权提供的事实性元数据或你自己的原创描述，并同意按 CC BY 4.0 供本项目收录与再分发。
请不要提交你没有权利提供的内容。原始贡献者署名（`tester`、`tester_raw`、`source_record_ids`）会被保留。

## 免责 / Disclaimer

数据按「现状」提供，不作任何明示或默示保证。兼容性结果受主机固件、游戏版本、转换器、运行库、挂载工具与地区 SKU 影响，仅供社区参考。使用相关工具请遵守所在地法律与平台服务条款。

---

<a id="data-licence-en"></a>

## Data Licence (EN)

The compatibility metadata **curated and structured by this project** — `data/*.json`, the project-authored parts of `docs/source-data-original.md`, `schema/*.schema.json` and documentation — is licensed under **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**. The project's code (`site/`, `scripts/`, workflows) is [MIT](LICENSE).

Attribution example: *"Data source: PS5 ZSTD Compatibility Database (https://github.com/Theweil/PS5-ZSTD-Compatibility), community-maintained, CC BY 4.0."* Please also preserve the caveats: these are community reports, not maintainer reproductions; 85 pass-table rows are not 85 verified games; ZSTD and LZ4 results are separate; conflicting reports are retained.

**We do not claim copyright over, and do not copy,** any game files, PKGs, keys, circumvention content, third-party screenshots, videos, full logs, storefront text, game titles/trademarks, cover art, characters, official copy, or original expressions from third-party sites and community lists. `sources.json` and the verbatim archive contain only factual metadata (title strings, PPSA identifiers, compression format, result descriptions, contributor nicknames and brief notes). Contributor nicknames are preserved verbatim for attribution and traceability only.

For third-party material whose licence cannot be confirmed, only a necessary factual description and a lawful source link are kept — never the original text, image or full log. Rights holders may request removal after verification.

By submitting an Issue or PR you confirm the information is factual metadata you are entitled to provide (or your own original description) and agree it may be included and redistributed under CC BY 4.0. Data is provided "as is", without warranty; results depend on firmware, game version, converter, runtime, mount tool and regional SKU and are for community reference only.
