import { useState } from 'react'
import './App.css'
import DevPanel from './DevPanel'

type Lang = 'zh' | 'en'

const fragments = [
  {
    quote: {
      zh: '我既在其中，又在其外，同时被生命无穷无尽的变化迷住，又被它推远。',
      en: 'I was within and without, simultaneously enchanted and repelled by the inexhaustible variety of life.',
    },
    book: 'The Great Gatsby',
    meta: {
      zh: '2024 冬 / 位置 1821',
      en: 'Winter 2024 / Location 1821',
    },
    mood: 'city light',
  },
  {
    quote: {
      zh: '在那些深而不见底的夜里，句子像雨一样落下来。',
      en: 'On those bottomless nights, sentences fell like rain.',
    },
    book: 'Norwegian Wood',
    meta: {
      zh: '2025 春 / 位置 711',
      en: 'Spring 2025 / Location 711',
    },
    mood: 'rain night',
  },
  {
    quote: {
      zh: '海与天空是同一种颜色，而沉默有了重量。',
      en: 'The sea was the same color as the sky, and silence had weight.',
    },
    book: 'The Stranger',
    meta: {
      zh: '2025 夏 / 位置 406',
      en: 'Summer 2025 / Location 406',
    },
    mood: 'white heat',
  },
]

const timeline = [
  {
    season: { zh: '2024 冬', en: '2024 Winter' },
    books: 'The Stranger / Snow Country',
    weather: { zh: '孤独 / 冷光', en: 'lonely / cold light' },
  },
  {
    season: { zh: '2025 春', en: '2025 Spring' },
    books: 'No Longer Human / West with the Night',
    weather: { zh: '离别 / 雨', en: 'departure / rain' },
  },
  {
    season: { zh: '2025 夏', en: '2025 Summer' },
    books: 'Borges / The Waves',
    weather: { zh: '海 / 静默', en: 'sea / silence' },
  },
]

const copy = {
  zh: {
    navRoom: '书房',
    navFragments: '碎片',
    navTimeline: '时间线',
    navLibrary: '藏书',
    eyebrow: '印刷档案 / Kindle 阅读痕迹',
    heroTitle: '一间纸上的房间，收藏那些曾经击中你的句子。',
    intro:
      'LUCERNA 将 Kindle 划线变成安静的印刷碎片：日期、天气、页边距，以及你阅读时的自己。',
    import: '导入 My Clippings',
    importStatus: '正在收集阅读痕迹。',
    cardKicker: '今晚的碎片',
    tonightQuote: '一年前的今晚，你在一本关于孤独的书里，划下了这句话。',
    returned: '43 枚碎片在今晚归来。',
    captionOne: '不是 Dashboard',
    captionTwo: '不是第二大脑',
    captionThree: '是一间纸上的阅读房间',
    fragmentsLabel: 'Fragments / 碎片',
    fragmentsTitle: '像撕下的纸条，被夹回旧书页之间。',
    timelineLabel: 'Reading Timeline / 阅读时间线',
    timelineTitle: '你的阅读人生，按照季节而不是数字排列。',
    libraryLabel: 'Library / 藏书',
    libraryTitle: '每一本书，都会形成一个房间。',
    norwegianMeta: '东京夜雨 / 128 枚碎片',
    strangerMeta: '阿尔及尔日光 / 64 枚碎片',
    snowMeta: '冬日静默 / 39 枚碎片',
  },
  en: {
    navRoom: 'The Room',
    navFragments: 'Fragments',
    navTimeline: 'Timeline',
    navLibrary: 'Library',
    eyebrow: 'Printed archive / Kindle traces',
    heroTitle: 'A paper room for sentences that once found you.',
    intro:
      'LUCERNA turns Kindle highlights into quiet printed fragments: dates, weather, margins, and the memory of who you were while reading.',
    import: 'Import My Clippings',
    importStatus: 'Collecting traces of reading.',
    cardKicker: "Tonight's fragment",
    tonightQuote: 'A year ago tonight, you marked this sentence in a book about loneliness.',
    returned: '43 fragments returned tonight.',
    captionOne: 'Not a dashboard',
    captionTwo: 'Not a second brain',
    captionThree: 'A printed reading room',
    fragmentsLabel: 'Fragments',
    fragmentsTitle: 'Collected like torn paper slips, kept between old pages.',
    timelineLabel: 'Reading Timeline',
    timelineTitle: 'Your reading life, arranged by season instead of numbers.',
    libraryLabel: 'Library',
    libraryTitle: 'Every book becomes a room.',
    norwegianMeta: 'Tokyo night rain / 128 fragments',
    strangerMeta: 'Algiers sunlight / 64 fragments',
    snowMeta: 'winter silence / 39 fragments',
  },
}

