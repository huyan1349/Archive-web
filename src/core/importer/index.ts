/**
 * 导入编排模块
 *
 * 将 Parser 解析出的 Clippings 编排写入数据库，包含去重和导入记录。
 *
 * 流程：解析 → 计算 source_hash → 去重 → 创建 Book → 创建 Fragment → 记录 Import
 *
 * 去重策略：基于 title + author + type + location + content + clippedAt 的 SHA-256 哈希
 *
 * 使用方式：
 *   import { importClippings } from './importer'
 *   const db = await createDatabase()
 *   const repo = createRepositoryAdapter(db)
 *   const result = await importClippings(rawText, 'My Clippings.txt', repo)
 */

export { importClippings } from './importer'
export { computeSourceHash, buildHashPayload } from './dedup'
export type { ImportResult, Repository } from './importer'
