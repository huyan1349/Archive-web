import type { Fragment, Book } from '../database/types'
import type { Season } from './types'
import { getSeason, SEASON_LABELS } from './reading-analyzer'
import { detectSessions } from './session-detector'

export interface ReadingLetter {
  year: number
  season: Season | null
  title: { zh: string; en: string }
  subtitle: { zh: string; en: string }
  paragraphs: LetterParagraph[]
  stats: LetterStats
  milestones: LetterMilestone[]
}

export interface LetterParagraph {
  text: { zh: string; en: string }
  type: 'opening' | 'stat' | 'milestone' | 'observation' | 'closing'
}

export interface LetterStats {
  totalBooks: number
  totalFragments: number
  totalHighlights: number
  totalNotes: number
  totalReadingDays: number
  averageFragmentLength: number
  nightHighlightRatio: number
  peakHour: number | null
  peakSeason: Season | null
  quietestMonth: string | null
  busiestMonth: string | null
}

export interface LetterMilestone {
  date: Date
  type: 'first_book' | 'most_highlighted' | 'longest_session' | 'seasonal_peak'
  description: { zh: string; en: string }
}

export function generateReadingLetter(
  fragments: Fragment[],
  books: Book[],
  options?: { year?: number; season?: Season | null },
): ReadingLetter | null {
  const year = options?.year ?? new Date().getFullYear()
  const season = options?.season ?? null

  const yearFragments = fragments.filter(
    (f) => f.clippedAt instanceof Date && f.clippedAt.getFullYear() === year,
  )

  const targetFragments = season
    ? yearFragments.filter((f) => getSeason(f.clippedAt!.getMonth() + 1) === season)
    : yearFragments

  if (targetFragments.length === 0) return null

  const targetBookIds = new Set(targetFragments.map((f) => f.bookId))
  const targetBooks = books.filter((b) => targetBookIds.has(b.id))

  const stats = computeLetterStats(targetFragments, year)
  const milestones = computeMilestones(targetFragments, books, year)
  const paragraphs = composeParagraphs(stats, milestones, targetFragments, targetBooks, year, season)

  const seasonLabel = season ? SEASON_LABELS[season] : null
  const title = season && seasonLabel
    ? { zh: `${year} 年${seasonLabel.zh}季阅读信`, en: `${seasonLabel.en} ${year} Reading Letter` }
    : { zh: `${year} 年阅读信`, en: `${year} Reading Letter` }

  const subtitle = season && seasonLabel
    ? { zh: `来自你${seasonLabel.zh}季阅读自己的信`, en: `A letter from your ${seasonLabel.en.toLowerCase()} reading self` }
    : { zh: '来自你阅读自己的信', en: 'A letter from your reading self' }

  return {
    year,
    season,
    title,
    subtitle,
    paragraphs,
    stats,
    milestones,
  }
}

function computeLetterStats(
  fragments: Fragment[],
  _year: number,
): LetterStats {
  const dated = fragments.filter((f) => f.clippedAt instanceof Date)
  const bookIds = new Set(fragments.map((f) => f.bookId))

  const highlights = fragments.filter((f) => f.type === 'highlight')
  const notes = fragments.filter((f) => f.type === 'note')

  const daySet = new Set<string>()
  for (const f of dated) {
    daySet.add(f.clippedAt!.toISOString().slice(0, 10))
  }

  const avgLen = fragments.length > 0
    ? Math.round(fragments.reduce((s, f) => s + f.content.length, 0) / fragments.length)
    : 0

  const hourCounts = new Array(24).fill(0) as number[]
  for (const f of dated) {
    hourCounts[f.clippedAt!.getHours()]++
  }
  const peakHour = hourCounts.reduce((maxIdx, count, idx, arr) =>
    count > arr[maxIdx] ? idx : maxIdx, 0)
  const hasPeak = hourCounts[peakHour] > 0

  const nightHours = [22, 23, 0, 1, 2, 3, 4]
  const nightCount = nightHours.reduce((s, h) => s + hourCounts[h], 0)
  const totalWithHour = hourCounts.reduce((s, c) => s + c, 0)
  const nightRatio = totalWithHour > 0 ? nightCount / totalWithHour : 0

  const seasonCounts: Record<Season, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 }
  for (const f of dated) {
    seasonCounts[getSeason(f.clippedAt!.getMonth() + 1)]++
  }
  const peakSeason = (Object.entries(seasonCounts) as [Season, number][])
    .sort((a, b) => b[1] - a[1])[0][0]

  const monthCounts = new Map<number, number>()
  for (const f of dated) {
    const m = f.clippedAt!.getMonth()
    monthCounts.set(m, (monthCounts.get(m) ?? 0) + 1)
  }
  const monthNamesZh = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  let quietestMonth: string | null = null
  let busiestMonth: string | null = null
  let minCount = Infinity
  let maxCount = 0
  for (const [m, count] of monthCounts) {
    if (count < minCount) { minCount = count; quietestMonth = monthNamesZh[m] }
    if (count > maxCount) { maxCount = count; busiestMonth = monthNamesZh[m] }
  }

  return {
    totalBooks: bookIds.size,
    totalFragments: fragments.length,
    totalHighlights: highlights.length,
    totalNotes: notes.length,
    totalReadingDays: daySet.size,
    averageFragmentLength: avgLen,
    nightHighlightRatio: Math.round(nightRatio * 100) / 100,
    peakHour: hasPeak ? peakHour : null,
    peakSeason,
    quietestMonth,
    busiestMonth,
  }
}

