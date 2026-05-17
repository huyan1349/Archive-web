import { useEffect, useState, useMemo } from 'react'
import { useLucerna } from './provider'
import type { Fragment, ClippingType } from '../core'

export interface FragmentFilter {
  bookId?: string
  type?: ClippingType
  favoriteOnly?: boolean
}

export function useFragments(filter?: FragmentFilter) {
  const db = useLucerna()
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      let result: Fragment[]
      if (filter?.favoriteOnly) {
        result = await db.fragments.findFavorites()
      } else {
        result = await db.fragments.findAll()
      }
      if (!cancelled) {
        setFragments(result)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [db, filter?.favoriteOnly])

  const filtered = useMemo(() => {
    let result = fragments
    if (filter?.bookId) {
      result = result.filter((f) => f.bookId === filter.bookId)
    }
    if (filter?.type) {
      result = result.filter((f) => f.type === filter.type)
    }
    return result
  }, [fragments, filter?.bookId, filter?.type])

  return { fragments: filtered, loading }
}
