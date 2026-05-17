import { useEffect, useState, useMemo } from 'react'
import { useLucerna } from './provider'
import type { Fragment, Book, ImportRecord } from '../core'

export interface ImportStats {
  totalBooks: number
  totalFragments: number
  totalHighlights: number
  totalNotes: number
  totalBookmarks: number
  totalFavorites: number
  imports: ImportRecord[]
  lastImportAt: Date | null
  mostFragmentedBook: { title: string; author: string; count: number } | null
  dateRange: { earliest: Date | null; latest: Date | null }
}

export function useImportStats() {
  const db = useLucerna()
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [imports, setImports] = useState<ImportRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [f, b, i] = await Promise.all([
        db.fragments.findAll(),
        db.books.findAll(),
        db.imports.findAll(),
      ])
      if (!cancelled) {
        setFragments(f)
        setBooks(b)
        setImports(i)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [db])

  const stats = useMemo((): ImportStats => {
    const highlights = fragments.filter((f) => f.type === 'highlight')
    const notes = fragments.filter((f) => f.type === 'note')
    const bookmarks = fragments.filter((f) => f.type === 'bookmark')
    const favorites = fragments.filter((f) => f.isFavorite)

    const fragByBook = new Map<string, number>()
    for (const f of fragments) {
      fragByBook.set(f.bookId, (fragByBook.get(f.bookId) ?? 0) + 1)
    }
    let mostFragmentedBook: ImportStats['mostFragmentedBook'] = null
    let maxCount = 0
    for (const [bookId, count] of fragByBook) {
      if (count > maxCount) {
        maxCount = count
        const book = books.find((b) => b.id === bookId)
        if (book) {
          mostFragmentedBook = { title: book.title, author: book.author, count }
        }
      }
    }

    const datedFragments = fragments.filter((f) => f.clippedAt)
    const earliest = datedFragments.length > 0
      ? datedFragments.reduce((min, f) => f.clippedAt! < min ? f.clippedAt! : min, datedFragments[0].clippedAt!)
      : null
    const latest = datedFragments.length > 0
      ? datedFragments.reduce((max, f) => f.clippedAt! > max ? f.clippedAt! : max, datedFragments[0].clippedAt!)
      : null

    const lastImport = imports.length > 0
      ? imports.reduce((max, i) => i.importedAt > max ? i.importedAt : max, imports[0].importedAt)
      : null

    return {
      totalBooks: books.length,
      totalFragments: fragments.length,
      totalHighlights: highlights.length,
      totalNotes: notes.length,
      totalBookmarks: bookmarks.length,
      totalFavorites: favorites.length,
      imports,
      lastImportAt: lastImport,
      mostFragmentedBook,
      dateRange: { earliest, latest },
    }
  }, [fragments, books, imports])

  return { stats, loading }
}
