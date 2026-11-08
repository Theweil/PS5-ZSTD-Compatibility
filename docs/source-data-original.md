# 原始社区测试数据（逐字存档 / Verbatim Source Archive）

> 本文件是 **PS5 ZSTD Compatibility Database** 的唯一原始资料存档。
> 下方两个代码块中的内容为社区整理清单的逐字副本，**不得修改、重排、精简或"更正"**。
> 任何标准化、拆分、补全和说明都只发生在 `data/*.json` 与 `docs/` 的其他文档中，并保留到本文件的可追溯链接。
>
> 数据来源：用户提供的社区整理清单（社区众包，非维护者实测）。
> 迁移规则见 `docs/DATA-MODEL.md`；状态定义见 `docs/STATUS-DEFINITIONS.md`。

## 元数据

| 项目 | 值 |
| --- | --- |
| 通过表原始记录数 | 85 |
| 问题表原始记录数 | 10 |
| 原始记录合计 | 95 |
| 通过表记录 ID | `P-001` … `P-085` |
| 问题表记录 ID | `F-001` … `F-010` |
| 测试日期 | **原始资料未提供任何测试日期**，不得补造 |
| 主机固件 | **原始资料未提供**，不得补造 |
| 转换器 / 运行库 / 挂载工具版本 | 除备注中出现的 0.3.2 / 0.3.3 等描述外，原始资料没有结构化字段，不得推断 |

### 关于列数的说明

- 表 1（通过表）的原始行首带有 **行号**。字段顺序为：`行号 | 游戏 | PPSA | 压缩格式 | 测试者 | 备注`。
- 表 2（问题表）的任务书文字说明写的是 5 列 `游戏 | PPSA | 症状 | 测试者 | 备注`，但**给出的原始数据行同样带有行号**，因此实际为 6 列：`行号 | 游戏 | PPSA | 症状 | 测试者 | 备注`。
  本存档按**原始行的真实形态**保存（保留行号），不做删改。
- 表 2 **没有压缩格式列**。这 10 条记录的压缩格式在原始数据中是缺失的，迁移时标为 `unknown`，并以 `compression_scope: "zstd_issue_scope"` 记录"该表属于 ZSTD 问题收集范围"这一上下文；该上下文**不是**测试数据，不计入任何压缩格式的测试报告统计。

---

## 表 1：通过表（85 条）

字段顺序：`行号 | 游戏 | PPSA | 压缩格式 | 测试者 | 备注`

