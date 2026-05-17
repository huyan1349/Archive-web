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
type Page = 'room' | 'fragments' | 'timeline' | 'library' | 'book'

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

function AnimatedText({
  text,
  className = '',
  maxDelay = 900,
}: {
  text: string
  className?: string
  maxDelay?: number
}) {
  return (
    <span className={`kinetic-text ${className}`} aria-label={text}>
      {Array.from(text).map((char, index) => {
        const delay = Math.min(index * 16, maxDelay)
        const drift = ((index % 5) - 2) * 0.08
        return (
          <span
            aria-hidden="true"
            className={char === ' ' ? 'kinetic-char is-space' : 'kinetic-char'}
            key={`${char}-${index}`}
            style={
              {
                '--char-delay': `${delay}ms`,
                '--char-drift': `${drift}em`,
              } as CSSProperties
            }
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        )
      })}
    </span>
  )
}

function App() {
  const [lang, setLang] = useState<Lang>('zh')
  const [page, setPage] = useState<Page>('room')
  const [books, setBooks] = useState<Book[]>([])
  const [archiveFragments, setArchiveFragments] = useState<Fragment[]>([])
  const [imports, setImports] = useState<ImportRecord[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [status, setStatus] = useState(copy.zh.importStatus)
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

  const selectedBookFragments = selectedBook
    ? sortedFragments.filter((fragment) => fragment.bookId === selectedBook.id)
    : []

  return (
    <main className={`archive is-${lang}`}>
      <div className="paper-noise" />
      <header className="archive-topbar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <span><AnimatedText text="Archive" maxDelay={160} /></span>
        </div>
        <nav className="nav-links" aria-label="Primary navigation">
          {[
            ['room', t.navRoom],
            ['fragments', t.navFragments],
            ['timeline', t.navTimeline],
            ['library', t.navLibrary],
          ].map(([id, label]) => (
            <button
              type="button"
              className={page === id ? 'nav-tab active' : 'nav-tab'}
              onClick={() => changePage(id as Page)}
              key={id}
            >
              <AnimatedText text={label} maxDelay={220} />
            </button>
          ))}
          <button
            type="button"
            className="language-toggle"
            onClick={() => setLang(nextLang)}
            aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            <AnimatedText text={lang === 'zh' ? '中文 / EN' : 'EN / 中文'} maxDelay={180} />
          </button>
        </nav>
      </header>

      {page === 'room' && (
      <section className="poster">
        <div className="poster-rule top-rule" />
        <div className="hero-grid" id="room">
          <div className="hero-copy">
            <p className="eyebrow"><AnimatedText text={t.eyebrow} /></p>
            <h1>
              <AnimatedText text={t.heroTitle} maxDelay={1100} />
            </h1>
            <p className="intro">
              <AnimatedText text={t.intro} maxDelay={1200} />
            </p>
            <div className="hero-actions">
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
              <span>{status}</span>
            </div>
            <div className="archive-stats">
              <strong>{stats.books}</strong><span>{t.books}</span>
              <strong>{stats.fragments}</strong><span>{t.fragments}</span>
              <strong>{stats.highlights}</strong><span>{t.highlights}</span>
              <strong>{stats.notes}</strong><span>{t.notes}</span>
            </div>
          </div>

          <div className="room-card" aria-label="Featured reading fragment">
            <div className="ink-figure" />
            <p className="card-kicker">{t.cardKicker}</p>
            <blockquote>
              <AnimatedText text={featuredFragment?.content || t.emptyQuote} maxDelay={1400} />
            </blockquote>
            <div className="card-footer">
              <span>{stats.fragments} {t.returned}</span>
              <span>{featuredFragment ? formatDate(featuredFragment.clippedAt, lang) : '00:17'}</span>
            </div>
          </div>
        </div>

        <div className="poster-caption">
          <span><AnimatedText text={t.captionOne} /></span>
          <span><AnimatedText text={t.captionTwo} /></span>
          <span><AnimatedText text={t.captionThree} /></span>
        </div>
        <div className="poster-rule bottom-rule" />
      </section>
      )}

      {page === 'fragments' && (
      <section className="fragments" id="fragments">
        <div className="section-heading">
          <p><AnimatedText text={t.fragmentsLabel} /></p>
          <h2><AnimatedText text={`${t.allFragments}: ${stats.fragments} ${t.fragments}`} maxDelay={900} /></h2>
        </div>
        <div className="fragment-grid expanded">
          {sortedFragments.map((fragment, index) => {
            const book = bookMap.get(fragment.bookId)
            return (
            <article className="fragment-card" key={fragment.id} style={{ '--tilt': `${(index % 5) - 2}deg` } as CSSProperties}>
              <span><AnimatedText text={`${typeLabel(fragment.type, lang)} / ${formatDate(fragment.clippedAt, lang)}`} maxDelay={360} /></span>
              <p><AnimatedText text={fragment.content || t.noContent} maxDelay={900} /></p>
              <footer>
                <strong><AnimatedText text={book?.title ?? t.source} maxDelay={360} /></strong>
                <small><AnimatedText text={`${book?.author} / ${fragment.location ? `Loc. ${fragment.location}` : `Page ${fragment.page ?? '-'}`}`} maxDelay={420} /></small>
              </footer>
            </article>
            )
          })}
        </div>
      </section>
      )}

      {page === 'timeline' && (
      <section className="timeline" id="timeline">
        <div className="section-heading">
          <p><AnimatedText text={t.timelineLabel} /></p>
          <h2><AnimatedText text={t.timelineTitle} maxDelay={1000} /></h2>
        </div>
        <div className="timeline-list">
          {timelineGroups.map((item) => (
            <article className="timeline-item" key={item.label}>
              <span><AnimatedText text={item.label} maxDelay={260} /></span>
              <h3><AnimatedText text={Array.from(item.bookIds).map((id) => bookMap.get(id)?.title).filter(Boolean).join(' / ')} maxDelay={900} /></h3>
              <p><AnimatedText text={`${item.fragments.length} ${t.fragments}`} maxDelay={220} /></p>
            </article>
          ))}
        </div>
      </section>
      )}

      {page === 'library' && (
      <section className="library" id="library">
        <div>
          <p className="eyebrow"><AnimatedText text={t.libraryLabel} /></p>
          <h2><AnimatedText text={t.libraryTitle} maxDelay={900} /></h2>
          {latestImport && (
            <p className="library-note">
              <AnimatedText text={`${t.latestImport}: ${formatDate(latestImport.importedAt, lang)} / ${latestImport.importedCount} ${t.fragments}`} maxDelay={900} />
            </p>
          )}
        </div>
        <div className="library-panel">
          {bookSummaries.map(({ book, count, latest }) => (
            <button type="button" onClick={() => openBookRoom(book.id)} key={book.id}>
              <span><AnimatedText text={book.title} maxDelay={520} /></span>
              <small><AnimatedText text={`${book.author} / ${count} ${t.fragments} / ${formatDate(latest, lang)}`} maxDelay={720} /></small>
            </button>
          ))}
        </div>
      </section>
      )}

      {page === 'book' && selectedBook && (
        <section className="book-room">
          <div className="section-heading">
            <p><AnimatedText text={t.bookRoomLabel} /></p>
            <h2><AnimatedText text={selectedBook.title} maxDelay={900} /></h2>
          </div>
          <div className="book-room-layout">
            <aside className="book-room-index">
              <p><AnimatedText text={selectedBook.author} maxDelay={480} /></p>
              <strong>{selectedBookFragments.length}</strong>
              <span><AnimatedText text={t.fragments} maxDelay={180} /></span>
              <button type="button" onClick={() => changePage('library')}><AnimatedText text={t.navLibrary} maxDelay={180} /></button>
            </aside>
            <div className="book-fragment-stack">
              {selectedBookFragments.map((fragment) => (
                <article className="book-fragment" key={fragment.id}>
                  <span><AnimatedText text={`${typeLabel(fragment.type, lang)} / ${formatDate(fragment.clippedAt, lang)}`} maxDelay={360} /></span>
                  <p><AnimatedText text={fragment.content || t.noContent} maxDelay={1100} /></p>
                  <small><AnimatedText text={fragment.location ? `Location ${fragment.location}` : `Page ${fragment.page ?? '-'}`} maxDelay={260} /></small>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      <DevPanel />
    </main>
  )
}

export default App
