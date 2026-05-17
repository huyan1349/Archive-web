/**
 * Kindle 设备数据库解析模块
 *
 * 从 Kindle 设备的 SQLite 数据库中提取查词记录和书籍元数据。
 *
 * 使用方式：
 *   import { parseVocabDb, parseCCDb } from './kindle-db'
 *
 *   // 用户选择 vocab.db 文件
 *   const file = event.target.files[0]
 *   const buffer = await file.arrayBuffer()
 *   const result = await parseVocabDb(buffer)
 *   console.log(result.wordsWithBooks) // 查词记录，含书籍信息
 *
 *   // 用户选择 cc.db 文件
 *   const ccResult = await parseCCDb(buffer)
 *   console.log(ccResult.books) // 设备上的所有书籍元数据
 */

export { parseVocabDb, parseCCDb } from './parser'
export type {
  VocabWord,
  VocabBook,
  VocabLookup,
  VocabWordWithBook,
  VocabParseResult,
  CCBook,
  CCDBParseResult,
} from './types'