```text
1|空之轨迹 the 1st Trails in the Sky 1st|PPSA30117(港)|zstd|nisec_eric|美服 28465
2|空之轨迹 the 2nd Trails in the Sky 2nd|PPSA35304(港)|zstd|nisec_eric|2026-09-17 发售，简中
3|控制：共振 CONTROL: Resonant|PPSA34547|zstd|热心群友|“控制：共振”即港服官方标题；原帖主未知
4|eFootball™（胜利11人） eFootball|PPSA03071(港)|zstd|nisec_eric|免费 Live 版
5|双影奇境 Split Fiction|PPSA08560|zstd|nisec_eric / hmh715|“分裂小说”系机翻已正名
6|鬼武者：剑之道 Onimusha: Way of the Sword|PPSA27836|zstd|nisec_eric / fdong|01.000 / 42G（fdong）
7|EA SPORTS FC 27|PPSA34015|zstd|reddit / hmh715|—
8|跑车浪漫旅 7（GT7） Gran Turismo 7|PPSA01317(美)/01318(亚)|zstd|nisec_eric|—
9|怪物猎人：荒野 Monster Hunter Wilds|PPSA07862(美)|zstd|椒盐洋芋|—
10|人中之龙 极3（如龙3极） Yakuza Kiwami 3 & Dark Ties|PPSA30223|zstd|椒盐洋芋|含 3 外传 Dark Ties
11|WRC Generations（WRC：世代） WRC Generations|PPSA07580(美)/07579(欧)|zstd|椒盐洋芋|无官方中文
12|浪人崛起 Rise of the Ronin|PPSA04539(美)|zstd|铉的小恶魔|—
13|乐一通：古怪运动世界 Looney Tunes: Wacky World of Sports|PPSA19563|zstd|nisec_eric|原“华纳群星”系机翻；官方无中文
14|高达破坏者4（官中：GUNDAM 创坏者4） Gundam Breaker 4|PPSA08065(美)|zstd|nisec_eric|—
15|空战奇兵8：希孚之翼（皇牌空战8） ACE COMBAT 8: Wings of Theve|PPSA24913|zstd|bmoon|“空战奇兵”为系列官方中文
16|对马岛之魂 导演剪辑版 Ghost of Tsushima DC|PPSA02225(美)/03210(亚)|zstd|bmoon|—
17|刺客信条：黑旗 同步重置 AC IV Black Flag: Resynced|PPSA28183|zstd|bmoon|官方繁中《刺客教條：黑旗 同步重置》
18|剑星 Stellar Blade|PPSA13197|zstd|bmoon / hmh715|官方中文名“剑星”（“星刃”非官方）
19|眩晕2 Vertigo 2|PPSA18102|zstd|kuramafly|PSVR2 必须，无中文
20|巨兽贝西摩斯 Skydance's BEHEMOTH|PPSA04962|zstd|kuramafly|PSVR2，官方无中文标题
21|绝对魔权 Absolum|PPSA30856|zstd|nisec_eric|“绝对魔权”为官方中文
22|哈迪斯2 Hades II|PPSA36082|zstd|nisec_eric|官方无中文标题
23|PRAGMATA（识质存在/实质存在） Pragmata|PPSA02530|zstd|nisec_eric|01.300.000 / 35G；官方无中文，两译名均为社区译
24|亰都幻都 -樱花幻舞-（京都幻都） KYOTO XANADU -the Blooming Phantom-|PPSA36992|zstd|nisec_eric|Falcom 新作；官方用字为“亰”
25|维纳斯璀璨假期（奶牌维纳斯假期） DOA Xtreme Venus Vacation PRISM|PPSA25411(日)|zstd|q751733367q|日服 ID（Koei 官方中文），港服 ID 未能核实
26|严阵以待 Ready or Not|PPSA18605|zstd|q751733367q|通用中文名（原“严正以待”有误）
27|黑神话：悟空（黑悟空） Black Myth: Wukong|PPSA23226|zstd|快上楼 / hmh715|—
28|007：初露锋芒 007 First Light|PPSA11386|zstd|fdong|01.018 / 50G
29|艾尔登法环 Elden Ring|PPSA04608|zstd|fdong|01.018.001 / 90G
30|⚠️ 共鸣瘟疫传说传承（未识别） 疑 A Plague Tale 系列|PPSA30601|zstd|fdong|01.002.000 / 66G；唯一未能识别的名称，建议核对原始下载名
31|匹诺曹的谎言（全DLC） Lies of P|PPSA10621|zstd|fdong|01.012 / 53G
32|人中之龙7：光与暗的去向（如龙7） Yakuza: Like a Dragon|PPSA02690|zstd|fdong|01.003 / 43G
33|死亡搁浅2：冥滩之上 Death Stranding 2|PPSA02015|zstd|nisec_eric|01.013 / 96G
34|羊蹄山之魂 Ghost of Yotei|PPSA26344|zstd|zhangyun111|官方简中；GitHub 反馈均失败；问题表亦收录
35|歧路旅人0 Octopath Traveler 0|PPSA28495(港)|zstd|zylcw1122|日服 28492
36|零 ～红蝶～ REMAKE Fatal Frame II: Crimson Butterfly Remake|PPSA32803(亚)|zstd|zylcw1122|欧美日 32802
37|生化危机4 重制版 黄金版 RE4 Remake Gold|PPSA07411(美)|zstd|zylcw1122|美服本体/黄金同 ID；亚服黄金版 09418
38|最终幻想：共鸣 FINAL FANTASY RESONANCE|PPSA34140(亚)|zstd|zylcw1122|国际版 31544；简中
39|空洞骑士 Hollow Knight: Voidheart Ed.|PPSA34971|zstd|zylcw1122 / hmh715|—
40|人中之龙8（如龙8） Like a Dragon: Infinite Wealth|PPSA06435(美)|zstd|zylcw1122|—
41|生化危机9：安魂曲（生化9） Resident Evil Requiem|PPSA30803|zstd|jhmai1212 / hmh715|—
42|沙罗周期（SAROS） SAROS|PPSA07634(港)|zstd|jhmai1212|“沙罗周期”即官方中文，非机翻；美服 07632
43|街头霸王6（街霸6） Street Fighter 6|PPSA02632|zstd|yueliang137|—
44|金刚狼 Marvel's Wolverine|PPSA03671|zstd / LZ4|tiga6367 / hmh715|tiga6367 版本存疑（zstd），hmh715 为 LZ4；问题表亦收录
45|王国之心3 ⚠️ KINGDOM HEARTS Collection [I～III]|PPSA35901(美)|zstd|chenlidong|KH3 无 PS5 独立版（PS4=CUSA15072），所测疑为此合集
46|恶魔城：贝尔蒙特诅咒 Castlevania: Belmont's Curse|PPSA35399|zstd|zgp_110|官方无中文标题，社区译名
47|胡闹厨房：全都好吃 Overcooked! All You Can Eat|PPSA01528|zstd|hmh715|中文名 zylcw1122
48|使命召唤：黑色行动冷战 COD: Black Ops Cold War|PPSA02053|zstd|hmh715|—
49|索尼克：未知边境 Sonic Frontiers|PPSA03831|zstd|hmh715|01.041.000
50|忍者神龟：考瓦邦加合集 TMNT: The Cowabunga Collection|PPSA04489|zstd|hmh715|官方无中文
51|TIEBREAK 大满贯版（ATP/WTA） TIEBREAK – Grand Slam Edition|PPSA14453|zstd|hmh715|官方无中文
52|魂斗罗：加鲁加行动 Contra: Operation Galuga|PPSA15368|zstd|hmh715|—
53|富甲天下11 Richman 11|PPSA16960|zstd|hmh715|—
54|宇宙机器人 ASTRO BOT|PPSA21567|LZ4|hmh715|问题表亦收录（卡 logo，结果冲突）
55|使命召唤：现代战争2 COD: Modern Warfare 2|PPSA23015|zstd|hmh715|—
56|乐高旅行者 LEGO Voyagers|PPSA23732|zstd|hmh715|粉丝译名，官方无中文
57|使命召唤：现代战争3 COD: Modern Warfare 3|PPSA24266|zstd|hmh715|—
58|航海王：海贼无双4 One Piece: Pirate Warriors 4|PPSA27500|zstd|hmh715|Steam 官中“ONE PIECE 海贼无双4”
59|星球大战：银河赛车手 Star Wars: Galactic Racer|PPSA28416|zstd|hmh715|官方简中即“银河赛车手”
60|寂静岭：Townfall SILENT HILL: Townfall|PPSA33286|zstd|hmh715|“落镇”系机翻勿用，官方无中文
61|玩具总动员3：完整版 Toy Story 3: Complete Edition|PPSA33626|zstd|hmh715|2026-10 复刻，官方无中文
62|双人成行 It Takes Two|PPSA02424|zstd|hmh715|01.500.000
63|最后生还者 第一部 The Last of Us Part I|PPSA07644|zstd|hmh715|即“美末日1”；问题表待确认（结果冲突）
64|索尼克赛车：交叉世界 Sonic Racing: CrossWorlds|PPSA08804|zstd|hmh715|官方名“交叉世界”（原“跨世界”有误）
65|乐高蝙蝠侠：黑暗骑士之遗 LEGO Batman: Legacy of the Dark Knight|PPSA16833|zstd|hmh715|2026-05-26 新作，非 2008 老乐高蝙蝠侠
66|刺客信条：影 Assassin's Creed Shadows|PPSA20397|zstd|hmh715|—
67|NBA 2K27|PPSA35889|zstd|hmh715|—
68|阿喀琉斯：幸存者 Achilles: Survivor|PPSA30454|zstd|aiwo1986|—
69|奥特罗斯 Ultros|PPSA16280|zstd|aiwo1986|—
70|换影循迹 Bionic Bay|PPSA23767|zstd|aiwo1986|—
71|九山：狼之城 Kusan: City of Wolves|PPSA29617|zstd|aiwo1986|—
72|魔骑少女 The Knight Witch|PPSA08045|zstd|aiwo1986|—
73|全面战争模拟器 Totally Accurate Battle Simulator|PPSA06081|zstd|aiwo1986|—
74|光与影：33号远征队 Clair Obscur: Expedition 33|PPSA17599|zstd|rjwnjc|TGA2025 年度最佳；编号来源飞龙口袋（单源）
75|圣兽之王 Unicorn Overlord|PPSA09894|zstd|zylcw1122|Sony 官方页另见 PPSA20318（疑另一 SKU）
76|地狱之刃2：塞娜的传说 Senua's Saga: Hellblade II|PPSA25991(港)|zstd|mukecool|Xbox 官方简中《地狱之刃 II：塞娜的献祭》；PKG 档案名“塞娜的史诗”
77|生化危机2 重制版 Resident Evil 2|PPSA04290(港)|zstd|mukecool|PS5 原生版；PSN 港服名保留英文
78|生化危机3 重制版 Resident Evil 3|PPSA03954(港)|zstd|mukecool|PS5 原生版；PSN 港服名保留英文
79|生灵重塑 REANIMAL|PPSA23372(港)|zstd|mukecool|“生灵重塑”即 Steam 官方简中名（Tarsier/THQ Nordic）；试玩 PPSA29683
80|战锤40K：星际战士2 Warhammer 40,000: Space Marine 2|PPSA04451(港/欧)|zstd|mukecool|美服 04452；飞龙口袋黄金档为美服 04452
81|死亡回归 Returnal|PPSA01287(港)|zstd|www14213|亚服 SKU HP9000-PPSA01287
82|恶魔之魂 重制版 Demon's Souls|PPSA01340(港)|zstd|www14213|亚服 SKU HP9000-PPSA01340
83|消逝的光芒2 人与仁之战 Dying Light 2 Stay Human|PPSA02261(港)|zstd|mukecool|0.3.2 下转换报错（见修订记录）；换 ampr-emu-ng 0.3.3 后成功运行——首个 0.3.3 成功案例
84|WRC 10 FIA 世界汽车拉力锦标赛 WRC 10 FIA World Rally Championship|PPSA03589|zstd|椒盐洋芋|0.3.2 黑屏（问题表原条目）；更新 libSceAmpr-0.3.3.sprx 后正常运行——0.3.3 成功案例；PPSA 为测试者提供
85|明末：渊虚之羽 WUCHANG: Fallen Feathers|PPSA09518|zstd|wupeng2|官方简中名“明末：渊虚之羽”；SKU UP4040-PPSA09518（含豪华版同 ID）
```

