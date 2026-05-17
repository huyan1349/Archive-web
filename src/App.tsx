import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import DevPanel from './DevPanel'
import {
  createDatabase,
  createRepositoryAdapter,
  importClippings,
  seedIfNeeded,
  type Book,
  type Fragment,
  type ImportRecord,
} from './core'

type Lang = 'zh' | 'en'
type Page = 'room' | 'fragments' | 'timeline' | 'library' | 'book' | 'settings'

const copy = {
  zh: {
    navRoom: '书房',
    navFragments: '碎片',
    navTimeline: '时间线',
    navLibrary: '藏书',
    eyebrow: '印刷档案 / Kindle 阅读痕迹',
    heroTitle: '一间纸上的房间，收藏那些曾经击中你的句子。',
    intro:
      'Archive 将 Kindle 划线变成安静的印刷碎片：日期、天气、页边距，以及你阅读时的自己。',
    import: '导入示例档案',
    importMine: '导入我的文件',
    importStatus: '正在收集阅读痕迹。',
    cardKicker: '今晚的碎片',
    emptyQuote: '导入之后，这里会浮现你的第一枚阅读碎片。',
    returned: '枚碎片在今晚归来。',
    captionOne: '不是 Dashboard',
    captionTwo: '不是第二大脑',
    captionThree: '是一间纸上的阅读房间',
    fragmentsLabel: 'Fragments / 碎片',
    fragmentsTitle: '像撕下的纸条，被夹回旧书页之间。',
    timelineLabel: 'Reading Timeline / 阅读时间线',
    timelineTitle: '你的阅读人生，按照季节而不是数字排列。',
    libraryLabel: 'Library / 藏书',
    libraryTitle: '每一本书，都会形成一个房间。',
    bookRoomLabel: 'Book Room / 单本书房间',
    latestImport: '最近导入',
    books: '本书',
    fragments: '枚碎片',
    notes: '条笔记',
    highlights: '条划线',
    bookmarks: '枚书签',
    referenceFile: '参照文件',
    allFragments: '全部碎片',
    openRoom: '进入房间',
    noContent: '这是一枚书签，没有摘录正文。',
    source: '来源',
    navSettings: '设置',
    settingsLabel: 'Settings / 设置',
    settingsTitle: '调整灯光，整理书桌，安静地留在房间里。',
    aboutHeader: '关于',
    aboutIntro: 'LUCERNA Archive 是一间保存阅读人生的数字书房。正在安静地归档你的 Kindle 阅读痕迹。',
    developer: '开发者',
    developerName: 'huyan',
    developerEmail: 'huyanxius@gmail.com',
    dataSection: '数据',
    importSection: '导入',
    exportSection: '导出',
    clearData: '清除所有数据',
    clearDataDesc: '删除所有导入的书籍、摘录和标记。此操作不可撤销。',
    clearConfirm: '确认清除所有数据？',
    clearYes: '确认清除',
    clearNo: '取消',
    exportData: '导出档案',
    exportDataDesc: '将所有书籍和摘录导出为备份文件。',
    importData: '导入档案备份',
    importDataDesc: '从之前导出的备份文件中恢复数据。',
    displaySection: '显示',
    languageSection: '语言',
    zhOption: '中文',
    enOption: 'English',
    themeSection: '氛围',
    themeDesc: '即将支持：纸张色温调节',
    statsSection: '档案概况',
    totalBooks: '藏书',
    totalFragments: '碎片',
    totalImports: '导入次数',
    lastImport: '最近导入',
    none: '暂无',
    version: '版本',
    versionNum: 'Phase 1 — MVP',
    tagline: 'A Quiet Place for Your Reading Life.',
  },
  en: {
    navRoom: 'The Room',
    navFragments: 'Fragments',
    navTimeline: 'Timeline',
    navLibrary: 'Library',
    eyebrow: 'Printed archive / Kindle traces',
    heroTitle: 'A paper room for sentences that once found you.',
    intro:
      'Archive turns Kindle highlights into quiet printed fragments: dates, weather, margins, and the memory of who you were while reading.',
    import: 'Import Demo Archive',
    importMine: 'Import My File',
    importStatus: 'Collecting traces of reading.',
    cardKicker: "Tonight's fragment",
    emptyQuote: 'After import, your first reading fragment will appear here.',
    returned: 'fragments returned tonight.',
    captionOne: 'Not a dashboard',
    captionTwo: 'Not a second brain',
    captionThree: 'A printed reading room',
    fragmentsLabel: 'Fragments',
    fragmentsTitle: 'Collected like torn paper slips, kept between old pages.',
    timelineLabel: 'Reading Timeline',
    timelineTitle: 'Your reading life, arranged by season instead of numbers.',
    libraryLabel: 'Library',
    libraryTitle: 'Every book becomes a room.',
    bookRoomLabel: 'Book Room',
    latestImport: 'Latest import',
    books: 'books',
    fragments: 'fragments',
    notes: 'notes',
    highlights: 'highlights',
    bookmarks: 'bookmarks',
    referenceFile: 'Reference file',
    allFragments: 'All fragments',
    openRoom: 'Enter room',
    noContent: 'This is a bookmark without excerpt text.',
    source: 'Source',
    navSettings: 'Settings',
    settingsLabel: 'Settings',
    settingsTitle: 'Adjust the lamp, tidy the desk, stay quietly in the room.',
    aboutHeader: 'About',
    aboutIntro: 'LUCERNA Archive is a digital reading room for preserving a lifetime of reading. Quietly archiving your Kindle traces.',
    developer: 'Developer',
    developerName: 'huyan',
    developerEmail: 'huyanxius@gmail.com',
    dataSection: 'Data',
    importSection: 'Import',
    exportSection: 'Export',
    clearData: 'Clear all data',
    clearDataDesc: 'Delete all imported books, fragments, and marks. This cannot be undone.',
    clearConfirm: 'Confirm clearing all data?',
    clearYes: 'Clear all',
    clearNo: 'Cancel',
    exportData: 'Export archive',
    exportDataDesc: 'Export all books and fragments as a backup file.',
    importData: 'Import archive backup',
    importDataDesc: 'Restore data from a previously exported backup.',
    displaySection: 'Display',
    languageSection: 'Language',
    zhOption: '中文',
    enOption: 'English',
    themeSection: 'Atmosphere',
    themeDesc: 'Coming: paper warmth adjustment',
    statsSection: 'Archive overview',
    totalBooks: 'Books',
    totalFragments: 'Fragments',
    totalImports: 'Imports',
    lastImport: 'Last import',
    none: 'None',
    version: 'Version',
    versionNum: 'Phase 1 — MVP',
    tagline: 'A Quiet Place for Your Reading Life.',
  },
}

