import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createDatabase, seedIfNeeded, type Database } from '../core'

const LucernaContext = createContext<Database | null>(null)

export function useLucerna(): Database {
  const db = useContext(LucernaContext)
  if (!db) throw new Error('useLucerna must be used within <LucernaProvider>')
  return db
}

export function LucernaProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const database = await createDatabase()
      await seedIfNeeded(database)
      if (!cancelled) setDb(database)
    })()
    return () => { cancelled = true }
  }, [])

  if (!db) return null

  return (
    <LucernaContext.Provider value={db}>
      {children}
    </LucernaContext.Provider>
  )
}
