import type { Fragment } from '../database/types'
import type { Season, TimeOfDay, ReaderType, ReadingWeather, ReadingDNA, HourDistribution, SeasonDistribution, MonthlyActivity, ReadingAnalyzerInput } from './types'

function getSeason(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  if (hour >= 21 && hour < 24) return 'night'
  return 'late_night'
}

const SEASON_LABELS: Record<Season, { zh: string; en: string }> = {
  spring: { zh: '春', en: 'Spring' },
  summer: { zh: '夏', en: 'Summer' },
  autumn: { zh: '秋', en: 'Autumn' },
  winter: { zh: '冬', en: 'Winter' },
}

const TIME_LABELS: Record<TimeOfDay, { zh: string; en: string }> = {
  dawn: { zh: '黎明', en: 'Dawn' },
  morning: { zh: '上午', en: 'Morning' },
  afternoon: { zh: '午后', en: 'Afternoon' },
  evening: { zh: '傍晚', en: 'Evening' },
  night: { zh: '夜晚', en: 'Night' },
  late_night: { zh: '深夜', en: 'Late Night' },
}

const READER_TYPE_LABELS: Record<ReaderType, { zh: string; en: string }> = {
  dense: { zh: '划线密集型读者', en: 'Dense highlighter' },
  sparse: { zh: '稀疏沉思型读者', en: 'Sparse contemplator' },
  moderate: { zh: '均衡型读者', en: 'Balanced reader' },
}

const DENSITY_LABELS: Record<string, { zh: string; en: string }> = {
  burst: { zh: '爆发式', en: 'Burst' },
  steady: { zh: '稳定式', en: 'Steady' },
  declining: { zh: '递减式', en: 'Declining' },
  growing: { zh: '增长式', en: 'Growing' },
}

const WEATHER_DESCRIPTIONS: Record<Season, Record<TimeOfDay, { zh: string; en: string }>> = {
  spring: {
    dawn: { zh: '春晨微光，纸页刚醒', en: 'Spring dawn, pages just waking' },
    morning: { zh: '春晨，纸页微暖', en: 'Spring morning, pages warming' },
    afternoon: { zh: '春日午后，适合翻几页', en: 'Spring afternoon, good for a few pages' },
    evening: { zh: '春暮，光线渐柔', en: 'Spring evening, light softening' },
    night: { zh: '春夜，窗外有风声', en: 'Spring night, wind outside' },
    late_night: { zh: '春深，万籁俱寂', en: 'Late spring, all is quiet' },
  },
  summer: {
    dawn: { zh: '夏晨，空气清亮', en: 'Summer dawn, clear air' },
    morning: { zh: '夏晨，空气清亮', en: 'Summer morning, clear air' },
    afternoon: { zh: '夏日午后，蝉鸣与书页', en: 'Summer afternoon, cicadas and pages' },
    evening: { zh: '夏暮，余热未散', en: 'Summer evening, warmth lingering' },
    night: { zh: '夏夜，适合读到很晚', en: 'Summer night, good for reading late' },
    late_night: { zh: '夏夜深处，文字更凉', en: 'Deep summer night, words feel cooler' },
  },
  autumn: {
    dawn: { zh: '秋晨，书页带凉意', en: 'Autumn dawn, cool pages' },
    morning: { zh: '秋晨，书页带凉意', en: 'Autumn morning, cool pages' },
    afternoon: { zh: '秋日午后，适合沉思', en: 'Autumn afternoon, good for reflection' },
    evening: { zh: '秋暮，天色暗得早了', en: 'Autumn evening, dark comes early' },
    night: { zh: '秋夜，深而不见底', en: 'Autumn night, deep and bottomless' },
    late_night: { zh: '秋深，适合与旧书重逢', en: 'Late autumn, good for reuniting with old books' },
  },
  winter: {
    dawn: { zh: '冬晨，被窝里翻几页', en: 'Winter dawn, reading under covers' },
    morning: { zh: '冬晨，被窝里翻几页', en: 'Winter morning, reading under covers' },
    afternoon: { zh: '冬日午后，窗外有雪', en: 'Winter afternoon, snow outside' },
    evening: { zh: '冬暮，灯光很暖', en: 'Winter evening, warm lamplight' },
    night: { zh: '冬夜，深寒，适合读到凌晨', en: 'Winter night, deep cold, good for reading till dawn' },
    late_night: { zh: '冬夜深处，只有文字是暖的', en: 'Deep winter night, only words are warm' },
  },
}

