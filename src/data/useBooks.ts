import { useEffect, useState, useMemo } from 'react'
import { useLucerna } from './provider'
import type { Book, Fragment } from '../core'

export interface BookWithStats extends Book {
  fragmentCount: number
  highlightCount: number
  noteCount: number
  bookmarkCount: number
  lastClippedAt: Date | null
}

export function useBooks() {
  const db = useLucerna()
  const [books, setBooks] = useState<Book[]>([])
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [b, f] = await Promise.all([
        db.books.findAll(),
        db.fragments.findAll(),
      ])
      if (!cancelled) {
        setBooks(b)
        setFragments(f)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [db])

  const booksWithStats = useMemo((): BookWithStats[] => {
    const fragMap = new Map<string, Fragment[]>()
    for (const f of fragments) {
      const list = fragMap.get(f.bookId) ?? []
      list.push(f)
      fragMap.set(f.bookId, list)
    }

    return books.map((book) => {
      const bookFrags = fragMap.get(book.id) ?? []
      const lastClipped = bookFrags
        .filter((f) => f.clippedAt)
        .sort((a, b) => (b.clippedAt!.getTime() - a.clippedAt!.getTime()))[0]
      return {
        ...book,
        fragmentCount: bookFrags.length,
        highlightCount: bookFrags.filter((f) => f.type === 'highlight').length,
        noteCount: bookFrags.filter((f) => f.type === 'note').length,
        bookmarkCount: bookFrags.filter((f) => f.type === 'bookmark').length,
        lastClippedAt: lastClipped?.clippedAt ?? null,
      }
    }).sort((a, b) => {
      const aTime = a.lastClippedAt?.getTime() ?? 0
      const bTime = b.lastClippedAt?.getTime() ?? 0
      return bTime - aTime
    })
  }, [books, fragments])

  return { books: booksWithStats, loading }
}
