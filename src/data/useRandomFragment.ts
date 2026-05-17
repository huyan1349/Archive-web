import { useEffect, useState, useCallback } from 'react'
import { useLucerna } from './provider'
import type { Fragment } from '../core'

export function useRandomFragment() {
  const db = useLucerna()
  const [fragment, setFragment] = useState<Fragment | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const all = await db.fragments.findAll()
    const highlights = all.filter((f) => f.type === 'highlight' && f.content.length > 0)
    if (highlights.length === 0) {
      setFragment(null)
      setLoading(false)
      return
    }
    const idx = Math.floor(Math.random() * highlights.length)
    setFragment(highlights[idx])
    setLoading(false)
  }, [db])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { fragment, loading, refresh }
}
