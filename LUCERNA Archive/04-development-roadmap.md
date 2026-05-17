# 04. Development Roadmap

## 开发流程总览

建议用 5 个短阶段推进，每个阶段都能产生一个可演示版本。

开发顺序应当是：

1. 数据先行
2. 导入闭环
3. 基础浏览
4. 氛围塑造
5. macOS 打包

不要一开始就做复杂动画、AI 或 Rooms。先让真实 Kindle 数据稳定进入应用，再让它变得美。

## Stage 0：项目初始化

目标：建立工程骨架。

任务：

- 创建 Tauri + React + TypeScript 项目
- 配置 SQLite 插件或 Rust SQLite 层
- 配置基础路由
- 建立代码规范
- 建立本地开发脚本

产出：

- 可启动的 macOS 桌面窗口
- 空白 The Room 页面
- 初始数据库 migration

## Stage 1：Kindle 导入与解析

目标：完成核心数据入口。

任务：

- 支持用户选择 `My Clippings.txt`
- 实现 clipping block 拆分
- 实现中英文 Kindle 格式解析
- 写入 books / fragments / imports
- 实现 source_hash 去重
- 提供导入结果摘要

产品文案：

- `Listening to your Kindle.`
- `Collecting traces of reading.`
- `43 fragments returned tonight.`

产出：

- 可导入真实 Kindle 摘录
- 可重复导入且不重复
- 解析失败可追踪

## Stage 2：Fragments 与 Library

目标：让用户可以浏览自己的阅读痕迹。

任务：

- Fragments 列表
- 书籍筛选
- 收藏 fragment
- 编辑 fragment 内容
- 手动添加情绪标签
- Library 书籍列表
- 书籍详情页

产出：

- 用户可以从书籍进入摘录
- 用户可以收藏和修正摘录
- 数据修改可持久化

## Stage 3：The Room 与 Timeline

目标：形成产品辨识度。

任务：

- The Room 随机摘录浮现
- 最近导入状态
- Timeline 按年月聚合
- 每个时间段展示代表书籍、关键词、代表摘录
- 建立基础空状态和首次使用引导

产出：

- 打开应用时有“进入书房”的感觉
- 用户能看到阅读人生的基本时间结构

## Stage 4：视觉语言与动效打磨

目标：把工具感降到最低。

任务：

- 深灰蓝、木棕、暖黄、墨色主题
- 纸张纹理和胶片颗粒
- fragment 卡片悬浮感
- 呼吸感动画
- 导入过程动画
- 减少 Dashboard 风格组件

产出：

- 形成 LUCERNA Archive 的第一版视觉气质
- 同步、浏览、回看三个流程都有一致氛围

## Stage 5：打包与内测

目标：让真实用户试用。

任务：

- macOS 打包
- Apple Silicon 优先
- 本地数据备份说明
- 准备示例 `My Clippings.txt`
- 找 3-5 位 Kindle 用户内测
- 收集解析失败样本和体验反馈

产出：

- 可分发 `.dmg`
- 内测反馈列表
- 下一轮迭代优先级

## 第一轮开发建议

第一轮只做 Stage 0 到 Stage 2。完成后再判断 The Room 和 Timeline 的视觉投入程度。

优先级排序：

1. 真实数据能进来
2. 数据不会丢
3. 摘录能被舒服地阅读
4. 产品语言保持文学化
5. 视觉氛围逐步加深

