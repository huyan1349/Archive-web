import { importClippings } from '../importer/importer'
import type { Database } from '../database/interfaces'
import { createRepositoryAdapter } from '../database/adapter'

const DEMO_CLIPPINGS_PATH = '/My Clippings.txt'

export async function seedIfNeeded(db: Database): Promise<boolean> {
  const fragments = await db.fragments.findAll()
  if (fragments.length > 0) return false

  const response = await fetch(DEMO_CLIPPINGS_PATH)
  if (!response.ok) return false

  const raw = await response.text()
  const repo = createRepositoryAdapter(db)
  const result = await importClippings(raw, DEMO_CLIPPINGS_PATH, repo)

  return result.importRecord.importedCount > 0
}
