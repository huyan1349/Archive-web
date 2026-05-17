/**
 * 数据库层模块
 *
 * 使用 IndexedDB 实现，后续迁移到 Tauri + SQLite 时只需替换实现文件。
 *
 * 5 张表：
 * - books: 书籍（id, title, author, createdAt, updatedAt）
 * - fragments: 摘录（id, bookId, type, content, note, page, location, clippedAt, sourceHash, isFavorite）
 * - imports: 导入记录（id, sourcePath, importedAt, totalBlocks, importedCount, skippedCount, failedCount）
 * - moods: 情绪标签（id, name）
 * - fragment_moods: 摘录-情绪关联（fragmentId, moodId）
 *
 * 使用方式：
 *   import { createDatabase, createRepositoryAdapter, seedIfNeeded } from './database'
 *   const db = await createDatabase()        // 初始化数据库
 *   await seedIfNeeded(db)                    // 首次运行时自动导入演示数据
 *   const repo = createRepositoryAdapter(db)  // 适配为 Importer 需要的接口
 */

export type { Book, Fragment, ImportRecord, Mood, FragmentMood } from './types'
export type { Database, BookRepository, FragmentRepository, ImportRepository, MoodRepository, FragmentMoodRepository } from './interfaces'
export { createDatabase } from './indexeddb'
export { createRepositoryAdapter } from './adapter'
export { seedIfNeeded } from './seed'
