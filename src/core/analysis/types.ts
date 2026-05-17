import type { Fragment, Book } from '../database/types'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night'
export type ReaderType = 'dense' | 'sparse' | 'moderate'

export interface ReadingWeather {
  season: Season
  timeOfDay: TimeOfDay
  temperature: string
  description: string
  peakHour: number | null
  peakHourLabel: string | null
  seasonBookCount: number
  seasonFragmentCount: number
  seasonKeywords: string[]
}

export interface ReadingDNA {
  readerType: ReaderType
  readerTypeLabel: string
  peakReadingHour: number | null
  peakReadingHourLabel: string | null
  averageFragmentLength: number
  totalReadingDays: number
  readingSpanDays: number
  readingConsistency: number
  nightReaderRatio: number
  seasonality: Record<Season, number>
  dominantSeason: Season | null
  dominantSeasonLabel: string | null
  densityPattern: 'burst' | 'steady' | 'declining' | 'growing'
  densityPatternLabel: string
}

export interface HourDistribution {
  hour: number
  count: number
  label: string
}

export interface SeasonDistribution {
  season: Season
  count: number
  label: string
}

export interface MonthlyActivity {
  year: number
  month: number
  count: number
  label: string
}

export interface ReadingAnalyzerInput {
  fragments: Fragment[]
  books: Book[]
}
