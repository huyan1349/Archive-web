import { useEffect, useState, useMemo } from 'react'
import { useLucerna } from './provider'
import type { Book, Fragment } from '../core'

export interface BookRoom {
  book: Book
  fragments: Fragment[]
  highlights: Fragment[]
  notes: Fragment[]
  bookmarks: Fragment[]
  adjacentMap: Map<string, Fragment[]>
}

export function useBook(bookId: string | undefined) {
  const db = useLucerna()
  const [book, setBook] = useState<Book | null>(null)
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [b, f] = await Promise.all([
        db.books.findById(bookId),
        db.fragments.findByBookId(bookId),
      ])
      if (!cancelled) {
        setBook(b)
        setFragments(f)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [db, bookId])

  const room = useMemo((): BookRoom | null => {
    if (!book) return null
    const sorted = [...fragments].sort((a, b) => {
      const aTime = a.clippedAt?.getTime() ?? 0
      const bTime = b.clippedAt?.getTime() ?? 0
      return aTime - bTime
    })
    const adjacentMap = new Map<string, Fragment[]>()
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i]
      const neighbors: Fragment[] = []
      if (i > 0) neighbors.push(sorted[i - 1])
      if (i < sorted.length - 1) neighbors.push(sorted[i + 1])
      adjacentMap.set(current.id, neighbors)
    }
    return {
      book,
      fragments: sorted,
      highlights: sorted.filter((f) => f.type === 'highlight'),
      notes: sorted.filter((f) => f.type === 'note'),
      bookmarks: sorted.filter((f) => f.type === 'bookmark'),
      adjacentMap,
    }
  }, [book, fragments])

  return { room, loading }
}