---

## 表 2：问题表（10 条）

字段顺序（按原始行）：`行号 | 游戏 | PPSA | 症状 | 测试者 | 备注`

```text
1|宇宙机器人（小机器人2） ASTRO BOT|PPSA21567|卡 logo|nisec_eric|GitHub issue 追踪中；有人用 0.5.2 转换成功但小文件数 > 40000；与 P-054 冲突（hmh715 LZ4 通过）
2|羊蹄山之魂 Ghost of Yotei|PPSA26344|卡 logo|nisec_eric|与 P-034 冲突（zhangyun111 通过，GitHub 均失败）
3|金刚狼 Marvel's Wolverine|PPSA03671|黑屏|nisec_eric|与 P-044 冲突（tiga6367 存疑 / hmh715 LZ4 通过）
4|赤色沙漠 Crimson Desert|—|黑屏|nisec_eric|—
5|瑞奇与叮当：时空跳转 Ratchet & Clank: Rift Apart|—|黑屏|nisec_eric|官方中文名“时空跳转”
6|战神：诸神黄昏 God of War Ragnarök|—|黑屏|nisec_eric|官方中文名“诸神黄昏”
7|最后生还者 第一部（美末日1） The Last of Us Part I|PPSA07644|待确认|nisec_eric|外网称可运行；P-063 hmh715 通过
8|忍者龙剑传4 Ninja Gaiden 4|—|运行失败|www14213|—
9|尘埃5 DIRT 5|PPSA01551|无法运行|yttx1228|—
10|仁王３ Nioh 3|PPSA32786(港)/32785(欧)|signal 11 出错|kofdaibin|港服页 SKU 直出；试玩为 PPSA34974/34975
```

