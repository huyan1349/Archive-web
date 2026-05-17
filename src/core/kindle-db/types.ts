/**
 * Kindle 设备数据库解析 — 类型定义
 *
 * Kindle 通过 USB 挂载后，system/ 目录下有两个可读的 SQLite 数据库：
 *
 * 1. vocab.db（路径: /Volumes/Kindle/system/vocabulary/vocabulary.db）
 *    - 记录用户在阅读中查过的单词、查词时间、上下文句子
 *    - 包含 WORDS / BOOKS / LOOKUPS 三张表
 *    - 这是 My Clippings.txt 之外最有价值的数据源
 *
 * 2. cc.db（路径: /Volumes/Kindle/system/cc.db）
 *    - 记录设备上所有书籍的元数据（书名、作者、ASIN、封面等）
 *    - 包含 PContent 表
 *    - 可用于补全 My Clippings.txt 中缺失的书籍封面和分类信息
 *
 * 注意：阅读时长数据不通过 USB 暴露，无法获取。
 */

export interface VocabWord {
  id: number
  word: string
  stem: string
  usage: string
  timestamp: number
  bookKey: number | null
  isMastered: boolean
}

export interface VocabBook {
  id: number
  title: string
  author: string
  asin: string | null
  lang: string | null
  wordCount: number
}

export interface VocabLookup {
  wordKey: number
  bookKey: number
  timestamp: number
}

export interface VocabWordWithBook extends VocabWord {
  bookTitle: string | null
  bookAuthor: string | null
  bookAsin: string | null
}

export interface VocabParseResult {
  words: VocabWord[]
  books: VocabBook[]
  lookups: VocabLookup[]
  wordsWithBooks: VocabWordWithBook[]
  totalWords: number
  totalBooks: number
  totalLookups: number
}

export interface CCBook {
  id: number
  title: string
  author: string
  asin: string | null
  pContentType: string | null
  language: string | null
  coverUrl: string | null
}

export interface CCDBParseResult {
  books: CCBook[]
  totalBooks: number
}
