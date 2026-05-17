import type { ParsedClipping } from '../parser/types'
import type { Book, Fragment, ImportRecord } from '../database/types'
import { parseClippings } from '../parser/parser'
import { computeSourceHash } from './dedup'

export interface ImportResult {
  importRecord: ImportRecord
  books: Book[]
  fragments: Fragment[]
  skippedHashes: string[]
  failedBlocks: { rawBlock: string; reason: string }[]
}

export interface Repository {
  findBookByTitleAndAuthor(title: string, author: string): Promise<Book | null>
  createBook(book: Book): Promise<void>
  existsFragmentByHash(hash: string): Promise<boolean>
  createFragment(fragment: Fragment): Promise<void>
  createImportRecord(record: ImportRecord): Promise<void>
}

function generateId(): string {
  return crypto.randomUUID()
}

export async function importClippings(
  raw: string,
  sourcePath: string,
  repo: Repository,
): Promise<ImportResult> {
  const parseResult = parseClippings(raw)
  const now = new Date()
  const books: Book[] = []
  const fragments: Fragment[] = []
  const skippedHashes: string[] = []
  const bookCache = new Map<string, Book>()

  for (const clipping of parseResult.clippings) {
    const cacheKey = `${clipping.title}\0${clipping.author}`

    let book: Book | null | undefined = bookCache.get(cacheKey)
    if (!book) {
      book = await repo.findBookByTitleAndAuthor(clipping.title, clipping.author)
      if (!book) {
        book = {
          id: generateId(),
          title: clipping.title,
          author: clipping.author,
          createdAt: now,
          updatedAt: now,
        }
        await repo.createBook(book)
        books.push(book)
      }
      bookCache.set(cacheKey, book)
    }

    const sourceHash = await computeSourceHash(clipping)
    const exists = await repo.existsFragmentByHash(sourceHash)
    if (exists) {
      skippedHashes.push(sourceHash)
      continue
    }

    const fragment = buildFragment(clipping, book.id, sourceHash, now)
    await repo.createFragment(fragment)
    fragments.push(fragment)
  }

  const importRecord: ImportRecord = {
    id: generateId(),
    sourcePath,
    importedAt: now,
    totalBlocks: parseResult.totalBlocks,
    importedCount: fragments.length,
    skippedCount: skippedHashes.length,
    failedCount: parseResult.unparsedCount,
  }
  await repo.createImportRecord(importRecord)

  return {
    importRecord,
    books,
    fragments,
    skippedHashes,
    failedBlocks: parseResult.unparsed,
  }
}

function buildFragment(
  clipping: ParsedClipping,
  bookId: string,
  sourceHash: string,
  now: Date,
): Fragment {
  return {
    id: generateId(),
    bookId,
    type: clipping.type,
    content: clipping.type === 'bookmark' ? '' : clipping.content,
    note: null,
    page: clipping.page,
    location: clipping.location,
    clippedAt: clipping.clippedAt,
    sourceHash,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  }
}
