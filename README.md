# LUCERNA Archive

**A Quiet Place for Your Reading Life.**

LUCERNA Archive 是一间保存阅读人生的数字书房。连接 Kindle 或微信读书后，应用将划线与笔记整理成有时间、情绪和空间感的阅读档案。

它关注的不是"知识管理效率"，而是"多年之后还能重新遇见当时读书的自己"。

## Features

- **Kindle 导入** — 解析 `My Clippings.txt`，支持中英文格式，自动去重
- **微信读书同步** — 通过浏览器扩展或 Cookie 一键同步划线、笔记和书评
- **The Room** — 深色书房首页，随机摘录缓慢浮现，呼吸感动画
- **Fragments** — 漂浮纸片式摘录流，按时间倒序，支持按书筛选
- **Timeline** — 阅读人生时间线，按月份和季节聚合
- **Library** — 私人藏书档案，每本书形成一个独立房间
- **中英双语** — 完整的中文/英文界面切换
- **本地优先** — 数据存储在浏览器 IndexedDB，不上传任何内容
- **导出/备份** — 支持档案导出为 JSON，可随时恢复

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Supabase** — 认证与云端同步（可选）
- **sql.js** — 客户端 SQLite 数据库
- **Chrome Extension** — 微信读书一键导入

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Kindle 导入

将 Kindle 设备中的 `My Clippings.txt` 拖入应用窗口，或在侧边栏点击「导入我的文件」。

### 微信读书同步

1. 安装 LUCERNA 浏览器扩展（见 `extension/` 目录）
2. 打开微信读书网页版并登录
3. 扩展自动捕获 Cookie，一键同步

## Design Language

界面追求深夜书房的氛围感：深灰蓝背景、木棕结构、暖黄灯光、纸张纹理。动效缓慢有呼吸感，文案文学化但不装腔。

> Not a dashboard. Not a second brain. A printed reading room.

## Project Structure

```
src/
├── core/
│   ├── analysis/     # 阅读分析 & Midnight Recall
│   ├── auth/         # Supabase 认证
│   ├── database/     # IndexedDB 数据层
│   ├── importer/     # 导入 & 去重
│   ├── kindle-db/    # Kindle 解析
│   ├── parser/       # Clippings 解析器
│   └── weread/       # 微信读书客户端
├── data/             # React hooks & 数据提供者
├── App.tsx           # 主应用
└── ...
extension/            # Chrome 浏览器扩展
```

## License

MIT

---

© huyan
