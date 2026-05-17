# 03. Technical Architecture

## 推荐架构

Phase 1 推荐使用 Tauri + React + TypeScript + SQLite。

原因：

- macOS 桌面体验更轻
- 应用体积小于 Electron
- Rust 后端适合做文件读取、SQLite、系统能力集成
- React 便于快速实现沉浸式 UI
- TypeScript 保证前端数据结构稳定

如果团队更熟悉 Electron，也可以使用 Electron + React + SQLite，但要特别控制包体积、内存和系统感。

## 模块划分

### App Shell

负责：

- macOS 窗口
- 文件选择
- 后续 Kindle 设备检测
- 应用设置

### Importer

负责：

- 读取 `My Clippings.txt`
- 拆分原始 clipping block
- 调用 parser
- 生成 import session
- 去重写入数据库

### Parser

负责：

- Kindle 中英文格式解析
- Highlight / Note / Bookmark 类型识别
- location 与时间提取
- 解析失败记录

### Database

负责：

- SQLite schema
- migration
- repository 查询
- 数据备份和导出能力预留

### UI

负责：

- The Room
- Fragments
- Timeline
- Library
- 后续 Rooms 和 Midnight Recall

## 初版数据库草案

### books

- id
- title
- author
- created_at
- updated_at

### fragments

- id
- book_id
- type
- content
- note
- location
- clipped_at
- source_hash
- is_favorite
- created_at
- updated_at

### imports

- id
- source_path
- imported_at
- total_blocks
- imported_count
- skipped_count
- failed_count

### moods

- id
- name
- created_at

### fragment_moods

- fragment_id
- mood_id

## 去重策略

初版使用稳定 hash：

```txt
book_title + author + type + location + clipped_at + content
```

如果 Kindle 文件缺少时间，则退化为：

```txt
book_title + author + type + location + content
```

去重字段进入 `source_hash`，并建立唯一索引。

## 数据安全原则

- 默认只写入本地 SQLite
- 不创建账号
- 不上传摘录
- 不联网请求 AI
- 不把用户数据写入日志
- 解析失败的原始块只保存在本地数据库中

## 后续可扩展点

- 本地 LLM 或 embedding 服务
- 菜单栏随机摘录
- macOS Focus Mode integration
- iCloud Drive 手动备份
- Vision Pro 空间房间

