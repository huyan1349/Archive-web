import { useState } from 'react'
import { createDatabase, createRepositoryAdapter, importClippings, seedIfNeeded } from './core'

type DevStatus = 'idle' | 'loading' | 'success' | 'error'

export default function DevPanel() {
  const [status, setStatus] = useState<DevStatus>('idle')
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState(false)

  async function handleSeed() {
    setStatus('loading')
    setMessage('')
    try {
      const db = await createDatabase()
      const seeded = await seedIfNeeded(db)
      if (seeded) {
        const fragments = await db.fragments.findAll()
        const books = await db.books.findAll()
        setStatus('success')
        setMessage(`${books.length} books, ${fragments.length} fragments imported`)
      } else {
        const fragments = await db.fragments.findAll()
        const books = await db.books.findAll()
        setStatus('success')
        setMessage(`Already seeded: ${books.length} books, ${fragments.length} fragments`)
      }
    } catch (e) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  async function handleImport() {
    setStatus('loading')
    setMessage('')
    try {
      const response = await fetch('/My Clippings.txt')
      if (!response.ok) throw new Error('Failed to fetch My Clippings.txt')
      const raw = await response.text()
      const db = await createDatabase()
      const repo = createRepositoryAdapter(db)
      const result = await importClippings(raw, '/My Clippings.txt', repo)
      setStatus('success')
      setMessage(
        `Imported: ${result.importRecord.importedCount} | Skipped (dup): ${result.importRecord.skippedCount} | Failed: ${result.importRecord.failedCount}`,
      )
    } catch (e) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  async function handleClear() {
    setStatus('loading')
    try {
      const dbs = await indexedDB.databases()
      for (const dbInfo of dbs) {
        if (dbInfo.name === 'lucerna-archive') {
          indexedDB.deleteDatabase('lucerna-archive')
        }
      }
      setStatus('success')
      setMessage('Database cleared')
    } catch (e) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  async function handleCheck() {
    try {
      const db = await createDatabase()
      const fragments = await db.fragments.findAll()
      const books = await db.books.findAll()
      const imports = await db.imports.findAll()
      setStatus('success')
      setMessage(`Books: ${books.length} | Fragments: ${fragments.length} | Imports: ${imports.length}`)
    } catch (e) {
      setStatus('error')
      setMessage(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: 12,
    }}>
      {expanded && (
        <div style={{
          background: 'rgba(0,0,0,0.92)',
          border: '1px solid rgba(233,185,111,0.3)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 8,
          minWidth: 280,
          color: '#f3ead6',
        }}>
          <div style={{ marginBottom: 8, color: '#e9b96f', fontWeight: 600, letterSpacing: '0.1em' }}>
            DEV TOOLS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button onClick={handleSeed} disabled={status === 'loading'} style={btnStyle}>
              Seed Demo Data
            </button>
            <button onClick={handleImport} disabled={status === 'loading'} style={btnStyle}>
              Import My Clippings.txt
            </button>
            <button onClick={handleCheck} style={btnStyle}>
              Check DB Status
            </button>
            <button onClick={handleClear} style={{ ...btnStyle, borderColor: 'rgba(220,80,80,0.5)' }}>
              Clear Database
            </button>
          </div>
          {message && (
            <div style={{
              marginTop: 10,
              padding: '8px 10px',
              borderRadius: 6,
              background: status === 'error' ? 'rgba(220,80,80,0.15)' : 'rgba(233,185,111,0.1)',
              color: status === 'error' ? '#e87070' : '#b9a98e',
              wordBreak: 'break-word' as const,
            }}>
              {message}
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid rgba(233,185,111,0.3)',
          background: 'rgba(0,0,0,0.8)',
          color: '#e9b96f',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 'auto',
        }}
        title="Developer Tools"
      >
        D
      </button>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: '1px solid rgba(233,185,111,0.25)',
  background: 'rgba(233,185,111,0.08)',
  color: '#f3ead6',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: 12,
  textAlign: 'left',
}
