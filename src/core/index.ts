/**
 * LUCERNA Archive — 核心数据层
 *
 * 所有业务逻辑都在这里，前端只负责渲染。
 *
 * 模块结构：
 *   parser/     — My Clippings.txt 解析（中英文 Highlight/Note/Bookmark）
 *   importer/   — 导入编排（解析 → 去重 → 写入数据库）
 *   database/   — 数据库抽象层（当前 IndexedDB，后续可换 SQLite）
 *   kindle-db/  — Kindle 设备 SQLite 数据库解析（vocab.db 查词 / cc.db 书籍元数据）
 *   analysis/   — 数据分析引擎（阅读天气 / 阅读基因 / 午夜回响 / 跨书关联 / 阅读年信 / 阅读会话）
 *   auth/       — 认证模块（Supabase 邮箱+密码 / Magic Link）
 *
 * 前端使用方式：
 *   import { createDatabase, importClippings, createRepositoryAdapter, seedIfNeeded } from './core'
 *   import { parseVocabDb, parseCCDb } from './core'
 *   import { computeReadingWeather, computeMidnightRecall, findAllConnections, generateReadingLetter } from './core'
 *   import { isSupabaseConfigured, signUpWithEmail, loginWithEmail, sendMagicLink } from './core'
 */

export { parseClippings, parseBlock, splitBlocks } from './parser'
export type { ParsedClipping, ParseResult, UnparsedBlock, ClippingType } from './parser/types'

export { importClippings } from './importer'
export { computeSourceHash } from './importer/dedup'
export type { ImportResult, Repository } from './importer/importer'

export { createDatabase, createRepositoryAdapter, seedIfNeeded } from './database'
export type { Book, Fragment, ImportRecord, Mood, FragmentMood } from './database/types'
export type { Database } from './database/interfaces'

export { parseVocabDb, parseCCDb } from './kindle-db'
export type { VocabWord, VocabBook, VocabLookup, VocabWordWithBook, VocabParseResult, CCBook, CCDBParseResult } from './kindle-db/types'

export { computeReadingWeather, computeReadingDNA, computeHourDistribution, computeSeasonDistribution, computeMonthlyActivity, getSeason, getTimeOfDay, SEASON_LABELS, TIME_LABELS, READER_TYPE_LABELS } from './analysis'
export type { ReadingWeather, ReadingDNA, HourDistribution, SeasonDistribution, MonthlyActivity, ReadingAnalyzerInput, Season, TimeOfDay, ReaderType } from './analysis'

export { detectSessions, computeSessionStats } from './analysis'
export type { ReadingSession, SessionStats } from './analysis'

export { findKeywordConnections, findTemporalConnections, findThematicClusters, findAllConnections } from './analysis'
export type { FragmentConnection, ConnectionType, KeywordCluster } from './analysis'

export { computeMidnightRecall, computeAnniversaryRecall, computeSeasonalRecall, computeFirstHighlight } from './analysis'
export type { RecallFragment, RecallType, RecallOptions } from './analysis'

export { generateReadingLetter } from './analysis'
export type { ReadingLetter, LetterParagraph, LetterStats, LetterMilestone } from './analysis'

export { isSupabaseConfigured } from './auth'
export { signUpWithEmail, loginWithEmail, sendMagicLink, logout, getCurrentSession, getCurrentUser, onAuthStateChange } from './auth'
export type { AuthUser, AuthSession, AuthMode, AuthState, AuthError, SignUpResult, LoginResult, MagicLinkResult } from './auth'
