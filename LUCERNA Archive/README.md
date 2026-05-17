# LUCERNA Archive

> A Quiet Place for Your Reading Life.

LUCERNA Archive 是一款面向 Kindle 用户的 macOS 本地阅读记忆系统。它不是 Kindle 管理工具、笔记整理软件或知识库，而是一个保存阅读痕迹的数字书房。

## 产品一句话

把 Kindle 摘录从“信息条目”重新变成带有时间、情绪与空间感的阅读记忆。

## 核心定位

- 类型：Reading Memory System
- 平台：macOS
- 数据来源：Kindle 本地 `documents/My Clippings.txt`
- 数据原则：完全本地优先，不上传、不联网、不做云端分析
- 体验关键词：安静、文艺、极简、深夜、纸张、暖灯、阅读痕迹

## Phase 1 目标

先做一个小而完整的桌面 MVP：

1. 能识别 Kindle 并导入 `My Clippings.txt`。
2. 能稳定解析书名、作者、摘录、笔记、位置与时间。
3. 能把数据存入本地 SQLite。
4. 能展示 The Room、Fragments、Timeline、Library 四个基础区域。
5. 能用统一的文学化产品语言完成一次完整同步体验。

## 不做什么

Phase 1 暂不做以下内容：

- 云同步
- 账号系统
- 社区分享
- Web 端
- 复杂知识图谱
- KPI 化的阅读统计
- 强依赖联网大模型的 AI 分析

## 推荐技术方向

- 桌面框架：Tauri 或 Electron
- 前端：React + TypeScript
- 本地数据库：SQLite
- 状态管理：轻量 Zustand 或 React Query
- 视觉实现：CSS 动画优先，少量 Canvas/WebGL 可后置
- 打包目标：macOS Apple Silicon 优先

## 文档结构

- `01-product-overview.md`：产品总体说明
- `02-mvp-scope.md`：MVP 范围与验收标准
- `03-technical-architecture.md`：技术架构与数据设计
- `04-development-roadmap.md`：具体开发阶段
- `05-design-language.md`：UI、文案与动效原则