function datedFragments(fragments: Fragment[]): Fragment[] {
  return fragments.filter((f) => f.clippedAt instanceof Date && !isNaN(f.clippedAt.getTime()))
}

export function computeHourDistribution(fragments: Fragment[]): HourDistribution[] {
  const hours = new Array(24).fill(0) as number[]
  for (const f of datedFragments(fragments)) {
    hours[f.clippedAt!.getHours()]++
  }
  return hours.map((count, hour) => ({
    hour,
    count,
    label: `${hour}:00`,
  }))
}

export function computeSeasonDistribution(fragments: Fragment[]): SeasonDistribution[] {
  const counts: Record<Season, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 }
  for (const f of datedFragments(fragments)) {
    counts[getSeason(f.clippedAt!.getMonth() + 1)]++
  }
  return (['spring', 'summer', 'autumn', 'winter'] as Season[]).map((season) => ({
    season,
    count: counts[season],
    label: SEASON_LABELS[season].en,
  }))
}

export function computeMonthlyActivity(fragments: Fragment[]): MonthlyActivity[] {
  const map = new Map<string, number>()
  for (const f of datedFragments(fragments)) {
    const key = `${f.clippedAt!.getFullYear()}-${f.clippedAt!.getMonth()}`
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([key, count]) => {
      const [yearStr, monthStr] = key.split('-')
      const year = parseInt(yearStr, 10)
      const month = parseInt(monthStr, 10)
      return { year, month, count, label: `${year}-${String(month + 1).padStart(2, '0')}` }
    })
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
}

export function computeReadingWeather(input: ReadingAnalyzerInput, lang: 'zh' | 'en' = 'zh'): ReadingWeather {
  const { fragments, books } = input
  const now = new Date()
  const currentSeason = getSeason(now.getMonth() + 1)
  const currentTimeOfDay = getTimeOfDay(now.getHours())

  const hourDist = computeHourDistribution(fragments)
  const peakHour = hourDist.reduce((max, h) => (h.count > max.count ? h : max), hourDist[0])

  const seasonFrags = datedFragments(fragments).filter(
    (f) => getSeason(f.clippedAt!.getMonth() + 1) === currentSeason,
  )
  const seasonBookIds = new Set(seasonFrags.map((f) => f.bookId))
  const seasonBookCount = books.filter((b) => seasonBookIds.has(b.id)).length

  const keywords = extractSeasonKeywords(seasonFrags)

  const desc = WEATHER_DESCRIPTIONS[currentSeason]?.[currentTimeOfDay]
  const description = desc?.[lang] ?? ''

  const tempMap: Record<Season, string> = {
    spring: lang === 'zh' ? '微暖' : 'Mild',
    summer: lang === 'zh' ? '温热' : 'Warm',
    autumn: lang === 'zh' ? '微凉' : 'Cool',
    winter: lang === 'zh' ? '深寒' : 'Cold',
  }

  return {
    season: currentSeason,
    timeOfDay: currentTimeOfDay,
    temperature: tempMap[currentSeason],
    description,
    peakHour: peakHour.count > 0 ? peakHour.hour : null,
    peakHourLabel: peakHour.count > 0 ? `${peakHour.hour}:00` : null,
    seasonBookCount,
    seasonFragmentCount: seasonFrags.length,
    seasonKeywords: keywords,
  }
}