function computeMilestones(
  fragments: Fragment[],
  books: Book[],
  year: number,
): LetterMilestone[] {
  const bookMap = new Map(books.map((b) => [b.id, b]))
  const milestones: LetterMilestone[] = []
  const dated = fragments
    .filter((f) => f.clippedAt instanceof Date)
    .sort((a, b) => a.clippedAt!.getTime() - b.clippedAt!.getTime())

  if (dated.length === 0) return milestones

  const firstBookId = dated[0].bookId
  const firstBook = bookMap.get(firstBookId)
  if (firstBook) {
    milestones.push({
      date: dated[0].clippedAt!,
      type: 'first_book',
      description: {
        zh: `你在${formatMonth(dated[0].clippedAt!)}遇见了《${firstBook.title}》`,
        en: `In ${formatMonthEn(dated[0].clippedAt!)}, you met "${firstBook.title}"`,
      },
    })
  }

  const bookFragCounts = new Map<string, number>()
  for (const f of fragments) {
    bookFragCounts.set(f.bookId, (bookFragCounts.get(f.bookId) ?? 0) + 1)
  }
  let mostBookId = ''
  let mostCount = 0
  for (const [id, count] of bookFragCounts) {
    if (count > mostCount) { mostCount = count; mostBookId = id }
  }
  const mostBook = bookMap.get(mostBookId)
  if (mostBook && mostCount >= 3) {
    milestones.push({
      date: new Date(year, 6, 1),
      type: 'most_highlighted',
      description: {
        zh: `《${mostBook.title}》是你划线最多的书——${mostCount} 枚碎片`,
        en: `"${mostBook.title}" was your most highlighted book — ${mostCount} fragments`,
      },
    })
  }

  const sessions = detectSessions(fragments, books)
  if (sessions.length > 0) {
    const longest = sessions.reduce((max, s) =>
      s.durationMinutes > max.durationMinutes ? s : max, sessions[0])
    if (longest.durationMinutes >= 30) {
      milestones.push({
        date: longest.startedAt,
        type: 'longest_session',
        description: {
          zh: `你最沉浸的一次阅读长达 ${longest.durationMinutes} 分钟`,
          en: `Your deepest reading session lasted ${longest.durationMinutes} minutes`,
        },
      })
    }
  }

  return milestones
}

function composeParagraphs(
  stats: LetterStats,
  milestones: LetterMilestone[],
  fragments: Fragment[],
  _books: Book[],
  year: number,
  _season: Season | null,
): LetterParagraph[] {
  const paragraphs: LetterParagraph[] = []

  paragraphs.push({
    type: 'opening',
    text: {
      zh: `${year} 年，你读了 ${stats.totalBooks} 本书，留下了 ${stats.totalFragments} 枚碎片。`,
      en: `In ${year}, you read ${stats.totalBooks} books and left ${stats.totalFragments} fragments.`,
    },
  })

  if (stats.nightHighlightRatio > 0.4) {
    paragraphs.push({
      type: 'observation',
      text: {
        zh: `你是一个夜读者。${Math.round(stats.nightHighlightRatio * 100)}% 的划线发生在夜晚。`,
        en: `You are a night reader. ${Math.round(stats.nightHighlightRatio * 100)}% of your highlights were made after dark.`,
      },
    })
  }

  if (stats.peakHour !== null && (stats.peakHour >= 22 || stats.peakHour <= 3)) {
    paragraphs.push({
      type: 'observation',
      text: {
        zh: `你划线最多的时刻是${stats.peakHour}:00。深夜的句子，总是比白天更长。`,
        en: `You highlighted most around ${stats.peakHour}:00. Sentences marked at night always seem longer than daytime ones.`,
      },
    })
  }

  if (stats.quietestMonth) {
    paragraphs.push({
      type: 'observation',
      text: {
        zh: `你最安静的一个月是${stats.quietestMonth}——只划了很少的线。`,
        en: `Your quietest month was ${stats.quietestMonth} — you barely highlighted at all.`,
      },
    })
  }

  for (const m of milestones) {
    paragraphs.push({
      type: 'milestone',
      text: m.description,
    })
  }

  const nightFragments = fragments.filter(
    (f) => f.clippedAt && (f.clippedAt.getHours() >= 22 || f.clippedAt.getHours() <= 3) && f.content.length > 0,
  )
  const dayFragments = fragments.filter(
    (f) => f.clippedAt && f.clippedAt.getHours() >= 8 && f.clippedAt.getHours() <= 18 && f.content.length > 0,
  )
  if (nightFragments.length >= 3 && dayFragments.length >= 3) {
    const avgNightLen = nightFragments.reduce((s, f) => s + f.content.length, 0) / nightFragments.length
    const avgDayLen = dayFragments.reduce((s, f) => s + f.content.length, 0) / dayFragments.length
    if (avgNightLen > avgDayLen * 1.2) {
      paragraphs.push({
        type: 'observation',
        text: {
          zh: '你在深夜划下的句子，总是比白天更长。',
          en: 'The sentences you highlight at night are always longer than the daytime ones.',
        },
      })
    }
  }

  paragraphs.push({
    type: 'closing',
    text: {
      zh: '这些碎片，是你阅读时留下的自己。它们还在等你回来。',
      en: 'These fragments are the self you left behind while reading. They are still waiting for you to return.',
    },
  })

  return paragraphs
}

function formatMonth(d: Date): string {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return months[d.getMonth()]
}

function formatMonthEn(d: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[d.getMonth()]
}
