import './App.css'

const fragments = [
  {
    quote:
      'I was within and without, simultaneously enchanted and repelled by the inexhaustible variety of life.',
    book: 'The Great Gatsby',
    meta: 'Winter 2024 · Location 1821',
    mood: 'city light',
  },
  {
    quote: '在那些深而不见底的夜里，句子像雨一样落下来。',
    book: 'Norwegian Wood',
    meta: 'Spring 2025 · Location 711',
    mood: 'rain night',
  },
  {
    quote: 'The sea was the same color as the sky, and silence had weight.',
    book: 'The Stranger',
    meta: 'Summer 2025 · Location 406',
    mood: 'white heat',
  },
]

const timeline = [
  { season: '2024 Winter', books: 'The Stranger · Snow Country', weather: 'lonely / cold light' },
  { season: '2025 Spring', books: 'No Longer Human · West with the Night', weather: 'departure / rain' },
  { season: '2025 Summer', books: 'Borges · The Waves', weather: 'sea / silence' },
]

function App() {
  return (
    <main className="archive">
      <div className="grain" />
      <section className="poster">
        <nav className="nav" aria-label="Primary navigation">
          <div className="brand">
            <span className="brand-mark">L</span>
            <span>LUCERNA Archive</span>
          </div>
          <div className="nav-links">
            <a href="#room">The Room</a>
            <a href="#fragments">Fragments</a>
            <a href="#timeline">Timeline</a>
            <a href="#library">Library</a>
          </div>
        </nav>

        <div className="hero-grid" id="room">
          <div className="hero-copy">
            <p className="eyebrow">A Quiet Place for Your Reading Life</p>
            <h1>
              Enter the room where your reading traces keep breathing.
            </h1>
            <p className="intro">
              LUCERNA turns Kindle highlights into a private archive of nights,
              rooms, weather, and the sentences that once found you.
            </p>
            <div className="hero-actions">
              <button type="button">Import My Clippings</button>
              <span>Listening to your Kindle.</span>
            </div>
          </div>

          <div className="room-card" aria-label="Featured reading fragment">
            <div className="moon" />
            <p className="card-kicker">Tonight's fragment</p>
            <blockquote>
              一年前的今晚，你在一本关于孤独的书里，划下了这句话。
            </blockquote>
            <div className="card-footer">
              <span>43 fragments returned tonight.</span>
              <span>00:17</span>
            </div>
          </div>
        </div>

        <div className="poster-caption">
          <span>Not a dashboard.</span>
          <span>Not a second brain.</span>
          <span>A digital reading room.</span>
        </div>
      </section>

      <section className="fragments" id="fragments">
        <div className="section-heading">
          <p>Fragments</p>
          <h2>Collected like paper slips under a warm lamp.</h2>
        </div>
        <div className="fragment-grid">
          {fragments.map((fragment) => (
            <article className="fragment-card" key={fragment.quote}>
              <span>{fragment.mood}</span>
              <p>{fragment.quote}</p>
              <footer>
                <strong>{fragment.book}</strong>
                <small>{fragment.meta}</small>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="timeline" id="timeline">
        <div className="section-heading">
          <p>Reading Timeline</p>
          <h2>Your reading life, arranged by season instead of statistics.</h2>
        </div>
        <div className="timeline-list">
          {timeline.map((item) => (
            <article className="timeline-item" key={item.season}>
              <span>{item.season}</span>
              <h3>{item.books}</h3>
              <p>{item.weather}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="library" id="library">
        <div>
          <p className="eyebrow">Library</p>
          <h2>Every book becomes a room.</h2>
        </div>
        <div className="library-panel">
          <div>
            <span>Norwegian Wood</span>
            <small>Tokyo night rain · 128 fragments</small>
          </div>
          <div>
            <span>The Stranger</span>
            <small>Algiers sunlight · 64 fragments</small>
          </div>
          <div>
            <span>Snow Country</span>
            <small>winter silence · 39 fragments</small>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
