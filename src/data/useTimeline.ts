import { useEffect, useState, useMemo } from 'react'
import { useLucerna } from './provider'
import type { Fragment, Book } from '../core'

export interface SeasonGroup {
  year: number
  season: 'spring' | 'summer' | 'autumn' | 'winter'
  label: string
  fragments: Fragment[]
  books: Book[]
  bookIds: Set<string>
}

function getSeason(month: number): 'spring' | 'summer' | 'autumn' | 'winter' {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

const SEASON_LABELS: Record<string, Record<string, string>> = {
  spring: { zh: '春', en: 'Spring' },
  summer: { zh: '夏', en: 'Summer' },
  autumn: { zh: '秋', en: 'Autumn' },
  winter: { zh: '冬', en: 'Winter' },
}

export function useTimeline(lang: 'zh' | 'en' = 'en') {
  const db = useLucerna()
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [f, b] = await Promise.all([
        db.fragments.findAll(),
        db.books.findAll(),
      ])
      if (!cancelled) {
        setFragments(f)
        setBooks(b)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [db])

  const seasons = useMemo((): SeasonGroup[] => {
    const bookMap = new Map(books.map((b) => [b.id, b]))
    const groups = new Map<string, { fragments: Fragment[]; bookIds: Set<string> }>()

    for (const f of fragments) {
      if (!f.clippedAt) continue
      const year = f.clippedAt.getFullYear()
      const season = getSeason(f.clippedAt.getMonth() + 1)
      const key = `${year}-${season}`
      const group = groups.get(key) ?? { fragments: [], bookIds: new Set<string>() }
      group.fragments.push(f)
      group.bookIds.add(f.bookId)
      groups.set(key, group)
    }

    const result: SeasonGroup[] = []
    for (const [key, group] of groups) {
      const [yearStr, season] = key.split('-') as [string, 'spring' | 'summer' | 'autumn' | 'winter']
      const year = parseInt(yearStr, 10)
      const seasonLabel = SEASON_LABELS[season]?.[lang] ?? season
      result.push({
        year,
        season,
        label: `${year} ${seasonLabel}`,
        fragments: group.fragments.sort(
          (a, b) => (b.clippedAt!.getTime() - a.clippedAt!.getTime()),
        ),
        books: [...group.bookIds]
          .map((id) => bookMap.get(id))
          .filter((b): b is Book => b != null),
        bookIds: group.bookIds,
      })
    }

    result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      const order = { winter: 0, autumn: 1, summer: 2, spring: 3 }
      return order[a.season] - order[b.season]
    })

    return result
  }, [fragments, books, lang])

  return { seasons, loading }
}
