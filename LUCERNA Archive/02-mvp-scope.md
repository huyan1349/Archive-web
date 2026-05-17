# 02. MVP Scope

## MVP 目标

做出一个可安装、可导入、可浏览、气质明确的 macOS 本地应用。

MVP 的成功标准不是“功能齐全”，而是用户第一次连接 Kindle 后，能感到自己的阅读痕迹被认真保存了。

## 必须包含

### 1. Kindle 导入

- 识别用户手动选择的 `My Clippings.txt`
- 后续再支持自动检测 Kindle 挂载路径
- 支持重复导入去重
- 保留原始文本片段，便于解析修正

### 2. Clippings 解析

需要解析：

- 书名
- 作者
- 类型：Highlight / Note / Bookmark
- 内容
- Location
- 时间
- 原始来源块

优先支持中文和英文 Kindle 常见格式。异常格式先进入未解析队列，不阻断主流程。

### 3. 本地数据库

使用 SQLite 保存：

- books
- fragments
- imports
- moods
- fragment_moods

数据必须可迁移、可备份，避免把核心数据锁死在应用私有结构里。

### 4. The Room

首页应包括：

- 深色背景
- 随机摘录缓慢浮现
- 最近一次同步状态
- 进入 Fragments / Timeline / Library 的低干扰入口

### 5. Fragments

展示所有摘录和笔记：

- 按时间倒序
- 按书籍筛选
- 收藏
- 简单编辑
- 添加手动情绪标签

### 6. Timeline

基础版本先按月份和年份聚合：

- 某年某月读过哪些书
- 该时期出现过哪些高频情绪标签
- 展示代表性摘录

### 7. Library

书籍档案基础页：

- 书名
- 作者
- 摘录数量
- 最近摘录时间
- 进入该书的全部 fragments

## 延后到 Phase 2

- 自动 AI 情绪分析
- Rooms 动态空间
- Midnight Recall
- 菜单栏随机摘录
- AirPods / 专注模式联动
- 本地 embedding
- 年度阅读气候
- Vision Pro 空间书房

## MVP 验收标准

1. 用户能导入一份真实 Kindle `My Clippings.txt`。
2. 解析成功率在常见中英文格式中达到可用水平。
3. 重复导入不会产生重复 fragment。
4. 关闭应用再打开后，数据仍完整存在。
5. The Room、Fragments、Timeline、Library 四个页面可以连贯使用。
6. 同步流程中不出现冷冰冰的工程提示文案，例如 `Syncing...`。

