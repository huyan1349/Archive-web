import type { Fragment, Book } from '../database/types'
import { getSeason, getTimeOfDay, SEASON_LABELS } from './reading-analyzer'

export type RecallType = 'anniversary' | 'seasonal' | 'temporal' | 'thematic' | 'first_highlight'

export interface RecallFragment {
  fragment: Fragment
  book: Book | null
  recallType: RecallType
  contextLabel: { zh: string; en: string }
  daysAgo: number
  relevanceScore: number
}

export interface RecallOptions {
  preferSameSeason?: boolean
  preferSameTimeOfDay?: boolean
  preferAnniversary?: boolean
  maxDaysAgo?: number
  minContentLength?: number
  maxResults?: number
}

const DEFAULT_OPTIONS: RecallOptions = {
  preferSameSeason: true,
  preferSameTimeOfDay: true,
  preferAnniversary: true,
  maxDaysAgo: 800,
  minContentLength: 10,
  maxResults: 5,
}

export function computeMidnightRecall(
  fragments: Fragment[],
  books: Book[],
  options?: RecallOptions,
): RecallFragment[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const bookMap = new Map(books.map((b) => [b.id, b]))
  const now = new Date()
  const currentSeason = getSeason(now.getMonth() + 1)
  const currentTimeOfDay = getTimeOfDay(now.getHours())

  const readable = fragments.filter(
    (f) => f.content.trim().length >= (opts.minContentLength ?? 10) && f.type !== 'bookmark',
  )

  if (readable.length === 0) return []

  const scored: RecallFragment[] = []

  for (const f of readable) {
    if (!f.clippedAt) continue

    const daysAgo = Math.floor((now.getTime() - f.clippedAt.getTime()) / (24 * 60 * 60 * 1000))
    if (daysAgo < 1 || daysAgo > (opts.maxDaysAgo ?? 800)) continue

    const fragSeason = getSeason(f.clippedAt.getMonth() + 1)
    const fragTimeOfDay = getTimeOfDay(f.clippedAt.getHours())

    let score = 0
    let recallType: RecallType = 'seasonal'
    let contextLabel: { zh: string; en: string } = { zh: '', en: '' }

    const isAnniversary = Math.abs(daysAgo - 365) <= 3 || Math.abs(daysAgo - 730) <= 5
    if (opts.preferAnniversary && isAnniversary) {
      const years = Math.round(daysAgo / 365)
      score += 40
      recallType = 'anniversary'
      contextLabel = {
        zh: `${years} 年前的${fragSeason === currentSeason ? '这个季节' : '那个季节'}`,
        en: `${years} year${years > 1 ? 's' : ''} ago this ${fragSeason === currentSeason ? 'season' : 'time'}`,
      }
    } else if (opts.preferSameSeason && fragSeason === currentSeason) {
      score += 20
      recallType = 'seasonal'
      contextLabel = {
        zh: `同样是${SEASON_LABELS[fragSeason].zh}天的阅读`,
        en: `Also read in ${SEASON_LABELS[fragSeason].en}`,
      }
    } else if (opts.preferSameTimeOfDay && fragTimeOfDay === currentTimeOfDay) {
      score += 15
      recallType = 'temporal'
      contextLabel = {
        zh: fragTimeOfDay === 'late_night' || fragTimeOfDay === 'night'
          ? '同样在深夜划下的线'
          : '同样时段的阅读',
        en: fragTimeOfDay === 'late_night' || fragTimeOfDay === 'night'
          ? 'Also highlighted late at night'
          : 'Also read at this hour',
      }
    } else {
      score += 5
      recallType = 'thematic'
      contextLabel = {
        zh: '一枚旧日的碎片',
        en: 'A fragment from another day',
      }
    }

    const contentLengthBonus = Math.min(f.content.length / 100, 1) * 5
    score += contentLengthBonus

    if (f.type === 'note') score += 3
    if (f.isFavorite) score += 5

    scored.push({
      fragment: f,
      book: bookMap.get(f.bookId) ?? null,
      recallType,
      contextLabel,
      daysAgo,
      relevanceScore: Math.round(score * 100) / 100,
    })
  }

  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, opts.maxResults)
}

export function computeAnniversaryRecall(
  fragments: Fragment[],
  books: Book[],
): RecallFragment | null {
  const results = computeMidnightRecall(fragments, books, {
    preferAnniversary: true,
    preferSameSeason: false,
    preferSameTimeOfDay: false,
    maxDaysAgo: 800,
    maxResults: 1,
  })
  return results[0] ?? null
}

export function computeSeasonalRecall(
  fragments: Fragment[],
  books: Book[],
): RecallFragment | null {
  const results = computeMidnightRecall(fragments, books, {
    preferAnniversary: false,
    preferSameSeason: true,
    preferSameTimeOfDay: false,
    maxDaysAgo: 400,
    maxResults: 1,
  })
  return results[0] ?? null
}

export function computeFirstHighlight(
  fragments: Fragment[],
  books: Book[],
): RecallFragment | null {
  const bookMap = new Map(books.map((b) => [b.id, b]))
  const dated = fragments
    .filter((f) => f.content.trim().length > 0 && f.clippedAt instanceof Date)
    .sort((a, b) => a.clippedAt!.getTime() - b.clippedAt!.getTime())

  if (dated.length === 0) return null

  const first = dated[0]
  const now = new Date()
  const daysAgo = Math.floor((now.getTime() - first.clippedAt!.getTime()) / (24 * 60 * 60 * 1000))

  return {
    fragment: first,
    book: bookMap.get(first.bookId) ?? null,
    recallType: 'first_highlight',
    contextLabel: {
      zh: '你划下的第一条线',
      en: 'Your first highlight',
    },
    daysAgo,
    relevanceScore: 50,
  }
}
