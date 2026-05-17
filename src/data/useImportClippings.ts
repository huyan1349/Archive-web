import { useState, useCallback } from 'react'
import { useLucerna } from './provider'
import { importClippings, createRepositoryAdapter, type ImportResult } from '../core'

export function useImportClippings() {
  const db = useLucerna()
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const importFile = useCallback(async (raw: string, sourcePath: string) => {
    setImporting(true)
    setError(null)
    try {
      const repo = createRepositoryAdapter(db)
      const importResult = await importClippings(raw, sourcePath, repo)
      setResult(importResult)
      return importResult
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Import failed'
      setError(msg)
      return null
    } finally {
      setImporting(false)
    }
  }, [db])

  const importFromFilePicker = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt'
    return new Promise<ImportResult | null>((resolve) => {
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) { resolve(null); return }
        const raw = await file.text()
        const r = await importFile(raw, file.name)
        resolve(r)
      }
      input.click()
    })
  }, [importFile])

  return { importFile, importFromFilePicker, importing, result, error }
}
