import type { Fragment, Book } from '../database/types'

export interface ReadingSession {
  id: string
  bookId: string
  bookTitle: string
  startedAt: Date
  endedAt: Date
  durationMinutes: number
  fragmentCount: number
  fragments: Fragment[]
  isLateNight: boolean
  isDeepRead: boolean
}

export interface SessionStats {
  totalSessions: number
  averageDuration: number
  averageFragmentCount: number
  lateNightSessionCount: number
  lateNightRatio: number
  deepReadSessionCount: number
  deepReadRatio: number
  longestSession: ReadingSession | null
  mostFrequentBookId: string | null
  mostFrequentBookTitle: string | null
  sessionsByDate: Map<string, ReadingSession[]>
}

const SESSION_GAP_MS = 2 * 60 * 60 * 1000
const MIN_SESSION_FRAGMENTS = 2

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function detectSessions(fragments: Fragment[], books: Book[]): ReadingSession[] {
  const bookMap = new Map(books.map((b) => [b.id, b]))
  const dated = fragments
    .filter((f) => f.clippedAt instanceof Date && !isNaN(f.clippedAt.getTime()))
    .sort((a, b) => a.clippedAt!.getTime() - b.clippedAt!.getTime())

  if (dated.length === 0) return []

  const sessions: ReadingSession[] = []
  let currentGroup: Fragment[] = [dated[0]]

  for (let i = 1; i < dated.length; i++) {
    const prev = currentGroup[currentGroup.length - 1]
    const curr = dated[i]
    const gap = curr.clippedAt!.getTime() - prev.clippedAt!.getTime()

    const sameBookSession = curr.bookId === prev.bookId && gap < SESSION_GAP_MS
    const sameTimeCluster = gap < SESSION_GAP_MS * 0.5

    if (sameBookSession || sameTimeCluster) {
      currentGroup.push(curr)
    } else {
      if (currentGroup.length >= MIN_SESSION_FRAGMENTS) {
        sessions.push(buildSession(currentGroup, bookMap))
      }
      currentGroup = [curr]
    }
  }

  if (currentGroup.length >= MIN_SESSION_FRAGMENTS) {
    sessions.push(buildSession(currentGroup, bookMap))
  }

  return sessions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
}

function buildSession(group: Fragment[], bookMap: Map<string, Book>): ReadingSession {
  const startedAt = group[0].clippedAt!
  const endedAt = group[group.length - 1].clippedAt!
  const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)
  const dominantBookId = getDominantBook(group)
  const book = bookMap.get(dominantBookId)
  const hour = startedAt.getHours()
  const isLateNight = hour >= 22 || hour < 5

  return {
    id: `session-${startedAt.getTime()}-${dominantBookId}`,
    bookId: dominantBookId,
    bookTitle: book?.title ?? '',
    startedAt,
    endedAt,
    durationMinutes,
    fragmentCount: group.length,
    fragments: group,
    isLateNight,
    isDeepRead: group.length >= 5 && durationMinutes >= 30,
  }
}

function getDominantBook(group: Fragment[]): string {
  const counts = new Map<string, number>()
  for (const f of group) {
    counts.set(f.bookId, (counts.get(f.bookId) ?? 0) + 1)
  }
  let maxId = group[0].bookId
  let maxCount = 0
  for (const [id, count] of counts) {
    if (count > maxCount) {
      maxCount = count
      maxId = id
    }
  }
  return maxId
}

export function computeSessionStats(sessions: ReadingSession[], books: Book[]): SessionStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      averageDuration: 0,
      averageFragmentCount: 0,
      lateNightSessionCount: 0,
      lateNightRatio: 0,
      deepReadSessionCount: 0,
      deepReadRatio: 0,
      longestSession: null,
      mostFrequentBookId: null,
      mostFrequentBookTitle: null,
      sessionsByDate: new Map(),
    }
  }

  const totalDuration = sessions.reduce((s, sess) => s + sess.durationMinutes, 0)
  const totalFrags = sessions.reduce((s, sess) => s + sess.fragmentCount, 0)
  const lateNight = sessions.filter((s) => s.isLateNight)
  const deepRead = sessions.filter((s) => s.isDeepRead)
  const longest = sessions.reduce((max, s) => (s.durationMinutes > max.durationMinutes ? s : max), sessions[0])

  const bookFreq = new Map<string, number>()
  for (const s of sessions) {
    bookFreq.set(s.bookId, (bookFreq.get(s.bookId) ?? 0) + 1)
  }
  let mostFreqBookId: string | null = null
  let mostFreqCount = 0
  for (const [id, count] of bookFreq) {
    if (count > mostFreqCount) {
      mostFreqCount = count
      mostFreqBookId = id
    }
  }
  const bookMap = new Map(books.map((b) => [b.id, b]))

  const byDate = new Map<string, ReadingSession[]>()
  for (const s of sessions) {
    const key = formatDateKey(s.startedAt)
    const list = byDate.get(key) ?? []
    list.push(s)
    byDate.set(key, list)
  }

  return {
    totalSessions: sessions.length,
    averageDuration: Math.round(totalDuration / sessions.length),
    averageFragmentCount: Math.round(totalFrags / sessions.length),
    lateNightSessionCount: lateNight.length,
    lateNightRatio: Math.round((lateNight.length / sessions.length) * 100) / 100,
    deepReadSessionCount: deepRead.length,
    deepReadRatio: Math.round((deepRead.length / sessions.length) * 100) / 100,
    longestSession: longest,
    mostFrequentBookId: mostFreqBookId,
    mostFrequentBookTitle: mostFreqBookId ? bookMap.get(mostFreqBookId)?.title ?? null : null,
    sessionsByDate: byDate,
  }
}
