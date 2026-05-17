/**
 * 微信读书 API 类型定义
 *
 * 数据来源：weread.qq.com 网页版逆向 API
 * 认证方式：Cookie（用户在浏览器登录后提取）
 *
 * API 基地址：https://i.weread.qq.com
 * 主要接口：
 *   GET  /user/notebooks        — 获取有笔记的书籍列表
 *   GET  /shelf/sync            — 获取完整书架
 *   GET  /book/info             — 单书详情
 *   POST /book/chapterInfos     — 章节信息
 *   GET  /book/bookmarklist     — 划线列表
 *   GET  /review/list           — 笔记和书评
 *   GET  /book/readinfo         — 阅读时长/进度
 */

export interface WeReadNotebook {
  book: WeReadBookMeta
  sort: number
}

export interface WeReadBookMeta {
  bookId: string
  title: string
  author: string
  cover: string
  categories?: Array<{ title: string }>
  isbn?: string
  newRating?: number
}

export interface WeReadBookmark {
  bookId: string
  chapterUid: number
  range: string
  markText: string
  style: WeReadMarkStyle
  colorStyle: WeReadMarkColor
  createTime: number
  reviewId: string | null
  abstract?: string
}

export type WeReadMarkStyle = 0 | 1 | 2
export type WeReadMarkColor = 0 | 1 | 2 | 3 | 4 | 5

export interface WeReadReview {
  review: {
    type: WeReadReviewType
    content: string
    markText?: string
    chapterUid?: number
    createTime: number
    reviewId: string
  }
}

export type WeReadReviewType = 1 | 4

export interface WeReadChapterInfo {
  chapterUid: number
  title: string
  level: number
}

export interface WeReadReadInfo {
  readingTime: number
  readingProgress: number
  markedStatus: WeReadReadStatus
  finishedDate?: number
}

export type WeReadReadStatus = 0 | 4

export interface WeReadBookInfo {
  isbn: string
  newRating: number
  title: string
  author: string
  cover: string
  bookId: string
}

export interface WeReadSyncResult {
  totalBooks: number
  totalHighlights: number
  totalNotes: number
  totalReviews: number
  errors: string[]
}

export interface WeReadBookData {
  notebook: WeReadNotebook
  bookmarks: WeReadBookmark[]
  reviews: WeReadReview[]
  chapters: Map<number, { title: string; level: number }>
}
