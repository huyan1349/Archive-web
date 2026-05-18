import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import DevPanel from './DevPanel'
import LoginPage from './LoginPage'
import { useAuth } from './AuthProvider'
import {
  createDatabase,
  createRepositoryAdapter,
  importClippings,
  seedIfNeeded,
  WeReadClient,
  syncAllBooks,
  importWeReadBooks,
  type Book,
  type Fragment,
  type ImportRecord,
  type WeReadSyncProgress,
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
    heroTitle: '欢迎来到 Archive',
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
    introStep2Label: '你的阅读房间',
    introStep2Title: '四间纸上的房间，收纳你的阅读人生。',
    introStep2Desc1: '书房 · 今日档案台，瞥见最近归来的碎片。',
    introStep2Desc2: '碎片 · 像撕下的纸条，被夹回旧书页之间。',
    introStep2Desc3: '时间线 · 你的阅读按照季节排列，而非数字。',
    introStep2Desc4: '藏书 · 每一本书，都会形成一个房间。',
    introStep3Label: '如何开始',
    introStep3Title: '导入你的 Kindle 笔记，安静地归档。',
    introStep3Desc1: '将 Kindle 的 My Clippings.txt 拖入书房。',
    introStep3Desc2: 'Archive 自动解析每一段划线、笔记与书签。',
    introStep3Desc3: '这间书房会记住所有的日期与书页。',
    introStep3Desc4: '数据只留在你自己的设备上，不上传任何内容。',
    replayIntro: '重新播放开场',
    nextLabel: '下一步',
    enterLabel: '进入档案',
    tutorialRoomLabel: '书房',
    tutorialRoomTitle: '这里是你的阅读主厅。',
    tutorialRoomDesc1: '时间线、藏书、碎片——',
    tutorialRoomDesc2: '每一次打开，都像走进一间',
    tutorialRoomDesc3: '摆满了旧书页的房间。',
    tutorialFragLabel: '碎片 · Fragments',
    tutorialFragTitle: 'Kindle 划线变成安静的纸片。',
    tutorialFragDesc1: '每一枚碎片都被保留了——',
    tutorialFragDesc2: '日期、天气、页边距，',
    tutorialFragDesc3: '以及你阅读时的自己。',
    tutorialTimelineLabel: '时间线 · Timeline',
    tutorialTimelineTitle: '你的阅读人生，按季节排列。',
    tutorialTimelineDesc1: '不是冰冷的数字序列，',
    tutorialTimelineDesc2: '而是一条手绘的河流——',
    tutorialTimelineDesc3: '每本书都是河上的一个弯。',
    tutorialLibLabel: '藏书 · Library',
    tutorialLibTitle: '每一本书，都是一个房间。',
    tutorialLibDesc1: '点进任意一本书，',
    tutorialLibDesc2: '你会看到它专属的——',
    tutorialLibDesc3: '碎片墙、笔记桌和书脊目录。',
    tutorialStartLabel: '开始使用',
    tutorialStartTitle: '导入你的 Kindle 笔记。',
    tutorialStartDesc1: '将 My Clippings.txt 拖入书房。',
    tutorialStartDesc2: 'Archive 自动解析划线、笔记与书签。',
    tutorialStartDesc3: '数据只留在你自己的设备上。',
    tutorialStartDesc4: '不上传任何内容。',
    wereadSection: '微信读书',
    wereadTitle: '微信读书 / WeRead',
    wereadDesc: '同步微信读书的划线、笔记和书评。',
    wereadOpen: '打开微信读书',
    wereadHint: '登录后，右键页面 → 检查 → Application → Cookies → 复制 weread.qq.com 的全部 Cookie',
    wereadCookieLabel: '粘贴 Cookie',
    wereadSync: '一键同步',
    wereadSyncing: '同步中...',
    wereadValid: 'Cookie 有效',
    wereadInvalid: 'Cookie 无效，请重新登录',
    wereadBooks: '本书',
    wereadHighlights: '条划线',
    wereadNotes: '条笔记',
    wereadReviews: '条书评',
    wereadSkipped: '条重复跳过',
  },
  en: {
    navRoom: 'The Room',
    navFragments: 'Fragments',
    navTimeline: 'Timeline',
    navLibrary: 'Library',
    eyebrow: 'Printed archive / Kindle traces',
    heroTitle: 'Welcome to Archive',
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
    introStep2Label: 'Your Reading Rooms',
    introStep2Title: 'Four paper rooms to hold your reading life.',
    introStep2Desc1: 'The Room · A desk to glimpse your latest fragments.',
    introStep2Desc2: 'Fragments · Like torn paper slips between old pages.',
    introStep2Desc3: 'Timeline · Your reading, arranged by season, not numbers.',
    introStep2Desc4: 'Library · Every book becomes its own room.',
    introStep3Label: 'How to Start',
    introStep3Title: 'Import your Kindle notes. Quietly archive.',
    introStep3Desc1: 'Drop your Kindle My Clippings.txt into the room.',
    introStep3Desc2: 'Archive parses every highlight, note, and bookmark.',
    introStep3Desc3: 'This room remembers every date and every page.',
    introStep3Desc4: 'Your data stays on your device. Nothing is uploaded.',
    replayIntro: 'Replay intro',
    nextLabel: 'Next',
    enterLabel: 'Enter Archive',
    tutorialRoomLabel: 'The Room',
    tutorialRoomTitle: 'This is your reading hall.',
    tutorialRoomDesc1: 'Timeline, library, fragments —',
    tutorialRoomDesc2: 'every visit feels like stepping into',
    tutorialRoomDesc3: 'a room filled with old pages.',
    tutorialFragLabel: 'Fragments',
    tutorialFragTitle: 'Kindle highlights become quiet paper slips.',
    tutorialFragDesc1: 'Every fragment is preserved —',
    tutorialFragDesc2: 'the date, the weather, the margins,',
    tutorialFragDesc3: 'and the memory of who you were while reading.',
    tutorialTimelineLabel: 'Timeline',
    tutorialTimelineTitle: 'Your reading life, arranged by season.',
    tutorialTimelineDesc1: 'Not a cold numeric sequence,',
    tutorialTimelineDesc2: 'but a hand-drawn river —',
    tutorialTimelineDesc3: 'each book a bend along the water.',
    tutorialLibLabel: 'Library',
    tutorialLibTitle: 'Every book becomes a room.',
    tutorialLibDesc1: 'Step into any book and find',
    tutorialLibDesc2: 'its own dedicated space —',
    tutorialLibDesc3: 'fragment wall, note desk, and spine index.',
    tutorialStartLabel: 'Getting Started',
    tutorialStartTitle: 'Import your Kindle notes.',
    tutorialStartDesc1: 'Drop your My Clippings.txt into the room.',
    tutorialStartDesc2: 'Archive parses every highlight, note, and bookmark.',
    tutorialStartDesc3: 'Your data stays on your device.',
    tutorialStartDesc4: 'Nothing is uploaded anywhere.',
    wereadSection: 'WeRead',
    wereadTitle: 'WeRead Sync / 微信读书',
    wereadDesc: 'Sync highlights, notes, and reviews from WeRead.',
    wereadOpen: 'Open WeRead',
    wereadHint: 'After login, right-click the page → Inspect → Application → Cookies → Copy all cookies from weread.qq.com',
    wereadCookieLabel: 'Paste Cookie',
    wereadSync: 'Sync All',
    wereadSyncing: 'Syncing...',
    wereadValid: 'Cookie valid',
    wereadInvalid: 'Cookie invalid, please re-login',
    wereadBooks: 'books',
    wereadHighlights: 'highlights',
    wereadNotes: 'notes',
    wereadReviews: 'reviews',
    wereadSkipped: 'duplicates skipped',
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
  const [showSplash, setShowSplash] = useState(true)
  const [showIntro, setShowIntro] = useState(() => localStorage.getItem('archive:intro-seen') !== '1')
  const [introPage, setIntroPage] = useState(0)
  const { user, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (showSplash) return
    if (showIntro) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [showSplash, showIntro])

  useEffect(() => {
    const t1 = setTimeout(() => setShowSplash(false), 2400)
    const t2 = setTimeout(() => {
      if (localStorage.getItem('archive:intro-seen') !== '1') {
        setShowIntro(true)
      }
    }, 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])
  const [books, setBooks] = useState<Book[]>([])
  const [archiveFragments, setArchiveFragments] = useState<Fragment[]>([])
  const [imports, setImports] = useState<ImportRecord[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [status, setStatus] = useState(copy.zh.importStatus)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [exportLabel, setExportLabel] = useState('')
  const [importLabel, setImportLabel] = useState('')
  const [wereadCookie, setWereadCookie] = useState('')
  const [wereadCookieFromExt, setWereadCookieFromExt] = useState<string | null>(null)
  const [wereadStatus, setWereadStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle')
  const [wereadMessage, setWereadMessage] = useState('')
  const [wereadProgress, setWereadProgress] = useState<WeReadSyncProgress | null>(null)
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

  useEffect(() => {
    function onCookie(e: CustomEvent<{ cookie: string }>) {
      if (e.detail?.cookie) {
        setWereadCookieFromExt(e.detail.cookie)
      }
    }
    window.addEventListener('lucerna:weread-cookie', onCookie as EventListener)
    return () => window.removeEventListener('lucerna:weread-cookie', onCookie as EventListener)
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

  function replayIntro() {
    setIntroPage(0)
    setShowIntro(true)
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

  async function handleWeReadSync(cookieFromExt?: string) {
    const cookie = cookieFromExt ?? (wereadCookieFromExt || wereadCookie.trim())
    if (!cookie) {
      setWereadStatus('error')
      setWereadMessage(lang === 'zh' ? '请先粘贴 Cookie 或使用扩展导入' : 'Please paste cookie or use extension')
      return
    }
    setWereadStatus('syncing')
    setWereadMessage(t.wereadSyncing)
    setWereadProgress(null)
    try {
      const client = new WeReadClient(cookie)
      const valid = await client.validate()
      if (!valid) {
        setWereadStatus('error')
        setWereadMessage(t.wereadInvalid)
        return
      }
      const { books: booksData, errors: syncErrors } = await syncAllBooks(
        cookie,
        (progress) => setWereadProgress(progress),
      )
      if (booksData.length === 0) {
        setWereadStatus('error')
        setWereadMessage(syncErrors.length > 0 ? syncErrors.join('; ') : (lang === 'zh' ? '未找到有笔记的书籍' : 'No books with notes found'))
        return
      }
      const db = await createDatabase()
      const repo = createRepositoryAdapter(db)
      const result = await importWeReadBooks(booksData, repo, syncErrors)
      await loadArchive()
      setWereadStatus('done')
      const parts = [
        `${result.stats.totalBooks} ${t.wereadBooks}`,
        `${result.stats.totalHighlights} ${t.wereadHighlights}`,
        `${result.stats.totalNotes} ${t.wereadNotes}`,
        `${result.stats.totalReviews} ${t.wereadReviews}`,
        `${result.skippedCount} ${t.wereadSkipped}`,
      ]
      setWereadMessage(parts.join(' · '))
    } catch (e) {
      setWereadStatus('error')
      setWereadMessage(e instanceof Error ? e.message : 'Sync failed')
    } finally {
      // 通知扩展 content script 清除 storage
      window.dispatchEvent(new CustomEvent('lucerna:weread-cookie-processed'))
      setWereadCookieFromExt(null)
      setWereadCookie('')
    }
  }

  useEffect(() => {
    if (wereadCookieFromExt) {
      void handleWeReadSync(wereadCookieFromExt)
    }
  }, [wereadCookieFromExt])

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
      {showSplash && (
        <section className="splash-screen" aria-label="Archive splash">
          <div className="splash-icon-wrap">
            <svg viewBox="0 0 48 48" className="splash-icon-svg">
              <path
                className="splash-mark"
                fillRule="evenodd"
                d="M14 8h18c3.3 0 6 2.7 6 6v25H16.5A6.5 6.5 0 0 1 10 32.5V12a4 4 0 0 1 4-4Zm4 5.5v18.8c0 1.2 1 2.2 2.2 2.2H32V13.5H18Zm3.5 4a1.5 1.5 0 0 1 3 0v13a1.5 1.5 0 0 1-3 0v-13Zm-4.5 18.8a1.2 1.2 0 0 0 0 2.4h17a1.2 1.2 0 0 0 0-2.4H17Z"
              />
            </svg>
          </div>
          <h2 className="splash-title">Archive</h2>
          <p className="splash-sub">{lang === 'zh' ? '一间纸上的房间' : 'A paper room for reading'}</p>
        </section>
      )}
      {showIntro && (
        <section className="intro-screen" aria-label="Archive introduction">
          {introPage === 0 && (
            <>
              <div className="intro-rule top-rule" />
              <div className="intro-hero intro-hero-welcome">
                <div>
                  <p className="eyebrow">{t.eyebrow}</p>
                  <h1>{t.heroTitle}</h1>
                  <p className="intro">{t.intro}</p>
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
              <div className="intro-actions">
                <button type="button" onClick={() => setIntroPage(1)}>{t.nextLabel}</button>
                <button type="button" className="secondary-action" onClick={() => setLang(nextLang)}>
                  {lang === 'zh' ? 'English' : '中文'}
                </button>
              </div>
            </>
          )}

          {introPage === 1 && (
            <>
              <div className="intro-rule top-rule" />
              <div className="intro-hero intro-hero-room-demo">
                <div className="room-demo-text">
                  <p className="eyebrow"><mark>{t.tutorialRoomLabel}</mark></p>
                  <h1>{t.tutorialRoomTitle}</h1>
                  <p className="tutor-desc">
                    <mark>{t.tutorialRoomDesc1}</mark><br />
                    {t.tutorialRoomDesc2}<br />
                    <mark>{t.tutorialRoomDesc3}</mark>
                  </p>
                  <div className="intro-actions">
                    <button type="button" onClick={() => setIntroPage(2)}>{t.nextLabel}</button>
                    <button type="button" className="secondary-action" onClick={() => setLang(nextLang)}>
                      {lang === 'zh' ? 'English' : '中文'}
                    </button>
                  </div>
                </div>
                <div className="room-demo-stage" aria-hidden="true">
                  <div className="room-demo-desk">
                    <div className="rdd-shelf" />
                    <div className="rdd-book rdd-b1" />
                    <div className="rdd-book rdd-b2" />
                    <div className="rdd-book rdd-b3" />
                    <div className="rdd-lamp"><div className="rdd-lamp-shade" /><div className="rdd-lamp-base" /></div>
                    <div className="rdd-mug" />
                    <div className="rdd-ink-blot" />
                  </div>
                </div>
              </div>
              <div className="intro-rule bottom-rule" />
            </>
          )}

          {introPage === 2 && (
            <>
              <div className="intro-rule top-rule" />
              <div className="intro-hero intro-hero-frag-demo">
                <div className="frag-demo-text">
                  <p className="eyebrow"><mark>{t.tutorialFragLabel}</mark></p>
                  <h1>{t.tutorialFragTitle}</h1>
                  <p className="tutor-desc">
                    <mark>{t.tutorialFragDesc1}</mark><br />
                    {t.tutorialFragDesc2}<br />
                    <mark>{t.tutorialFragDesc3}</mark>
                  </p>
                  <div className="intro-actions">
                    <button type="button" onClick={() => setIntroPage(3)}>{t.nextLabel}</button>
                    <button type="button" className="secondary-action" onClick={() => setLang(nextLang)}>
                      {lang === 'zh' ? 'English' : '中文'}
                    </button>
                  </div>
                </div>
                <div className="frag-demo-stage" aria-hidden="true">
                  <div className="frag-slip fs-1"><div className="fs-line" /><div className="fs-line short" /><div className="fs-line" /></div>
                  <div className="frag-slip fs-2"><div className="fs-line" /><div className="fs-line short" /></div>
                  <div className="frag-slip fs-3"><div className="fs-line" /><div className="fs-line" /><div className="fs-line short" /></div>
                  <div className="frag-slip fs-4"><div className="fs-line short" /><div className="fs-line" /></div>
                  <div className="frag-slip fs-5"><div className="fs-line" /><div className="fs-line short" /><div className="fs-line" /></div>
                </div>
              </div>
              <div className="intro-rule bottom-rule" />
            </>
          )}

          {introPage === 3 && (
            <>
              <div className="intro-rule top-rule" />
              <div className="intro-hero intro-hero-tl-demo">
                <div className="tl-demo-text">
                  <p className="eyebrow"><mark>{t.tutorialTimelineLabel}</mark></p>
                  <h1>{t.tutorialTimelineTitle}</h1>
                  <p className="tutor-desc">
                    <mark>{t.tutorialTimelineDesc1}</mark><br />
                    {t.tutorialTimelineDesc2}<br />
                    <mark>{t.tutorialTimelineDesc3}</mark>
                  </p>
                  <div className="intro-actions">
                    <button type="button" onClick={() => setIntroPage(4)}>{t.nextLabel}</button>
                    <button type="button" className="secondary-action" onClick={() => setLang(nextLang)}>
                      {lang === 'zh' ? 'English' : '中文'}
                    </button>
                  </div>
                </div>
                <div className="tl-demo-stage" aria-hidden="true">
                  <svg viewBox="0 0 300 360" className="tl-river-svg">
                    <path className="tl-river-bg" d="M 150 20 C 100 80, 200 120, 140 180 C 80 240, 180 280, 150 340" fill="none" stroke="rgba(159,79,45,0.14)" strokeWidth="18" strokeLinecap="round" />
                    <path className="tl-river-line" d="M 150 20 C 100 80, 200 120, 140 180 C 80 240, 180 280, 150 340" fill="none" stroke="rgba(35,27,19,0.48)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="800" />
                  </svg>
                  <div className="tl-demo-card tlc-1" />
                  <div className="tl-demo-card tlc-2" />
                  <div className="tl-demo-card tlc-3" />
                  <div className="tl-demo-card tlc-4" />
                </div>
              </div>
              <div className="intro-rule bottom-rule" />
            </>
          )}

          {introPage === 4 && (
            <>
              <div className="intro-rule top-rule" />
              <div className="intro-hero intro-hero-lib-demo">
                <div className="lib-demo-text">
                  <p className="eyebrow"><mark>{t.tutorialLibLabel}</mark></p>
                  <h1>{t.tutorialLibTitle}</h1>
                  <p className="tutor-desc">
                    <mark>{t.tutorialLibDesc1}</mark><br />
                    {t.tutorialLibDesc2}<br />
                    <mark>{t.tutorialLibDesc3}</mark>
                  </p>
                  <div className="intro-actions">
                    <button type="button" onClick={() => setIntroPage(5)}>{t.nextLabel}</button>
                    <button type="button" className="secondary-action" onClick={() => setLang(nextLang)}>
                      {lang === 'zh' ? 'English' : '中文'}
                    </button>
                  </div>
                </div>
                <div className="lib-demo-stage" aria-hidden="true">
                  <div className="lib-shelf">
                    <div className="lib-shelf-row">
                      <div className="lib-spine ls-1" /><div className="lib-spine ls-2" /><div className="lib-spine ls-3" /><div className="lib-spine ls-4" /><div className="lib-spine ls-5" />
                    </div>
                    <div className="lib-shelf-board" />
                    <div className="lib-shelf-row">
                      <div className="lib-spine ls-6" /><div className="lib-spine ls-7" /><div className="lib-spine ls-8" /><div className="lib-spine ls-9" />
                    </div>
                    <div className="lib-shelf-board" />
                    <div className="lib-shelf-row">
                      <div className="lib-spine ls-10" /><div className="lib-spine ls-11" /><div className="lib-spine ls-12" /><div className="lib-spine ls-13" /><div className="lib-spine ls-14" />
                    </div>
                    <div className="lib-shelf-board" />
                  </div>
                </div>
              </div>
              <div className="intro-rule bottom-rule" />
            </>
          )}

          {introPage === 5 && (
            <>
              <div className="intro-rule top-rule" />
              <div className="intro-hero intro-hero-start-demo">
                <div className="start-demo-text">
                  <p className="eyebrow"><mark>{t.tutorialStartLabel}</mark></p>
                  <h1>{t.tutorialStartTitle}</h1>
                  <p className="tutor-desc">
                    <mark>{t.tutorialStartDesc1}</mark><br />
                    {t.tutorialStartDesc2}<br />
                    <mark>{t.tutorialStartDesc3}</mark><br />
                    <span className="tutor-dim">{t.tutorialStartDesc4}</span>
                  </p>
                  <div className="intro-actions">
                    <button type="button" onClick={enterArchive}>{t.enterLabel}</button>
                    {!user && (
                      <button type="button" className="secondary-action" onClick={() => setShowLogin(true)}>
                        {lang === 'zh' ? '登录书房' : 'Sign In'}
                      </button>
                    )}
                    <button type="button" className="secondary-action" onClick={() => setLang(nextLang)}>
                      {lang === 'zh' ? 'English' : '中文'}
                    </button>
                  </div>
                </div>
                <div className="start-demo-stage" aria-hidden="true">
                  <div className="import-doc">
                    <div className="import-fold" />
                    <div className="import-lines">
                      <div className="imp-line" /><div className="imp-line short" /><div className="imp-line" /><div className="imp-line short" />
                    </div>
                  </div>
                  <div className="import-arrow">
                    <svg viewBox="0 0 40 60"><path d="M 20 8 L 20 48" fill="none" stroke="rgba(35,27,19,0.5)" strokeWidth="2" strokeLinecap="round" strokeDasharray="60" /><path d="M 12 40 L 20 50 L 28 40" fill="none" stroke="rgba(35,27,19,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" /></svg>
                  </div>
                  <div className="import-box">
                    <div className="import-box-icon">
                      <svg viewBox="0 0 32 32"><path d="M 8 20 L 16 12 L 24 20" fill="none" stroke="rgba(159,79,45,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" /><path d="M 4 24 H 28" fill="none" stroke="rgba(159,79,45,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="40" /></svg>
                    </div>
                    <div className="import-box-label" />
                  </div>
                </div>
              </div>
              <div className="intro-rule bottom-rule" />
            </>
          )}

          <div className="intro-dots" role="tablist" aria-label={lang === 'zh' ? '开屏导航' : 'Intro navigation'}>
            {[0, 1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                className={introPage === p ? 'intro-dot active' : 'intro-dot'}
                onClick={() => setIntroPage(p)}
                aria-label={lang === 'zh' ? `第${p + 1}页` : `Page ${p + 1}`}
              />
            ))}
          </div>
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
            <section className="room-desk">
              <article className="ink-statement">
                <div className="ink-decoration" aria-hidden="true">
                  <span className="ink-swash" />
                  <span className="ink-dot-stamp" />
                </div>
                <span className="statement-label">{lang === 'zh' ? '今日档案台' : 'Today desk'}</span>
                <h2 className="statement-text">
                  {lang === 'zh'
                    ? '阅读痕迹正在归档。'
                    : 'Reading traces are being filed.'}
                </h2>
                <p className="statement-meta">
                  {latestImport
                    ? `${t.latestImport}: ${formatDate(latestImport.importedAt, lang)} · ${latestImport.importedCount} ${t.fragments}`
                    : lang === 'zh' ? '—— 还没有导入记录，在等待你的 Kindle。' : '— No imports yet. Awaiting your Kindle.'}
                </p>
              </article>

              <div className="room-hero-row">
                <div className="room-stats-plate">
                  <div className="stats-plate-header">
                    <span className="stats-plate-title">{lang === 'zh' ? '藏书统计' : 'Archive Stats'}</span>
                    <span className="stats-plate-stamp" aria-hidden="true">✦</span>
                  </div>
                  <div className="stats-plate-grid">
                    <div className="stat-cell">
                      <strong className="stat-number">{stats.books}</strong>
                      <span className="stat-label">{lang === 'zh' ? '本书' : 'Books'}</span>
                    </div>
                    <div className="stat-cell">
                      <strong className="stat-number">{stats.fragments}</strong>
                      <span className="stat-label">{lang === 'zh' ? '枚碎片' : 'Fragments'}</span>
                    </div>
                    <div className="stat-cell">
                      <strong className="stat-number">{stats.notes}</strong>
                      <span className="stat-label">{lang === 'zh' ? '条笔记' : 'Notes'}</span>
                    </div>
                    <div className="stat-cell stat-cell-accent">
                      <strong className="stat-number stat-number-accent">{stats.highlights}</strong>
                      <span className="stat-label">{lang === 'zh' ? '当前片段' : 'Highlights'}</span>
                    </div>
                  </div>
                </div>

                <article className="room-card compact-card" aria-label="Featured reading fragment">
                  <p className="card-kicker">{t.cardKicker}</p>
                  <blockquote>{featuredFragment?.content || t.emptyQuote}</blockquote>
                  <div className="card-footer">
                    <span>{stats.fragments} {t.returned}</span>
                    <span>{featuredFragment ? formatDate(featuredFragment.clippedAt, lang) : '00:17'}</span>
                  </div>
                </article>
              </div>

              <div className="room-current-book">
                <span className="current-book-label">{lang === 'zh' ? '当前书籍' : 'Current Book'}</span>
                {bookSummaries[0] && (
                  <button type="button" className="current-book-card" onClick={() => openBookRoom(bookSummaries[0].book.id)}>
                    <div className="current-book-spine" aria-hidden="true" />
                    <div className="current-book-info">
                      <h3 className="current-book-title">{bookSummaries[0].book.title}</h3>
                      <p className="current-book-author">{bookSummaries[0].book.author} · {bookSummaries[0].count} {lang === 'zh' ? '枚碎片' : 'fragments'}</p>
                    </div>
                    <span className="current-book-arrow" aria-hidden="true">→</span>
                  </button>
                )}
              </div>

              <div className="room-catalog-strip">
                <span className="catalog-strip-label">{lang === 'zh' ? '藏书索引' : 'Book Index'}</span>
                <div className="catalog-strip-scroll">
                  {bookSummaries.map(({ book, count }, i) => (
                    <button
                      type="button"
                      className="catalog-strip-item"
                      key={book.id}
                      style={{ '--csi-delay': `${i * 0.05}s` } as CSSProperties}
                      onClick={() => openBookRoom(book.id)}
                    >
                      <small className="csi-number">{String(i + 1).padStart(2, '0')}</small>
                      <span className="csi-title">{book.title}</span>
                      <span className="csi-count">{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="room-journal">
                <div className="journal-head">
                  <span className="journal-head-label">{lang === 'zh' ? '最近进入档案' : 'Recent entries'}</span>
                  <button type="button" onClick={() => changePage('fragments')}>{t.allFragments} →</button>
                </div>
                <div className="journal-body">
                  {recentFragments.map((fragment, index) => {
                    const book = bookMap.get(fragment.bookId)
                    return (
                      <div className="journal-line" key={fragment.id} style={{ '--i': index } as React.CSSProperties}>
                        <div className="journal-line-mark" aria-hidden="true">
                          <span className="line-bullet" />
                        </div>
                        <div className="journal-line-content">
                          <time className="line-date">{formatDate(fragment.clippedAt, lang)}</time>
                          <p className="line-text">{fragment.content || t.noContent}</p>
                          <span className="line-source">{book?.title ?? t.source} · {typeLabel(fragment.type, lang)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <aside className="room-margin">
                <article className="note-specimen app-note">
                  <span>{lang === 'zh' ? '边注标本' : 'Marginal note'}</span>
                  <p>{latestNote?.content || t.emptyQuote}</p>
                  <small>{latestNote ? formatDate(latestNote.clippedAt, lang) : t.referenceFile}</small>
                </article>
              </aside>

              <div className="desk-scatter" aria-label="Desk surface elements">
                <div className="scatter-corkboard">
                  <div className="cork-texture" aria-hidden="true" />
                  <span className="cork-label">{lang === 'zh' ? '· 软木板 ·' : '· Corkboard ·'}</span>
                  <div className="cork-pins">
                    {readableFragments.slice(2, 7).map((f, i) => {
                      const bk = bookMap.get(f.bookId)
                      return (
                        <div className="cork-pin" key={f.id} style={{ '--pin-x': `${10 + i * 18}%`, '--pin-y': `${8 + (i % 3) * 30}%`, '--pin-rot': `${(i % 5) - 2}deg`, '--pin-delay': `${i * 0.06}s` } as CSSProperties}>
                          <div className="pin-head" aria-hidden="true" />
                          <div className="pin-body">
                            <p className="pin-quote">{f.content.length > 60 ? f.content.slice(0, 60) + '…' : f.content || t.noContent}</p>
                            <span className="pin-source">— {bk?.title ?? t.source}</span>
                          </div>
                          <div className="pin-thread" aria-hidden="true" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="scatter-torn-strip">
                  <div className="torn-paper">
                    <div className="torn-rip top-rip" aria-hidden="true" />
                    <p className="torn-text">
                      {readableFragments[3]?.content || (lang === 'zh' ? '纸页撕下的痕迹，阅读的质感。' : 'The texture of torn paper, the feel of reading.')}
                    </p>
                    <span className="torn-ref">{readableFragments[3] ? bookMap.get(readableFragments[3].bookId)?.title : t.source}</span>
                    <div className="torn-rip bottom-rip" aria-hidden="true" />
                  </div>
                  <div className="torn-paper secondary-torn">
                    <div className="torn-rip top-rip" aria-hidden="true" />
                    <p className="torn-text">
                      {readableFragments[5]?.content || (lang === 'zh' ? '另一页的留痕。' : 'A trace from another page.')}
                    </p>
                    <div className="torn-rip bottom-rip" aria-hidden="true" />
                    <div className="washi-tape" aria-hidden="true" />
                  </div>
                </div>

                <div className="scatter-inkblot" aria-hidden="true">
                  <span className="blot blot-1" />
                  <span className="blot blot-2" />
                  <span className="blot blot-3" />
                </div>

                <div className="scatter-coffee-ring" aria-hidden="true" />
              </div>
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
            <section className="timeline-wavy" id="timeline">
              <svg className="timeline-river-svg" viewBox="0 0 1000 2400" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
                <path
                  className="timeline-river-glow"
                  d="M 180 30 C 400 120, 820 200, 800 380 C 780 560, 200 500, 180 680 C 160 860, 780 920, 800 1100 C 820 1280, 180 1220, 180 1400 C 180 1580, 820 1640, 800 1820 C 780 2000, 200 1940, 200 2120 C 200 2280, 600 2340, 500 2400"
                  fill="none"
                  stroke="rgba(159,79,45,0.05)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <path
                  className="timeline-river-path"
                  d="M 180 30 C 400 120, 820 200, 800 380 C 780 560, 200 500, 180 680 C 160 860, 780 920, 800 1100 C 820 1280, 180 1220, 180 1400 C 180 1580, 820 1640, 800 1820 C 780 2000, 200 1940, 200 2120 C 200 2280, 600 2340, 500 2400"
                  fill="none"
                  stroke="rgba(159,79,45,0.2)"
                  strokeWidth="2.5"
                  strokeDasharray="10 5"
                  strokeLinecap="round"
                />
                {timelineGroups.map((_, i) => {
                  const points = [
                    { x: 180, y: 30 },
                    { x: 800, y: 380 },
                    { x: 180, y: 680 },
                    { x: 800, y: 1100 },
                    { x: 180, y: 1400 },
                    { x: 800, y: 1820 },
                    { x: 200, y: 2120 },
                  ]
                  const pt = points[i % points.length]
                  return (
                    <g key={i} className="timeline-river-dot" style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
                      <circle cx={pt.x} cy={pt.y} r="7" fill="rgba(159,79,45,0.5)" />
                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="#f7edd9" />
                    </g>
                  )
                })}
              </svg>

              <div className="timeline-river-list">
                {timelineGroups.map((item, i) => (
                  <article
                    className={`timeline-river-item ${i % 2 === 0 ? 'tr-left' : 'tr-right'}`}
                    key={item.label}
                    style={{
                      '--tr-rot': `${(i % 3 - 1) * 1.8}deg`,
                      '--tr-delay': `${i * 0.08}s`,
                      '--tr-offset': `${(i % 3) * 40}px`,
                    } as CSSProperties}
                  >
                    <div className="tr-card">
                      <div className="tr-card-top">
                        <span className="tr-month">{item.label}</span>
                        <span className="tr-count">{item.fragments.length} {t.fragments}</span>
                      </div>

                      <h3 className="tr-books">
                        {Array.from(item.bookIds)
                          .map((id) => bookMap.get(id)?.title)
                          .filter(Boolean)
                          .slice(0, 3)
                          .join(' / ')}
                      </h3>

                      <div className="tr-excerpts">
                        {item.fragments.slice(0, 3).map((f) => {
                          const bk = bookMap.get(f.bookId)
                          return (
                            <div className="tr-excerpt" key={f.id}>
                              <span className="tr-excerpt-mark" aria-hidden="true">"</span>
                              <p>{f.content.length > 80 ? f.content.slice(0, 80) + '…' : f.content || t.noContent}</p>
                              <small>{bk?.title ?? t.source} · {typeLabel(f.type, lang)}</small>
                            </div>
                          )
                        })}
                      </div>

                      <div className="tr-pin" aria-hidden="true">
                        <span className="tr-pin-head" />
                      </div>
                    </div>
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
                    <span className="settings-section-label">
                      {lang === 'zh' ? '账户' : 'Account'}
                    </span>
                    <div className="settings-toggle-group">
                      {user ? (
                        <div className="auth-user-badge">
                          <span className="auth-email">{user.email}</span>
                          <button type="button" className="auth-logout" onClick={logout}>
                            {lang === 'zh' ? '登出' : 'Log out'}
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="export-btn" onClick={() => setShowLogin(true)}>
                          {lang === 'zh' ? '登录书房' : 'Sign In'}
                        </button>
                      )}
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
                    <div className="settings-toggle-row">
                      <span>{t.replayIntro}</span>
                      <button type="button" className="export-btn" onClick={replayIntro}>
                        {lang === 'zh' ? '播放' : 'Play'}
                      </button>
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

                <article className="settings-card weread-card">
                  <span className="settings-section-label">{t.wereadTitle}</span>
                  <p className="weread-desc">{t.wereadDesc}</p>
                  <div className="weread-ext-hint">
                    <span className="weread-ext-icon" aria-hidden="true">⚡</span>
                    <span>{lang === 'zh' ? '安装 LUCERNA 浏览器扩展后可一键导入，无需手动粘贴 Cookie。' : 'Install LUCERNA browser extension for one-click import — no manual cookie needed.'}</span>
                  </div>
                  <div className="settings-toggle-group">
                    <div className="weread-actions">
                      <a
                        href="https://weread.qq.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="weread-open-btn"
                      >
                        {t.wereadOpen}
                      </a>
                    </div>
                    <p className="weread-hint">{t.wereadHint}</p>
                    <textarea
                      className="weread-cookie-input"
                      value={wereadCookie}
                      onChange={(e) => setWereadCookie(e.target.value)}
                      placeholder={lang === 'zh' ? '或手动粘贴 Cookie' : 'Or paste cookie manually'}
                      rows={2}
                      spellCheck={false}
                    />
                    <div className="weread-actions">
                      <button
                        type="button"
                        className="weread-sync-btn"
                        onClick={() => void handleWeReadSync()}
                        disabled={wereadStatus === 'syncing'}
                      >
                        {wereadStatus === 'syncing' ? t.wereadSyncing : t.wereadSync}
                      </button>
                    </div>
                    {wereadProgress && wereadProgress.phase !== 'done' && (
                      <div className="weread-progress">
                        <div className="weread-progress-bar">
                          <div
                            className="weread-progress-fill"
                            style={{ width: `${wereadProgress.total > 0 ? (wereadProgress.current / wereadProgress.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {wereadMessage && (
                      <div className={`weread-message ${wereadStatus === 'error' ? 'weread-error' : wereadStatus === 'done' ? 'weread-success' : 'weread-info'}`}>
                        {wereadMessage}
                      </div>
                    )}
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
      {showLogin && <LoginPage lang={lang} onClose={() => setShowLogin(false)} />}
    </main>
  )
}

export default App