function extractSeasonKeywords(fragments: Fragment[]): string[] {
  const wordFreq = new Map<string, number>()
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both',
    'either', 'neither', 'each', 'every', 'all', 'any', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than',
    'too', 'very', 'just', 'because', 'if', 'when', 'where', 'how',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都',
    '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你',
    '会', '着', '没有', '看', '好', '自己', '这', '他', '她', '它',
  ])

  for (const f of fragments) {
    if (!f.content) continue
    const words = f.content
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w))
    for (const w of words) {
      wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1)
    }
  }

  return Array.from(wordFreq.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

export function computeReadingDNA(input: ReadingAnalyzerInput, lang: 'zh' | 'en' = 'zh'): ReadingDNA {
  const { fragments } = input
  const dated = datedFragments(fragments)

  const avgLen = fragments.length > 0
    ? fragments.reduce((sum, f) => sum + f.content.length, 0) / fragments.length
    : 0

  let readerType: ReaderType = 'moderate'
  if (avgLen > 80) readerType = 'dense'
  else if (avgLen < 25) readerType = 'sparse'

  const hourDist = computeHourDistribution(fragments)
  const peakHourEntry = hourDist.reduce((max, h) => (h.count > max.count ? h : max), hourDist[0])
  const peakHour = peakHourEntry.count > 0 ? peakHourEntry.hour : null

  const nightHours = [22, 23, 0, 1, 2, 3, 4]
  const nightCount = nightHours.reduce((sum, h) => sum + hourDist[h].count, 0)
  const totalWithHour = hourDist.reduce((sum, h) => sum + h.count, 0)
  const nightRatio = totalWithHour > 0 ? nightCount / totalWithHour : 0

  const daySet = new Set<string>()
  for (const f of dated) {
    daySet.add(f.clippedAt!.toISOString().slice(0, 10))
  }
  const totalReadingDays = daySet.size

  let earliest: Date | null = null
  let latest: Date | null = null
  for (const f of dated) {
    if (!earliest || f.clippedAt! < earliest) earliest = f.clippedAt!
    if (!latest || f.clippedAt! > latest) latest = f.clippedAt!
  }
  const spanDays = earliest && latest
    ? Math.ceil((latest.getTime() - earliest.getTime()) / (24 * 60 * 60 * 1000))
    : 0

  const consistency = spanDays > 0 ? totalReadingDays / spanDays : 0

  const seasonDist = computeSeasonDistribution(fragments)
  const seasonality: Record<Season, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 }
  const total = seasonDist.reduce((sum, s) => sum + s.count, 0)
  for (const s of seasonDist) {
    seasonality[s.season] = total > 0 ? s.count / total : 0
  }
  const dominantSeasonEntry = seasonDist.reduce(
    (max, s) => (s.count > max.count ? s : max),
    seasonDist[0],
  )
  const dominantSeason = dominantSeasonEntry.count > 0 ? dominantSeasonEntry.season : null

  const monthly = computeMonthlyActivity(fragments)
  let densityPattern: ReadingDNA['densityPattern'] = 'steady'
  if (monthly.length >= 4) {
    const firstHalf = monthly.slice(0, Math.floor(monthly.length / 2))
    const secondHalf = monthly.slice(Math.floor(monthly.length / 2))
    const avgFirst = firstHalf.reduce((s, m) => s + m.count, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((s, m) => s + m.count, 0) / secondHalf.length
    const maxMonth = monthly.reduce((max, m) => (m.count > max.count ? m : max), monthly[0])
    const avgMonth = monthly.reduce((s, m) => s + m.count, 0) / monthly.length

    if (maxMonth.count > avgMonth * 3) densityPattern = 'burst'
    else if (avgSecond < avgFirst * 0.6) densityPattern = 'declining'
    else if (avgSecond > avgFirst * 1.5) densityPattern = 'growing'
    else densityPattern = 'steady'
  }

  return {
    readerType,
    readerTypeLabel: READER_TYPE_LABELS[readerType][lang],
    peakReadingHour: peakHour,
    peakReadingHourLabel: peakHour !== null ? TIME_LABELS[getTimeOfDay(peakHour)][lang] : null,
    averageFragmentLength: Math.round(avgLen),
    totalReadingDays,
    readingSpanDays: spanDays,
    readingConsistency: Math.round(consistency * 100) / 100,
    nightReaderRatio: Math.round(nightRatio * 100) / 100,
    seasonality,
    dominantSeason,
    dominantSeasonLabel: dominantSeason ? SEASON_LABELS[dominantSeason][lang] : null,
    densityPattern,
    densityPatternLabel: DENSITY_LABELS[densityPattern][lang],
  }
}

export { getSeason, getTimeOfDay, SEASON_LABELS, TIME_LABELS, READER_TYPE_LABELS }
