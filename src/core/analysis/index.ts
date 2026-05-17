export { computeReadingWeather, computeReadingDNA, computeHourDistribution, computeSeasonDistribution, computeMonthlyActivity, getSeason, getTimeOfDay, SEASON_LABELS, TIME_LABELS, READER_TYPE_LABELS } from './reading-analyzer'
export type { ReadingWeather, ReadingDNA, HourDistribution, SeasonDistribution, MonthlyActivity, ReadingAnalyzerInput, Season, TimeOfDay, ReaderType } from './types'

export { detectSessions, computeSessionStats } from './session-detector'
export type { ReadingSession, SessionStats } from './session-detector'

export { findKeywordConnections, findTemporalConnections, findThematicClusters, findAllConnections } from './fragment-connector'
export type { FragmentConnection, ConnectionType, KeywordCluster } from './fragment-connector'

export { computeMidnightRecall, computeAnniversaryRecall, computeSeasonalRecall, computeFirstHighlight } from './midnight-recall'
export type { RecallFragment, RecallType, RecallOptions } from './midnight-recall'

export { generateReadingLetter } from './reading-letter'
export type { ReadingLetter, LetterParagraph, LetterStats, LetterMilestone } from './reading-letter'
