/**
 * 微信读书 API 客户端
 *
 * 通过 Vite 代理绕过 CORS，使用 Cookie 认证访问微信读书网页版 API。
 * 代理配置：vite.config.ts 中 /weread-api → https://i.weread.qq.com
 *
 * 使用流程：
 *   1. 用户在浏览器登录 weread.qq.com
 *   2. 从 DevTools 复制 Cookie
 *   3. 粘贴到 LUCERNA 输入框
 *   4. 调用 syncAllBooks() 一键拉取所有数据
 */

import type {
  WeReadNotebook,
  WeReadBookmark,
  WeReadReview,
  WeReadChapterInfo,
  WeReadReadInfo,
  WeReadBookInfo,
} from './types'

const PROXY_PREFIX = '/weread-api'

export class WeReadClient {
  private cookie: string

  constructor(cookie: string) {
    this.cookie = cookie
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${PROXY_PREFIX}${path}`
    const headers: Record<string, string> = {
      Cookie: this.cookie,
      'Content-Type': 'application/json',
    }
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options?.headers as Record<string, string>) },
      credentials: 'omit',
    })
    if (!res.ok) {
      throw new Error(`WeRead API ${res.status}: ${path}`)
    }
    return res.json() as Promise<T>
  }

  async validate(): Promise<boolean> {
    try {
      const data = await this.request<{ books?: unknown[] }>('/user/notebooks')
      return Array.isArray(data.books)
    } catch {
      return false
    }
  }

  async getNotebooks(): Promise<WeReadNotebook[]> {
    const data = await this.request<{ books: WeReadNotebook[] }>('/user/notebooks')
    return (data.books ?? []).sort((a, b) => b.sort - a.sort)
  }

  async getBookmarks(bookId: string): Promise<WeReadBookmark[]> {
    const data = await this.request<{ updated: WeReadBookmark[] }>(
      `/book/bookmarklist?bookId=${encodeURIComponent(bookId)}`,
    )
    return data.updated ?? []
  }

  async getReviews(bookId: string): Promise<WeReadReview[]> {
    const data = await this.request<{ reviews: WeReadReview[] }>(
      `/review/list?bookId=${encodeURIComponent(bookId)}&listType=11&mine=1&synckey=0`,
    )
    return data.reviews ?? []
  }

  async getChapterInfos(bookIds: string[]): Promise<Map<string, Map<number, WeReadChapterInfo>>> {
    const result = new Map<string, Map<number, WeReadChapterInfo>>()
    const batchSize = 50
    for (let i = 0; i < bookIds.length; i += batchSize) {
      const batch = bookIds.slice(i, i + batchSize)
      try {
        const data = await this.request<{
          data: Array<{ updated: WeReadChapterInfo[] }>
        }>('/book/chapterInfos', {
          method: 'POST',
          body: JSON.stringify({
            bookIds: batch,
            synckeys: batch.map(() => 0),
            teenmode: 0,
          }),
        })
        if (data.data) {
          data.data.forEach((item, idx) => {
            const chapterMap = new Map<number, WeReadChapterInfo>()
            if (item.updated) {
              item.updated.forEach((ch) => chapterMap.set(ch.chapterUid, ch))
            }
            result.set(batch[idx], chapterMap)
          })
        }
      } catch {
        batch.forEach((id) => result.set(id, new Map()))
      }
    }
    return result
  }

  async getReadInfo(bookId: string): Promise<WeReadReadInfo | null> {
    try {
      return await this.request<WeReadReadInfo>(
        `/book/readinfo?bookId=${encodeURIComponent(bookId)}&readingDetail=1&readingBookIndex=1&finishedDate=1`,
      )
    } catch {
      return null
    }
  }

  async getBookInfo(bookId: string): Promise<WeReadBookInfo | null> {
    try {
      return await this.request<WeReadBookInfo>(
        `/book/info?bookId=${encodeURIComponent(bookId)}`,
      )
    } catch {
      return null
    }
  }
}

export interface WeReadSyncProgress {
  phase: 'notebooks' | 'bookmarks' | 'reviews' | 'chapters' | 'done'
  current: number
  total: number
  bookTitle: string
}

export interface WeReadBookData {
  notebook: WeReadNotebook
  bookmarks: WeReadBookmark[]
  reviews: WeReadReview[]
  chapters: Map<number, WeReadChapterInfo>
  readInfo: WeReadReadInfo | null
}

export async function syncAllBooks(
  cookie: string,
  onProgress?: (progress: WeReadSyncProgress) => void,
): Promise<{ books: WeReadBookData[]; errors: string[] }> {
  const client = new WeReadClient(cookie)
  const errors: string[] = []

  onProgress?.({ phase: 'notebooks', current: 0, total: 0, bookTitle: '' })
  const notebooks = await client.getNotebooks()

  if (notebooks.length === 0) {
    return { books: [], errors: ['未找到有笔记的书籍，请确认 Cookie 有效'] }
  }

  const bookIds = notebooks.map((nb) => nb.book.bookId)

  onProgress?.({ phase: 'chapters', current: 0, total: notebooks.length, bookTitle: '' })
  const chapterMap = await client.getChapterInfos(bookIds)

  const books: WeReadBookData[] = []

  for (let i = 0; i < notebooks.length; i++) {
    const nb = notebooks[i]
    const bookId = nb.book.bookId
    const title = nb.book.title

    onProgress?.({
      phase: 'bookmarks',
      current: i + 1,
      total: notebooks.length,
      bookTitle: title,
    })

    try {
      const [bookmarks, reviews, readInfo] = await Promise.all([
        client.getBookmarks(bookId),
        client.getReviews(bookId),
        client.getReadInfo(bookId),
      ])

      books.push({
        notebook: nb,
        bookmarks,
        reviews,
        chapters: chapterMap.get(bookId) ?? new Map(),
        readInfo,
      })
    } catch (e) {
      errors.push(`${title}: ${e instanceof Error ? e.message : '获取失败'}`)
    }

    if (i < notebooks.length - 1) {
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  onProgress?.({ phase: 'done', current: notebooks.length, total: notebooks.length, bookTitle: '' })
  return { books, errors }
}