---

## 不可变更的原始事实（迁移检查点）

以下事实在迁移与后续维护中都必须保持可追溯，任何一条被破坏都应导致 CI 失败：

1. `P-034`（zhangyun111 通过）与 `F-002`（nisec_eric 卡 logo）为同一游戏、不同测试者的相反结果，**两个报告必须同时保留**，聚合状态为 `conflict`。
2. `P-054` 明确是 **LZ4** 成功报告；`F-001` 是问题报告，不得与 ZSTD 混算。
3. `P-044` 同时含 `zstd` 与 `LZ4` 信息，必须拆成两条独立测试报告：`tiga6367` 的 ZSTD 版本存疑、`hmh715` 为 LZ4 通过；`F-003` 是独立黑屏报告。
4. `P-063` 通过报告与 `F-007` 待确认报告必须同时保留，不得简单判定为全成功或全失败。
5. `P-030` 游戏名称无法识别，**不得自行猜测替换**。
6. `P-025` 只有日服 PPSA，**不得虚构港服 ID**。
7. `P-075` 的 `PPSA20318` 只能作为**未确认候选 SKU**。
8. `P-080` 备注中的美服 `04452` 等编号必须保留，但**不得覆盖**原始港/欧服 SKU。
9. `P-037` 备注中的亚服黄金版 `09418` 必须保留，但**不得擅自合并**到原始美服 SKU。
10. `F-004`～`F-006`、`F-008` 没有 PPSA，必须保留，网站显示"待确认"。
11. 问题表**没有压缩格式列**，不得把"ZSTD 问题收集范围"伪装成这 10 条记录的明确压缩格式。
12. 所有测试者名称、备注、游戏名称、PPSA 原文必须逐字保留。

## 授权说明

本存档只保留社区贡献者提供的**事实性元数据**（游戏名称、PPSA、结果描述、贡献者昵称、文字备注）。
不包含任何游戏文件、PKG、密钥、截图、日志正文或第三方享有版权的原创内容。
对无法确认授权的第三方资料，只保留必要描述与合法来源链接，不复制原文。
详见 `DATA-LICENSE.md`。
