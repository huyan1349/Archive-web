/**
 * 微信读书导入模块
 *
 * 一键从微信读书同步划线、笔记和书评到 LUCERNA Archive。
 *
 * 使用方式：
 *   import { WeReadClient, syncAllBooks, importWeReadBooks } from './core/weread'
 *
 *   // 1. 验证 Cookie
 *   const client = new WeReadClient(cookie)
 *   const valid = await client.validate()
 *
 *   // 2. 拉取所有数据
 *   const { books, errors } = await syncAllBooks(cookie, onProgress)
 *
 *   // 3. 写入数据库
 *   const db = await createDatabase()
 *   const repo = createRepositoryAdapter(db)
 *   const result = await importWeReadBooks(books, repo, errors)
 *
 * 认证：用户在浏览器登录 weread.qq.com 后，从 DevTools 复制 Cookie。
 * 代理：vite.config.ts 中 /weread-api → https://i.weread.qq.com
 */

export { WeReadClient, syncAllBooks } from './client'
export type { WeReadSyncProgress, WeReadBookData } from './client'

export { importWeReadBooks } from './parser'
export type { WeReadImportResult } from './parser'

export type {
  WeReadNotebook,
  WeReadBookMeta,
  WeReadBookmark,
  WeReadMarkStyle,
  WeReadMarkColor,
  WeReadReview,
  WeReadReviewType,
  WeReadChapterInfo,
  WeReadReadInfo,
  WeReadReadStatus,
  WeReadBookInfo,
  WeReadSyncResult,
} from './types'
