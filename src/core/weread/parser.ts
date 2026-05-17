/**
 * 微信读书数据 → LUCERNA Book/Fragment 转换器
 *
 * 把 WeReadClient 拉取的原始数据转换成 LUCERNA 的数据结构，
 * 然后通过 Repository 接口写入数据库（复用 Kindle 导入的去重和写入逻辑）。
 *
 * 数据映射：
 *   WeReadBookmark (reviewId=null)  → Fragment type='highlight'
 *   WeReadBookmark (reviewId!=null) → Fragment type='highlight' + note 字段
 *   WeReadReview   (type=1)         → Fragment type='note'
 *   WeReadReview   (type=4)         → Fragment type='note'（书评）
 */

import type { Book, Fragment, ImportRecord, ClippingType } from '../database/types'
import type { WeReadBookData, WeReadSyncResult } from './types'
import type { Repository } from '../importer/importer'

function generateId(): string {
  return crypto.randomUUID()
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  const array = Array.from(new Uint8Array(buffer))
  return array.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function buildWeReadHash(
  bookId: string,
  markText: string,
  range: string,
  createTime: number,
): Promise<string> {
  const payload = [bookId, markText, range, String(createTime)].join('\u0000')
  return sha256(`weread\u0000${payload}`)
}

function resolveChapterTitle(
  chapterUid: number | undefined,
  chapters: Map<number, { title: string; level: number }>,
): string {
  if (chapterUid == null) return ''
  const ch = chapters.get(chapterUid)
  return ch ? ch.title : ''
}

function parseRange(range: string): string {
  if (!range) return ''
  const parts = range.split('-')
  if (parts.length === 2) return `Loc. ${parts[0]}-${parts[1]}`
  return `Loc. ${range}`
}

function timestampToDate(ts: number | undefined): Date | null {
  if (!ts || ts === 0) return null
  return new Date(ts * 1000)
}

export interface WeReadImportResult {
  importRecord: ImportRecord
  books: Book[]
  fragments: Fragment[]
  skippedCount: number
  errors: string[]
  stats: WeReadSyncResult
}

export async function importWeReadBooks(
  booksData: WeReadBookData[],
  repo: Repository,
  errors: string[],
): Promise<WeReadImportResult> {
  const now = new Date()
  const allBooks: Book[] = []
  const allFragments: Fragment[] = []
  let skippedCount = 0
  let totalHighlights = 0
  let totalNotes = 0
  let totalReviews = 0

  for (const bookData of booksData) {
    const meta = bookData.notebook.book

    let book = await repo.findBookByTitleAndAuthor(meta.title, meta.author)
    if (!book) {
      book = {
        id: generateId(),
        title: meta.title,
        author: meta.author,
        createdAt: now,
        updatedAt: now,
      }
      await repo.createBook(book)
    }
    allBooks.push(book)

    for (const bm of bookData.bookmarks) {
      const clippedAt = timestampToDate(bm.createTime)
      const location = parseRange(bm.range)
      const chapterTitle = resolveChapterTitle(bm.chapterUid, bookData.chapters)
      const content = bm.markText.trim()
      if (!content) continue

      const sourceHash = await buildWeReadHash(meta.bookId, content, bm.range, bm.createTime)
      const exists = await repo.existsFragmentByHash(sourceHash)
      if (exists) {
        skippedCount++
        continue
      }

      const hasNote = bm.reviewId != null
      const fragmentType: ClippingType = 'highlight'
      totalHighlights++

      const fragment: Fragment = {
        id: generateId(),
        bookId: book.id,
        type: fragmentType,
        content,
        note: hasNote ? null : null,
        page: chapterTitle || null,
        location: location || null,
        clippedAt,
        sourceHash,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      }
      await repo.createFragment(fragment)
      allFragments.push(fragment)
    }

    for (const rv of bookData.reviews) {
      const review = rv.review
      const clippedAt = timestampToDate(review.createTime)
      const content = review.content?.trim()
      if (!content) continue

      const sourceHash = await buildWeReadHash(
        meta.bookId,
        content,
        `review-${review.reviewId}`,
        review.createTime,
      )
      const exists = await repo.existsFragmentByHash(sourceHash)
      if (exists) {
        skippedCount++
        continue
      }

      const chapterTitle = resolveChapterTitle(review.chapterUid, bookData.chapters)
      const fragmentType: ClippingType = 'note'

      if (review.type === 4) {
        totalReviews++
      } else {
        totalNotes++
      }

      const fragment: Fragment = {
        id: generateId(),
        bookId: book.id,
        type: fragmentType,
        content,
        note: review.markText?.trim() || null,
        page: chapterTitle || null,
        location: null,
        clippedAt,
        sourceHash,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      }
      await repo.createFragment(fragment)
      allFragments.push(fragment)
    }
  }

  const importRecord: ImportRecord = {
    id: generateId(),
    sourcePath: '微信读书 (WeRead)',
    importedAt: now,
    totalBlocks: totalHighlights + totalNotes + totalReviews,
    importedCount: allFragments.length,
    skippedCount,
    failedCount: errors.length,
  }
  await repo.createImportRecord(importRecord)

  return {
    importRecord,
    books: allBooks,
    fragments: allFragments,
    skippedCount,
    errors,
    stats: {
      totalBooks: allBooks.length,
      totalHighlights,
      totalNotes,
      totalReviews,
      errors,
    },
  }
}
