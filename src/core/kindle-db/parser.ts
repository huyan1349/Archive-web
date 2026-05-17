/**
 * Kindle 设备数据库解析器
 *
 * 使用 sql.js（WebAssembly SQLite）在浏览器中读取 Kindle 的 SQLite 数据库文件。
 *
 * 支持的数据库：
 * - vocab.db: 查词记录（WORDS / BOOKS / LOOKUPS 表）
 * - cc.db: 书籍元数据（PContent 表）
 *
 * 使用方式：
 *   const arrayBuffer = await file.arrayBuffer()
 *   const result = await parseVocabDb(arrayBuffer)
 *
 * 容错策略：
 * - 先尝试按已知列名查询，失败后回退到 SELECT * + 动态列映射
 * - 单表解析失败不阻断其他表的解析
 * - 数据库文件不存在或格式不对时返回空结果而非抛错
 */

import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js'
import type { VocabWord, VocabBook, VocabLookup, VocabWordWithBook, VocabParseResult, CCBook, CCDBParseResult } from './types'

let sqlJsInstance: ReturnType<typeof initSqlJs> | null = null

async function getSqlJs() {
  if (!sqlJsInstance) {
    sqlJsInstance = initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    })
  }
  return sqlJsInstance
}

async function openSqlite(arrayBuffer: ArrayBuffer): Promise<SqlJsDatabase> {
  const SQL = await getSqlJs()
  return new SQL.Database(new Uint8Array(arrayBuffer))
}

function rowsToObjects(columns: string[], values: unknown[][]): Record<string, unknown>[] {
  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
}

export async function parseVocabDb(arrayBuffer: ArrayBuffer): Promise<VocabParseResult> {
  const db = await openSqlite(arrayBuffer)

  const words: VocabWord[] = []
  const books: VocabBook[] = []
  const lookups: VocabLookup[] = []

  try {
    const result = db.exec('SELECT id, word, stem, usage, timestamp, book_key, is_mastered FROM WORDS ORDER BY timestamp DESC')
    if (result.length > 0 && result[0].values) {
      for (const row of result[0].values) {
        words.push({
          id: row[0] as number,
          word: row[1] as string,
          stem: row[2] as string,
          usage: (row[3] as string) ?? '',
          timestamp: row[4] as number,
          bookKey: row[5] as number | null,
          isMastered: !!(row[6] as number),
        })
      }
    }
  } catch {
    try {
      const result = db.exec('SELECT * FROM WORDS ORDER BY rowid DESC LIMIT 2000')
      if (result.length > 0 && result[0].values) {
        for (const obj of rowsToObjects(result[0].columns, result[0].values)) {
          words.push({
            id: (obj.id as number) ?? 0,
            word: (obj.word as string) ?? '',
            stem: (obj.stem as string) ?? '',
            usage: (obj.usage as string) ?? '',
            timestamp: (obj.timestamp as number) ?? 0,
            bookKey: (obj.book_key as number) ?? null,
            isMastered: !!(obj.is_mastered as number),
          })
        }
      }
    } catch { /* WORDS 表不存在 */ }
  }

  try {
    const result = db.exec('SELECT id, title, author, asin, lang FROM BOOKS')
    if (result.length > 0 && result[0].values) {
      for (const row of result[0].values) {
        books.push({
          id: row[0] as number,
          title: row[1] as string,
          author: (row[2] as string) ?? '',
          asin: row[3] as string | null,
          lang: row[4] as string | null,
          wordCount: 0,
        })
      }
    }
  } catch {
    try {
      const result = db.exec('SELECT * FROM BOOKS')
      if (result.length > 0 && result[0].values) {
        for (const obj of rowsToObjects(result[0].columns, result[0].values)) {
          books.push({
            id: (obj.id as number) ?? 0,
            title: (obj.title as string) ?? '',
            author: (obj.author as string) ?? '',
            asin: (obj.asin as string) ?? null,
            lang: (obj.lang as string) ?? null,
            wordCount: 0,
          })
        }
      }
    } catch { /* BOOKS 表不存在 */ }
  }

  try {
    const result = db.exec('SELECT word_key, book_key, timestamp FROM LOOKUPS ORDER BY timestamp DESC')
    if (result.length > 0 && result[0].values) {
      for (const row of result[0].values) {
        lookups.push({
          wordKey: row[0] as number,
          bookKey: row[1] as number,
          timestamp: row[2] as number,
        })
      }
    }
  } catch { /* LOOKUPS 表不存在 */ }

  const bookMap = new Map(books.map((b) => [b.id, b]))
  const bookWordCounts = new Map<number, number>()
  for (const w of words) {
    if (w.bookKey != null) {
      bookWordCounts.set(w.bookKey, (bookWordCounts.get(w.bookKey) ?? 0) + 1)
    }
  }
  for (const book of books) {
    book.wordCount = bookWordCounts.get(book.id) ?? 0
  }

  const wordsWithBooks: VocabWordWithBook[] = words.map((w) => {
    const book = w.bookKey != null ? bookMap.get(w.bookKey) : null
    return {
      ...w,
      bookTitle: book?.title ?? null,
      bookAuthor: book?.author ?? null,
      bookAsin: book?.asin ?? null,
    }
  })

  db.close()

  return {
    words,
    books,
    lookups,
    wordsWithBooks,
    totalWords: words.length,
    totalBooks: books.length,
    totalLookups: lookups.length,
  }
}

export async function parseCCDb(arrayBuffer: ArrayBuffer): Promise<CCDBParseResult> {
  const db = await openSqlite(arrayBuffer)
  const books: CCBook[] = []

  try {
    const result = db.exec('SELECT p_content_id, title, authors, asin, p_content_type, language, cover FROM PContent')
    if (result.length > 0 && result[0].values) {
      for (const row of result[0].values) {
        books.push({
          id: row[0] as number,
          title: row[1] as string,
          author: (row[2] as string) ?? '',
          asin: row[3] as string | null,
          pContentType: row[4] as string | null,
          language: row[5] as string | null,
          coverUrl: row[6] as string | null,
        })
      }
    }
  } catch {
    try {
      const result = db.exec('SELECT * FROM PContent')
      if (result.length > 0 && result[0].values) {
        for (const obj of rowsToObjects(result[0].columns, result[0].values)) {
          books.push({
            id: (obj.p_content_id as number) ?? 0,
            title: (obj.title as string) ?? '',
            author: (obj.authors as string) ?? '',
            asin: (obj.asin as string) ?? null,
            pContentType: (obj.p_content_type as string) ?? null,
            language: (obj.language as string) ?? null,
            coverUrl: (obj.cover as string) ?? null,
          })
        }
      }
    } catch { /* PContent 表不存在 */ }
  }

  db.close()

  return { books, totalBooks: books.length }
}
