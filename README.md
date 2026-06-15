<div align="center">

# LUCERNA Archive

### A Quiet Place for Your Reading Life

[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*保存阅读人生的数字书房*<br/>
*Preserve the traces of who you were while reading.*

[English](#overview) · [中文](#概述)

</div>

---

## Overview

LUCERNA Archive is a digital reading room that preserves your reading life. Connect your Kindle or WeRead, and your highlights and notes are quietly archived into fragments that carry time, mood, and a sense of space.

This is not a knowledge management tool. It's not a second brain. It's a room where, years later, you can meet the person you were while reading.

> Not a dashboard. Not a second brain. A printed reading room.

## 概述

LUCERNA Archive 是一间保存阅读人生的数字书房。连接 Kindle 或微信读书后，应用将划线与笔记整理成有时间、情绪和空间感的阅读档案。

它关注的不是"知识管理效率"，而是"多年之后还能重新遇见当时读书的自己"。

---

## Features

| | Feature | Description |
|---|---------|-------------|
| 📖 | **Kindle Import** | Parse `My Clippings.txt` with full Chinese & English format support, automatic deduplication |
| 📱 | **WeRead Sync** | One-click sync highlights, notes, and reviews via browser extension or cookie |
| 🏠 | **The Room** | Immersive dark reading room — random fragments slowly surface with breathing animations |
| 📄 | **Fragments** | Floating paper-slip stream of all highlights and notes, filterable by book |
| 🌊 | **Timeline** | Your reading life arranged by season and month, not by numbers |
| 📚 | **Library** | Private book archive — every book becomes its own room |
| 🌐 | **Bilingual UI** | Full Chinese / English interface toggle |
| 🔒 | **Local-First** | All data stays in your browser's IndexedDB — nothing is uploaded, ever |
| 💾 | **Export & Backup** | Export your entire archive as JSON; restore anytime |

---

## Design Language

The interface evokes the atmosphere of a late-night study: deep slate-blue backgrounds, warm wood-brown structures, soft amber lamplight, and paper textures. Animations are slow and breathing — like light shifting in a room, not flashy app feedback.

**Visual keywords:** Midnight · Wood · Warm lamp · Paper · Rain · Film grain · Floating paper slips · Breathing

**Copy principles:** Literary but not pretentious. Short, light, quiet.

| ✅ Do | ❌ Don't |
|-------|----------|
| `Listening to your Kindle.` | `Syncing...` |
| `43 fragments returned tonight.` | `Imported successfully` |
| `You marked this on a quiet night.` | `Total highlights` |

---

## Tech Stack

```
Frontend    React 19 · TypeScript 6 · Vite 8
Database    sql.js (client-side SQLite via IndexedDB)
Auth        Supabase (optional cloud sync)
Extension   Chrome Extension (WeRead one-click import)
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or pnpm

### Install & Run

```bash
# Clone the repository
git clone https://github.com/huyan1349/Archive-web.git
cd Archive-web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Import from Kindle

Drag your Kindle's `My Clippings.txt` into the app window, or click **「导入我的文件」** in the sidebar.

### Sync from WeRead

1. Install the LUCERNA browser extension (see `extension/` directory)
2. Open [weread.qq.com](https://weread.qq.com) and log in
3. The extension automatically captures your session — click sync

---

## Project Structure

```
Archive-web/
├── src/
│   ├── core/
│   │   ├── analysis/        # Reading analysis & Midnight Recall
│   │   ├── auth/            # Supabase authentication
│   │   ├── database/        # IndexedDB data layer with repository pattern
│   │   ├── importer/        # Import pipeline & deduplication
│   │   ├── kindle-db/       # Kindle Clippings parser
│   │   ├── parser/          # Multi-format Clippings parser (zh/en)
│   │   └── weread/          # WeRead API client & sync
│   ├── data/                # React hooks & data providers
│   ├── App.tsx              # Main application shell
│   ├── AuthProvider.tsx     # Auth context
│   ├── LoginPage.tsx        # Supabase login
│   └── DevPanel.tsx         # Development utilities
├── extension/
│   ├── manifest.json        # Chrome Extension manifest
│   ├── background.js        # Service worker
│   ├── lucerna-content.js   # Main content script
│   ├── weread-content.js    # WeRead cookie extraction
│   └── popup.html/js        # Extension popup UI
└── LUCERNA Archive/         # Product documentation
    ├── 01-product-overview.md
    ├── 02-mvp-scope.md
    ├── 03-technical-architecture.md
    ├── 04-development-roadmap.md
    └── 05-design-language.md
```

---

## Data Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   books      │     │  fragments    │     │   imports     │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ id           │◄────┤ book_id       │     │ id            │
│ title        │     │ type          │     │ source_path   │
│ author       │     │ content       │     │ imported_at   │
│ created_at   │     │ note          │     │ imported_count│
│ updated_at   │     │ location      │     │ skipped_count │
└─────────────┘     │ clipped_at    │     │ failed_count  │
                    │ source_hash   │     └──────────────┘
                    │ is_favorite   │
                    └──────────────┘
                           │
                    ┌──────┴───────┐
                    │ fragment_moods│
                    ├──────────────┤
                    │ fragment_id   │
                    │ mood_id       │
                    └──────────────┘
```

**Deduplication strategy:** Stable hash from `book_title + author + type + location + clipped_at + content`, with fallback to `book_title + author + type + location + content` when timestamp is missing.

**Privacy principles:**
- Default write to local IndexedDB only
- No account required
- No uploads
- No AI calls
- No user data in logs

---

## Roadmap

### Phase 1 — MVP ✅
- [x] Kindle Clippings import & parsing
- [x] WeRead sync via browser extension
- [x] The Room / Fragments / Timeline / Library
- [x] Bilingual UI (zh/en)
- [x] Local-first data with export/backup

### Phase 2 — Upcoming
- [ ] AI-powered mood analysis for fragments
- [ ] Dynamic Rooms with spatial layout
- [ ] Midnight Recall — random fragment notifications
- [ ] Menu bar quick-access on macOS
- [ ] Paper warmth adjustment (display settings)
- [ ] Annual reading climate report

### Phase 3 — Exploring
- [ ] Local LLM / embedding for semantic search
- [ ] AirPods & Focus Mode integration
- [ ] iCloud Drive manual backup
- [ ] Vision Pro spatial reading room

---

## License

[MIT](LICENSE)

---

<div align="center">

*Crafted with care by [huyan](https://github.com/huyan1349)*

</div>