function formatDate(date: Date | null, lang: Lang): string {
  if (!date) return lang === 'zh' ? '时间未知' : 'Unknown date'
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatMonth(date: Date | null, lang: Lang): string {
  if (!date) return lang === 'zh' ? '时间未归档' : 'Undated'
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
  }).format(date)
}

function typeLabel(type: Fragment['type'], lang: Lang): string {
  const labels = {
    highlight: { zh: '划线', en: 'Highlight' },
    note: { zh: '笔记', en: 'Note' },
    bookmark: { zh: '书签', en: 'Bookmark' },
  }
  return labels[type][lang]
}

function byRecent(a: Fragment, b: Fragment): number {
  return (b.clippedAt?.getTime() ?? 0) - (a.clippedAt?.getTime() ?? 0)
}

function App() {
  const [lang, setLang] = useState<Lang>('zh')
  const [page, setPage] = useState<Page>('room')
  const [showIntro, setShowIntro] = useState(() => localStorage.getItem('archive:intro-seen') !== '1')
  const [books, setBooks] = useState<Book[]>([])
  const [archiveFragments, setArchiveFragments] = useState<Fragment[]>([])
  const [imports, setImports] = useState<ImportRecord[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [status, setStatus] = useState(copy.zh.importStatus)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [exportLabel, setExportLabel] = useState('')
  const [importLabel, setImportLabel] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const t = copy[lang]
  const nextLang = lang === 'zh' ? 'en' : 'zh'

  const bookMap = useMemo(() => new Map(books.map((book) => [book.id, book])), [books])
  const sortedFragments = useMemo(() => [...archiveFragments].sort(byRecent), [archiveFragments])
  const readableFragments = sortedFragments.filter((fragment) => fragment.content.trim().length > 0)
  const featuredFragment = readableFragments[0] ?? sortedFragments[0]
  const selectedBook = selectedBookId ? bookMap.get(selectedBookId) ?? books[0] : books[0]
  const latestImport = [...imports].sort((a, b) => b.importedAt.getTime() - a.importedAt.getTime())[0]

  const stats = useMemo(
    () => ({
      books: books.length,
      fragments: archiveFragments.length,
      highlights: archiveFragments.filter((fragment) => fragment.type === 'highlight').length,
      notes: archiveFragments.filter((fragment) => fragment.type === 'note').length,
      bookmarks: archiveFragments.filter((fragment) => fragment.type === 'bookmark').length,
    }),
    [archiveFragments, books.length],
  )

  const bookSummaries = useMemo(
    () =>
      books
        .map((book) => {
          const fragmentsForBook = archiveFragments
            .filter((fragment) => fragment.bookId === book.id)
            .sort(byRecent)
          return {
            book,
            count: fragmentsForBook.length,
            latest: fragmentsForBook[0]?.clippedAt ?? null,
            quote: fragmentsForBook.find((fragment) => fragment.content)?.content ?? '',
          }
        })
        .sort((a, b) => b.count - a.count),
    [archiveFragments, books],
  )

  const timelineGroups = useMemo(() => {
    const groups = new Map<string, { label: string; fragments: Fragment[]; bookIds: Set<string> }>()
    for (const fragment of sortedFragments) {
      const key = fragment.clippedAt
        ? `${fragment.clippedAt.getFullYear()}-${fragment.clippedAt.getMonth()}`
        : 'undated'
      const existing = groups.get(key) ?? {
        label: formatMonth(fragment.clippedAt, lang),
        fragments: [],
        bookIds: new Set<string>(),
      }
      existing.fragments.push(fragment)
      existing.bookIds.add(fragment.bookId)
      groups.set(key, existing)
    }
    return Array.from(groups.values())
  }, [lang, sortedFragments])

  const topBooks = bookSummaries.slice(0, 3)
  const latestNote = sortedFragments.find((fragment) => fragment.type === 'note' && fragment.content) ?? readableFragments[1]
  async function loadArchive(options?: { seed?: boolean }) {
    const db = await createDatabase()
    if (options?.seed) {
      await seedIfNeeded(db)
    }
    const [nextBooks, nextFragments, nextImports] = await Promise.all([
      db.books.findAll(),
      db.fragments.findAll(),
      db.imports.findAll(),
    ])
    setBooks(nextBooks)
    setArchiveFragments(nextFragments)
    setImports(nextImports)
    if (!selectedBookId && nextBooks[0]) {
      setSelectedBookId(nextBooks[0].id)
    }
  }

  useEffect(() => {
    loadArchive({ seed: true }).catch((error) => {
      setStatus(error instanceof Error ? error.message : 'Failed to load archive')
    })
  }, [])

  async function handleDemoImport() {
    setStatus(t.importStatus)
    const db = await createDatabase()
    const response = await fetch('/My Clippings.txt')
    const raw = await response.text()
    const result = await importClippings(raw, '/My Clippings.txt', createRepositoryAdapter(db))
    await loadArchive()
    setStatus(
      lang === 'zh'
        ? `导入 ${result.importRecord.importedCount} 枚，跳过 ${result.importRecord.skippedCount} 枚重复。`
        : `Imported ${result.importRecord.importedCount}, skipped ${result.importRecord.skippedCount} duplicates.`,
    )
  }

  async function handleFileImport(file: File) {
    setStatus(t.importStatus)
    const db = await createDatabase()
    const raw = await file.text()
    const result = await importClippings(raw, file.name, createRepositoryAdapter(db))
    await loadArchive()
    setStatus(
      lang === 'zh'
        ? `从 ${file.name} 导入 ${result.importRecord.importedCount} 枚碎片。`
        : `Imported ${result.importRecord.importedCount} fragments from ${file.name}.`,
    )
  }

  function openBookRoom(bookId: string) {
    setSelectedBookId(bookId)
    changePage('book')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function changePage(nextPage: Page) {
    if (nextPage === page) return
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => void
    }
    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(() => setPage(nextPage))
      return
    }
    setPage(nextPage)
  }

  function enterArchive() {
    localStorage.setItem('archive:intro-seen', '1')
    setShowIntro(false)
  }

  async function handleClearData() {
    const dbs = await indexedDB.databases()
    for (const dbInfo of dbs) {
      if (dbInfo.name === 'lucerna-archive') {
        indexedDB.deleteDatabase('lucerna-archive')
      }
    }
    setShowClearConfirm(false)
    setBooks([])
    setArchiveFragments([])
    setImports([])
    setSelectedBookId(null)
    setStatus(lang === 'zh' ? '书房已清空，像一张刚铺好的纸。' : 'The room is clear, like a fresh sheet of paper.')
    await loadArchive({ seed: true })
  }

  async function handleExportData() {
    setExportLabel(lang === 'zh' ? '整理中...' : 'Preparing...')
    const payload = {
      books,
      fragments: archiveFragments,
      imports,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lucerna-archive-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportLabel(lang === 'zh' ? '档案已导出' : 'Archive exported')
    setTimeout(() => setExportLabel(''), 3000)
  }

  async function handleImportBackup(file: File) {
    setImportLabel(lang === 'zh' ? '正在恢复...' : 'Restoring...')
    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      if (payload.fragments && payload.books) {
        const db = await createDatabase()
        const repo = createRepositoryAdapter(db)
        for (const book of payload.books) {
          const exists = await db.books.findById(book.id)
          if (!exists) {
            await repo.createBook({ ...book, createdAt: new Date(book.createdAt), updatedAt: new Date() })
          }
        }
        for (const fragment of payload.fragments) {
          const exists = await db.fragments.findById(fragment.id)
          if (!exists) {
            await repo.createFragment({
              ...fragment,
              clippedAt: fragment.clippedAt ? new Date(fragment.clippedAt) : null,
              createdAt: new Date(fragment.createdAt),
              updatedAt: new Date(),
            })
          }
        }
        await loadArchive()
        setImportLabel(lang === 'zh' ? '备份已恢复' : 'Backup restored')
      }
    } catch {
      setImportLabel(lang === 'zh' ? '恢复失败，请检查文件' : 'Restore failed, check file')
    }
    setTimeout(() => setImportLabel(''), 3000)
  }

  const selectedBookFragments = selectedBook
    ? sortedFragments.filter((fragment) => fragment.bookId === selectedBook.id)
    : []
  const recentFragments = sortedFragments.slice(0, 8)
  const workspaceFragments = sortedFragments.slice(0, 14)
  const selectedFragment = featuredFragment ?? sortedFragments[0]
  const selectedFragmentBook = selectedFragment ? bookMap.get(selectedFragment.bookId) : null
  const selectedBookSummary = selectedBook
    ? bookSummaries.find(({ book }) => book.id === selectedBook.id)
    : null
  const pageTitle = {
    room: lang === 'zh' ? '今日档案台' : 'Today desk',
    fragments: t.allFragments,
    timeline: t.timelineTitle,
    library: t.libraryTitle,
    book: selectedBook?.title ?? t.bookRoomLabel,
    settings: lang === 'zh' ? '书房设置' : 'Room settings',
  }[page]
  const pageNote = {
    room: lang === 'zh'
      ? '最近的阅读痕迹、导入状态和需要回看的句子集中在这里。'
      : 'Recent traces, import status, and fragments worth returning to live here.',
    fragments: lang === 'zh'
      ? '按时间排开的片段记录流，适合快速回看和进入单本书。'
      : 'A chronological record stream for review and book-level entry.',
    timeline: lang === 'zh'
      ? '把阅读按照月份折叠成一条安静的回望线。'
      : 'Reading folded into a quiet monthly retrospective.',
    library: lang === 'zh'
      ? '从书开始整理，而不是从功能开始整理。'
      : 'Organize from books, not from features.',
    book: lang === 'zh'
      ? '单本书的阅读房间，只保留与这本书有关的痕迹。'
      : 'A single-book room for traces belonging to this title.',
    settings: lang === 'zh'
      ? '调整灯光，整理书桌，安静地留在房间里。'
      : 'Adjust the lamp, tidy the desk, stay quietly in the room.',
  }[page]
  const navigationItems = [
    ['room', t.navRoom, stats.fragments],
    ['fragments', t.navFragments, stats.highlights],
    ['library', t.navLibrary, stats.books],
    ['timeline', t.navTimeline, timelineGroups.length],
    ['settings', t.navSettings, '・'],
  ] as const

  return (
    <main className={`archive is-${lang}`}>
      <div className="paper-noise" />
      {showIntro && (
        <section className="intro-screen" aria-label="Archive introduction">
          <div className="intro-rule top-rule" />
          <div className="intro-hero">
            <div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h1>{t.heroTitle}</h1>
              <p className="intro">{t.intro}</p>
              <div className="intro-actions">
                <button type="button" onClick={enterArchive}>
                  {lang === 'zh' ? '进入档案' : 'Enter archive'}
                </button>
                <button type="button" className="secondary-action" onClick={() => setLang(nextLang)}>
                  {lang === 'zh' ? 'English' : '中文'}
                </button>
              </div>
            </div>

            <article className="room-card intro-card" aria-label="Opening fragment">
              <div className="ink-figure" />
              <p className="card-kicker">{t.cardKicker}</p>
              <blockquote>{featuredFragment?.content || t.emptyQuote}</blockquote>
              <div className="card-footer">
                <span>{stats.fragments} {t.returned}</span>
                <span>{featuredFragment ? formatDate(featuredFragment.clippedAt, lang) : '00:17'}</span>
              </div>
            </article>
          </div>
          <div className="poster-caption intro-caption">
            <span>{t.captionOne}</span>
            <span>{t.captionTwo}</span>
            <span>{t.captionThree}</span>
        </div>
          <div className="intro-rule bottom-rule" />
        </section>
      )}
      <div className="app-shell">
        <aside className="app-sidebar" aria-label="Archive controls">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 48 48" role="img">
                <path
                  className="mark-fill"
                  fillRule="evenodd"
                  d="M14 8h18c3.3 0 6 2.7 6 6v25H16.5A6.5 6.5 0 0 1 10 32.5V12a4 4 0 0 1 4-4Zm4 5.5v18.8c0 1.2 1 2.2 2.2 2.2H32V13.5H18Zm3.5 4a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0v-13Zm-4.5 18.8a1.2 1.2 0 0 0 0 2.4h17a1.2 1.2 0 0 0 0-2.4H17Z"
                />
              </svg>
            </span>
            <span className="brand-word">Archive</span>
        </div>

          <nav className="app-nav" aria-label="Primary navigation">
            {navigationItems.map(([id, label, count]) => (
              <button
                type="button"
                className={page === id ? 'nav-tab active' : 'nav-tab'}
                onClick={() => changePage(id as Page)}
                key={id}
              >
                <i className={`page-icon icon-${id}`} aria-hidden="true" />
                <span>{label}</span>
                <small>{count}</small>
              </button>
            ))}
          </nav>

          <div className="side-actions">
            <button type="button" onClick={handleDemoImport}>{t.import}</button>
            <button type="button" className="secondary-action" onClick={() => fileInputRef.current?.click()}>
              {t.importMine}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleFileImport(file)
                event.target.value = ''
              }}
            />
        <button
          type="button"
              className="language-toggle"
              onClick={() => setLang(nextLang)}
              aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              {lang === 'zh' ? '中文 / EN' : 'EN / 中文'}
            </button>
          </div>

          <p className="import-status">{status}</p>
        </aside>

        <section className="app-workspace" data-page={page} data-page-title={pageTitle}>
          <header className="workspace-header">
            <div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h1>{pageTitle}</h1>
              <p>{pageNote}</p>
            </div>
            <div className="archive-ledger compact">
              <div>
                <strong>{stats.books}</strong>
                <span>{t.books}</span>
              </div>
              <div>
                <strong>{stats.fragments}</strong>
                <span>{t.fragments}</span>
              </div>
              <div>
                <strong>{stats.notes}</strong>
                <span>{t.notes}</span>
              </div>
            </div>
          </header>

          <section className="archive-context" aria-label="Archive context">
            <article className="context-pane pane-fragment">
              <div className="pane-emblems" aria-hidden="true">
                <span className="emblem-quill" />
                <span className="emblem-ink" />
              </div>
              <div className="pane-body">
                <span className="pane-label">{lang === 'zh' ? '当前片段' : 'Current fragment'}</span>
                <blockquote>{selectedFragment?.content || t.emptyQuote}</blockquote>
                <span className="pane-source">{selectedFragmentBook?.title ?? t.source}</span>
              </div>
            </article>
            <article className="context-pane pane-book">
              <div className="pane-emblems" aria-hidden="true">
                <span className="emblem-spine" />
                <span className="emblem-page" />
              </div>
              <div className="pane-body">
                <span className="pane-label">{lang === 'zh' ? '当前书籍' : 'Current book'}</span>
                <h3 className="pane-book-title">{selectedBook?.title ?? t.libraryTitle}</h3>
                <span className="pane-source">{selectedBook?.author ?? t.referenceFile} · {selectedBookSummary?.count ?? 0} {t.fragments}</span>
              </div>
            </article>
            <article className="context-pane pane-index">
              <div className="pane-emblems" aria-hidden="true">
                <span className="emblem-ledger" />
              </div>
              <div className="pane-body">
                <span className="pane-label">{lang === 'zh' ? '藏书索引' : 'Reading index'}</span>
                <div className="index-rows">
                  {topBooks.map(({ book, count }, index) => (
                    <button type="button" className="index-row" key={book.id} onClick={() => openBookRoom(book.id)}>
                      <span className="index-num">{String(index + 1).padStart(2, '0')}</span>
                      <span className="index-title">{book.title}</span>
                      <span className="index-count">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          </section>

          {page === 'room' && (
            <section className="desk-grid">
              <article className="today-card">
                <span>{lang === 'zh' ? '今日状态' : 'Today'}</span>
                <h2>{lang === 'zh' ? '阅读痕迹正在归档。' : 'Reading traces are being filed.'}</h2>
                <p>{latestImport ? `${t.latestImport}: ${formatDate(latestImport.importedAt, lang)} / ${latestImport.importedCount} ${t.fragments}` : t.emptyQuote}</p>
              </article>

              <div className="recent-stream">
                <div className="panel-heading">
                  <span>{lang === 'zh' ? '最近进入档案' : 'Recent entries'}</span>
                  <button type="button" onClick={() => changePage('fragments')}>{t.allFragments}</button>
                </div>
                {recentFragments.map((fragment) => {
                  const book = bookMap.get(fragment.bookId)
                  return (
                    <article className="record-row" key={fragment.id}>
                      <time>{formatDate(fragment.clippedAt, lang)}</time>
                      <p>{fragment.content || t.noContent}</p>
                      <small>{book?.title ?? t.source} / {typeLabel(fragment.type, lang)}</small>
                    </article>
                  )
                })}
              </div>

              <aside className="focus-stack">
                <article className="room-card compact-card" aria-label="Featured reading fragment">
                  <p className="card-kicker">{t.cardKicker}</p>
                  <blockquote>{featuredFragment?.content || t.emptyQuote}</blockquote>
                  <div className="card-footer">
                    <span>{stats.fragments} {t.returned}</span>
                    <span>{featuredFragment ? formatDate(featuredFragment.clippedAt, lang) : '00:17'}</span>
                  </div>
                </article>

                <article className="note-specimen app-note">
                  <span>{lang === 'zh' ? '边注标本' : 'Marginal note'}</span>
                  <p>{latestNote?.content || t.emptyQuote}</p>
                  <small>{latestNote ? formatDate(latestNote.clippedAt, lang) : t.referenceFile}</small>
                </article>
              </aside>
            </section>
          )}

          {page === 'fragments' && (
            <section className="records-layout" id="fragments">
              <div className="record-filters" aria-label="Archive filters">
                <span>{t.highlights}: {stats.highlights}</span>
                <span>{t.notes}: {stats.notes}</span>
                <span>{t.bookmarks}: {stats.bookmarks}</span>
              </div>
              <div className="record-stream">
                {workspaceFragments.map((fragment, index) => {
                  const book = bookMap.get(fragment.bookId)
                  return (
                    <article className="fragment-card record-card" key={fragment.id} style={{ '--tilt': `${(index % 5) - 2}deg` } as CSSProperties}>
                      <span>{typeLabel(fragment.type, lang)} / {formatDate(fragment.clippedAt, lang)}</span>
                      <p>{fragment.content || t.noContent}</p>
                      <footer>
                        <strong>{book?.title ?? t.source}</strong>
                        <small>{book?.author} / {fragment.location ? `Loc. ${fragment.location}` : `Page ${fragment.page ?? '-'}`}</small>
                      </footer>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {page === 'timeline' && (
            <section className="timeline app-timeline timeline-scroll" id="timeline">
              <div className="timeline-list">
                {timelineGroups.map((item) => (
                  <article className="timeline-item" key={item.label}>
                    <span>{item.label}</span>
                    <h3>{Array.from(item.bookIds).map((id) => bookMap.get(id)?.title).filter(Boolean).join(' / ')}</h3>
                    <p>{item.fragments.length} {t.fragments}</p>
                  </article>
                ))}
        </div>
            </section>
          )}

          {page === 'library' && (
            <section className="library app-library library-shelf" id="library">
              <div className="library-panel library-catalog">
                {bookSummaries.map(({ book, count, latest, quote }, index) => (
                  <button
                    type="button"
                    className={selectedBook?.id === book.id ? 'selected' : ''}
                    onClick={() => openBookRoom(book.id)}
                    key={book.id}
                  >
                    <small className="catalog-number">{String(index + 1).padStart(2, '0')}</small>
                    <span>{book.title}</span>
                    <small>{book.author} / {count} {t.fragments} / {formatDate(latest, lang)}</small>
                    <em>{quote || t.noContent}</em>
                  </button>
                ))}
        </div>
      </section>
          )}

          {page === 'book' && selectedBook && (
            <section className="book-room app-book-room book-spread">
              <div className="book-room-layout">
                <aside className="book-room-index">
                  <p>{selectedBook.author}</p>
                  <strong>{selectedBookFragments.length}</strong>
                  <span>{t.fragments}</span>
                  <button type="button" onClick={() => changePage('library')}>{t.navLibrary}</button>
                </aside>
                <div className="book-fragment-stack">
                  {selectedBookFragments.map((fragment) => (
                    <article className="book-fragment" key={fragment.id}>
                      <span>{typeLabel(fragment.type, lang)} / {formatDate(fragment.clippedAt, lang)}</span>
                      <p>{fragment.content || t.noContent}</p>
                      <small>{fragment.location ? `Location ${fragment.location}` : `Page ${fragment.page ?? '-'}`}</small>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {page === 'settings' && (
            <section className="settings" id="settings">
              <div className="settings-grid">
                <article className="settings-card about-card">
                  <span className="settings-section-label">{t.aboutHeader}</span>
                  <div className="about-body">
                    <p>{t.aboutIntro}</p>
                    <div className="about-meta">
                      <div className="meta-row">
                        <small>{t.version}</small>
                        <strong>{t.versionNum}</strong>
                      </div>
                      <div className="meta-row">
                        <small>{t.tagline}</small>
                        <em>—</em>
                      </div>
                      <div className="about-divider" />
                      <div className="meta-row">
                        <small>{t.developer}</small>
                        <strong>{t.developerName}</strong>
                      </div>
                      <div className="meta-row">
                        <small>Email</small>
                        <a href={`mailto:${t.developerEmail}`} className="about-link">{t.developerEmail}</a>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="settings-card">
                  <span className="settings-section-label">{t.displaySection}</span>
                  <div className="settings-toggle-group">
                    <div className="settings-toggle-row">
                      <span>{t.languageSection}</span>
                      <div className="toggle-options">
                        <button
                          type="button"
                          className={lang === 'zh' ? 'toggle-active' : ''}
                          onClick={() => setLang('zh')}
                        >
                          {t.zhOption}
                        </button>
                        <button
                          type="button"
                          className={lang === 'en' ? 'toggle-active' : ''}
                          onClick={() => setLang('en')}
                        >
                          {t.enOption}
                        </button>
                      </div>
                    </div>
                    <div className="settings-toggle-row muted">
                      <span>{t.themeSection}</span>
                      <small>{t.themeDesc}</small>
                    </div>
                  </div>
                </article>

                <article className="settings-card">
                  <span className="settings-section-label">{t.dataSection}</span>
                  <div className="settings-toggle-group">
                    <div className="settings-toggle-row">
                      <span>{t.importSection}</span>
                      <label className="file-import-label">
                        {importLabel || t.importData}
                        <input
                          type="file"
                          accept=".json,application/json"
                          hidden
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) void handleImportBackup(file)
                            event.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                    <div className="settings-toggle-row">
                      <span>{t.exportSection}</span>
                      <button type="button" className="export-btn" onClick={handleExportData}>
                        {exportLabel || t.exportData}
                      </button>
                    </div>
                    <div className="settings-toggle-row danger-row">
                      <div>
                        <span>{t.clearData}</span>
                        <small>{t.clearDataDesc}</small>
                      </div>
                      <button
                        type="button"
                        className="clear-btn"
                        onClick={() => setShowClearConfirm(true)}
                      >
                        {t.clearData}
                      </button>
                    </div>
                  </div>
                </article>

                <article className="settings-card stats-card">
                  <span className="settings-section-label">{t.statsSection}</span>
                  <div className="stats-ledger">
                    <div className="stat-item">
                      <strong>{stats.books}</strong>
                      <span>{t.totalBooks}</span>
                    </div>
                    <div className="stat-item">
                      <strong>{stats.fragments}</strong>
                      <span>{t.totalFragments}</span>
                    </div>
                    <div className="stat-item">
                      <strong>{imports.length}</strong>
                      <span>{t.totalImports}</span>
                    </div>
                    <div className="stat-item">
                      <strong>{latestImport ? formatDate(latestImport.importedAt, lang) : t.none}</strong>
                      <span>{t.lastImport}</span>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          )}

          {showClearConfirm && (
            <div className="confirm-overlay" onClick={() => setShowClearConfirm(false)}>
              <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <p>{t.clearConfirm}</p>
                <div className="confirm-actions">
                  <button type="button" className="clear-btn confirm-yes" onClick={handleClearData}>
                    {t.clearYes}
                  </button>
                  <button type="button" className="confirm-no" onClick={() => setShowClearConfirm(false)}>
                    {t.clearNo}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      <DevPanel />
    </main>
  )
}

export default App