function App() {
  const [lang, setLang] = useState<Lang>('zh')
  const t = copy[lang]
  const nextLang = lang === 'zh' ? 'en' : 'zh'

  return (
    <main className={`archive is-${lang}`}>
      <div className="paper-noise" />
      <section className="poster">
        <div className="poster-rule top-rule" />
        <nav className="nav" aria-label="Primary navigation">
          <div className="brand">
            <span className="brand-mark">L</span>
            <span>LUCERNA Archive</span>
          </div>
          <div className="nav-links">
            <a href="#room">{t.navRoom}</a>
            <a href="#fragments">{t.navFragments}</a>
            <a href="#timeline">{t.navTimeline}</a>
            <a href="#library">{t.navLibrary}</a>
            <button
              type="button"
              className="language-toggle"
              onClick={() => setLang(nextLang)}
              aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              {lang === 'zh' ? '中文 / EN' : 'EN / 中文'}
            </button>
          </div>
        </nav>

        <div className="hero-grid" id="room">
          <div className="hero-copy">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>
              {t.heroTitle}
            </h1>
            <p className="intro">
              {t.intro}
            </p>
            <div className="hero-actions">
              <button type="button">{t.import}</button>
              <span>{t.importStatus}</span>
            </div>
          </div>

          <div className="room-card" aria-label="Featured reading fragment">
            <div className="ink-figure" />
            <p className="card-kicker">{t.cardKicker}</p>
            <blockquote>
              {t.tonightQuote}
            </blockquote>
            <div className="card-footer">
              <span>{t.returned}</span>
              <span>00:17</span>
            </div>
          </div>
        </div>

        <div className="poster-caption">
          <span>{t.captionOne}</span>
          <span>{t.captionTwo}</span>
          <span>{t.captionThree}</span>
        </div>
        <div className="poster-rule bottom-rule" />
      </section>

      <section className="fragments" id="fragments">
        <div className="section-heading">
          <p>{t.fragmentsLabel}</p>
          <h2>{t.fragmentsTitle}</h2>
        </div>
        <div className="fragment-grid">
          {fragments.map((fragment) => (
            <article className="fragment-card" key={fragment.book}>
              <span>{fragment.mood}</span>
              <p>{fragment.quote[lang]}</p>
              <footer>
                <strong>{fragment.book}</strong>
                <small>{fragment.meta[lang]}</small>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="timeline" id="timeline">
        <div className="section-heading">
          <p>{t.timelineLabel}</p>
          <h2>{t.timelineTitle}</h2>
        </div>
        <div className="timeline-list">
          {timeline.map((item) => (
            <article className="timeline-item" key={item.books}>
              <span>{item.season[lang]}</span>
              <h3>{item.books}</h3>
              <p>{item.weather[lang]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="library" id="library">
        <div>
          <p className="eyebrow">{t.libraryLabel}</p>
          <h2>{t.libraryTitle}</h2>
        </div>
        <div className="library-panel">
          <div>
            <span>Norwegian Wood</span>
            <small>{t.norwegianMeta}</small>
          </div>
          <div>
            <span>The Stranger</span>
            <small>{t.strangerMeta}</small>
          </div>
          <div>
            <span>Snow Country</span>
            <small>{t.snowMeta}</small>
          </div>
        </div>
      </section>
      <DevPanel />
    </main>
  )
}

export default App
