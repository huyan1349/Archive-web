/**
 * Kindle My Clippings.txt 解析模块
 *
 * 解析 Kindle 设备导出的 My Clippings.txt 文件，支持中英文格式。
 *
 * 文件位置: /Volumes/Kindle/documents/My Clippings.txt
 *
 * 支持的类型：
 * - Highlight（英文）/ 标注（中文）
 * - Note（英文）/ 笔记（中文）
 * - Bookmark（英文）/ 书签（中文）
 *
 * 使用方式：
 *   import { parseClippings } from './parser'
 *   const result = parseClippings(rawText)
 *   console.log(result.clippings) // 解析成功的条目
 *   console.log(result.unparsed)  // 解析失败的条目（不阻断主流程）
 */

export { parseClippings, parseBlock, splitBlocks } from './parser'
export { parseTitle, parseMeta } from './patterns'
export type { ParsedClipping, ParseResult, UnparsedBlock, ClippingType } from './types'
