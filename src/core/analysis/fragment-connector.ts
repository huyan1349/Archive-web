import type { Fragment, Book } from '../database/types'

export type ConnectionType = 'keyword' | 'temporal' | 'thematic'

export interface FragmentConnection {
  fragmentA: Fragment
  fragmentB: Fragment
  bookA: Book | null
  bookB: Book | null
  connectionType: ConnectionType
  strength: number
  sharedKeywords: string[]
  timeGapDays: number
  description: { zh: string; en: string }
}

export interface KeywordCluster {
  keyword: string
  count: number
  fragments: Fragment[]
  bookIds: Set<string>
  bookTitles: string[]
  description: { zh: string; en: string }
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'to', 'of', 'in',
  'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
  'during', 'before', 'after', 'and', 'but', 'or', 'not', 'so', 'if',
  'when', 'where', 'how', 'what', 'which', 'who', 'this', 'that',
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his',
  'she', 'her', 'it', 'its', 'they', 'them', 'their', 'than', 'then',
  'no', 'not', 'only', 'own', 'same', 'also', 'just', 'very', 'even',
  'still', 'already', 'yet', 'much', 'more', 'most', 'less', 'least',
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都',
  '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你',
  '会', '着', '没有', '看', '好', '自己', '这', '他', '她', '它',
  '那', '里', '什么', '没', '被', '让', '把', '从', '给', '对',
])

const THEMATIC_KEYWORDS: Record<string, string[]> = {
  time: ['time', 'moment', 'hour', 'day', 'year', 'past', 'future', 'memory', 'remember', 'forever',
    '时间', '时刻', '过去', '未来', '记忆', '回忆', '永远', '岁月', '光阴', '时光'],
  loneliness: ['alone', 'lonely', 'solitude', 'silence', 'empty', 'desert', 'dark', 'darkness',
    '孤独', '寂寞', '沉默', '空虚', '荒凉', '黑暗', '独自', '寂寥'],
  love: ['love', 'heart', 'dear', 'beloved', 'passion', 'desire', 'kiss', 'embrace',
    '爱', '心', '恋', '情', '思念', '拥抱', '温柔', '深情'],
  death: ['death', 'dead', 'die', 'grave', 'funeral', 'mortal', 'ghost', 'buried',
    '死', '死亡', '坟墓', '葬', '亡', '逝', '殁', '终'],
  freedom: ['free', 'freedom', 'escape', 'flight', 'liberty', 'liberation', 'wings', 'fly',
    '自由', '解放', '逃', '飞翔', '翅膀', '挣脱', '逃离'],
  truth: ['truth', 'true', 'real', 'reality', 'honest', 'genuine', 'authentic', 'lie',
    '真', '真实', '真相', '诚实', '谎言', '假', '虚伪', '本真'],
  nature: ['river', 'mountain', 'sea', 'ocean', 'forest', 'tree', 'rain', 'wind', 'snow', 'moon', 'sun', 'star',
    '河', '山', '海', '森林', '树', '雨', '风', '雪', '月', '太阳', '星'],
  identity: ['self', 'who', 'identity', 'become', 'becoming', 'mirror', 'reflection', 'shadow',
    '自我', '身份', '成为', '镜子', '倒影', '影子', '谁', '本体'],
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

function extractKeywords(fragment: Fragment): string[] {
  if (!fragment.content) return []
  return tokenize(fragment.content)
}

export function findKeywordConnections(
  fragments: Fragment[],
  books: Book[],
  options?: { minSharedKeywords?: number; maxConnections?: number; crossBookOnly?: boolean },
): FragmentConnection[] {
  const { minSharedKeywords = 2, maxConnections = 20, crossBookOnly = true } = options ?? {}
  const bookMap = new Map(books.map((b) => [b.id, b]))
  const readable = fragments.filter((f) => f.content.trim().length > 0)

  const fragmentKeywords = new Map<string, Set<string>>()
  for (const f of readable) {
    const keywords = extractKeywords(f)
    fragmentKeywords.set(f.id, new Set(keywords))
  }

  const connections: FragmentConnection[] = []

  for (let i = 0; i < readable.length && connections.length < maxConnections * 3; i++) {
    for (let j = i + 1; j < readable.length && connections.length < maxConnections * 3; j++) {
      const a = readable[i]
      const b = readable[j]

      if (crossBookOnly && a.bookId === b.bookId) continue

      const kwA = fragmentKeywords.get(a.id)
      const kwB = fragmentKeywords.get(b.id)
      if (!kwA || !kwB) continue

      const shared = [...kwA].filter((k) => kwB.has(k))
      if (shared.length < minSharedKeywords) continue

      const timeGap = computeTimeGapDays(a, b)
      const strength = computeConnectionStrength(shared.length, timeGap)

      connections.push({
        fragmentA: a,
        fragmentB: b,
        bookA: bookMap.get(a.bookId) ?? null,
        bookB: bookMap.get(b.bookId) ?? null,
        connectionType: 'keyword',
        strength,
        sharedKeywords: shared.slice(0, 5),
        timeGapDays: timeGap,
        description: buildKeywordDescription(a, b, shared, bookMap),
      })
    }
  }

  return connections
    .sort((a, b) => b.strength - a.strength)
    .slice(0, maxConnections)
}

export function findTemporalConnections(
  fragments: Fragment[],
  books: Book[],
  options?: { maxGapDays?: number; maxConnections?: number },
): FragmentConnection[] {
  const { maxGapDays = 30, maxConnections = 15 } = options ?? {}
  const bookMap = new Map(books.map((b) => [b.id, b]))
  const dated = fragments
    .filter((f) => f.content.trim().length > 0 && f.clippedAt instanceof Date && !isNaN(f.clippedAt.getTime()))
    .sort((a, b) => a.clippedAt!.getTime() - b.clippedAt!.getTime())

  const connections: FragmentConnection[] = []

  for (let i = 0; i < dated.length && connections.length < maxConnections * 2; i++) {
    for (let j = i + 1; j < dated.length && connections.length < maxConnections * 2; j++) {
      const a = dated[i]
      const b = dated[j]

      if (a.bookId === b.bookId) continue

      const gapDays = computeTimeGapDays(a, b)
      if (gapDays > maxGapDays) break

      const kwA = new Set(extractKeywords(a))
      const kwB = new Set(extractKeywords(b))
      const shared = [...kwA].filter((k) => kwB.has(k))

      if (shared.length < 1) continue

      const strength = computeConnectionStrength(shared.length, gapDays)

      connections.push({
        fragmentA: a,
        fragmentB: b,
        bookA: bookMap.get(a.bookId) ?? null,
        bookB: bookMap.get(b.bookId) ?? null,
        connectionType: 'temporal',
        strength,
        sharedKeywords: shared.slice(0, 3),
        timeGapDays: gapDays,
        description: buildTemporalDescription(a, b, gapDays, bookMap),
      })
    }
  }

  return connections
    .sort((a, b) => b.strength - a.strength)
    .slice(0, maxConnections)
}

export function findThematicClusters(
  fragments: Fragment[],
  books: Book[],
): KeywordCluster[] {
  const bookMap = new Map(books.map((b) => [b.id, b]))
  const readable = fragments.filter((f) => f.content.trim().length > 0)

  const clusters: KeywordCluster[] = []

  for (const [theme, keywords] of Object.entries(THEMATIC_KEYWORDS)) {
    const matched: Fragment[] = []
    const bookIds = new Set<string>()

    for (const f of readable) {
      const contentLower = f.content.toLowerCase()
      const hasMatch = keywords.some((kw) => contentLower.includes(kw))
      if (hasMatch) {
        matched.push(f)
        bookIds.add(f.bookId)
      }
    }

    if (matched.length < 2 || bookIds.size < 2) continue

    const bookTitles = [...bookIds]
      .map((id) => bookMap.get(id)?.title)
      .filter((t): t is string => t != null)

    clusters.push({
      keyword: theme,
      count: matched.length,
      fragments: matched,
      bookIds,
      bookTitles,
      description: {
        zh: `你在 ${bookTitles.length} 本不同的书里划了关于「${theme}」的句子`,
        en: `You highlighted sentences about "${theme}" across ${bookTitles.length} different books`,
      },
    })
  }

  return clusters.sort((a, b) => b.count - a.count)
}

export function findAllConnections(
  fragments: Fragment[],
  books: Book[],
  options?: { maxConnections?: number },
): FragmentConnection[] {
  const { maxConnections = 25 } = options ?? {}

  const keywordConns = findKeywordConnections(fragments, books, {
    maxConnections: Math.ceil(maxConnections * 0.5),
    crossBookOnly: true,
  })
  const temporalConns = findTemporalConnections(fragments, books, {
    maxConnections: Math.ceil(maxConnections * 0.3),
  })
  const thematicConns = findThematicConnections(fragments, books, {
    maxConnections: Math.ceil(maxConnections * 0.2),
  })

  const all = [...keywordConns, ...temporalConns, ...thematicConns]
  return all.sort((a, b) => b.strength - a.strength).slice(0, maxConnections)
}

function findThematicConnections(
  fragments: Fragment[],
  books: Book[],
  options?: { maxConnections?: number },
): FragmentConnection[] {
  const { maxConnections = 10 } = options ?? {}
  const bookMap = new Map(books.map((b) => [b.id, b]))
  const clusters = findThematicClusters(fragments, books)
  const connections: FragmentConnection[] = []

  for (const cluster of clusters) {
    if (connections.length >= maxConnections) break
    if (cluster.fragments.length < 2) continue

    const frags = cluster.fragments.slice(0, 2)
    if (frags[0].bookId === frags[1].bookId) continue

    connections.push({
      fragmentA: frags[0],
      fragmentB: frags[1],
      bookA: bookMap.get(frags[0].bookId) ?? null,
      bookB: bookMap.get(frags[1].bookId) ?? null,
      connectionType: 'thematic',
      strength: 0.6 + Math.min(cluster.bookIds.size * 0.1, 0.3),
      sharedKeywords: [cluster.keyword],
      timeGapDays: computeTimeGapDays(frags[0], frags[1]),
      description: cluster.description,
    })
  }

  return connections
}

function computeTimeGapDays(a: Fragment, b: Fragment): number {
  if (!a.clippedAt || !b.clippedAt) return Infinity
  return Math.abs(a.clippedAt.getTime() - b.clippedAt.getTime()) / (24 * 60 * 60 * 1000)
}

function computeConnectionStrength(sharedKeywordCount: number, timeGapDays: number): number {
  const keywordScore = Math.min(sharedKeywordCount / 5, 1) * 0.6
  const temporalScore = timeGapDays < 7 ? 0.4 : timeGapDays < 30 ? 0.3 : timeGapDays < 90 ? 0.2 : 0.1
  return Math.round((keywordScore + temporalScore) * 100) / 100
}

function buildKeywordDescription(
  a: Fragment,
  b: Fragment,
  shared: string[],
  bookMap: Map<string, Book>,
): { zh: string; en: string } {
  const titleA = bookMap.get(a.bookId)?.title ?? ''
  const titleB = bookMap.get(b.bookId)?.title ?? ''
  const kw = shared.slice(0, 3).join(', ')
  return {
    zh: `《${titleA}》与《${titleB}》共享关键词：${kw}`,
    en: `"${titleA}" and "${titleB}" share keywords: ${kw}`,
  }
}

function buildTemporalDescription(
  a: Fragment,
  b: Fragment,
  gapDays: number,
  bookMap: Map<string, Book>,
): { zh: string; en: string } {
  const titleA = bookMap.get(a.bookId)?.title ?? ''
  const titleB = bookMap.get(b.bookId)?.title ?? ''
  const gapLabel = gapDays < 1 ? '同一天' : gapDays < 7 ? `${Math.ceil(gapDays)} 天后` : `${Math.ceil(gapDays / 7)} 周后`
  const gapLabelEn = gapDays < 1 ? 'the same day' : gapDays < 7 ? `${Math.ceil(gapDays)} days apart` : `${Math.ceil(gapDays / 7)} weeks apart`
  return {
    zh: `你在《${titleA}》里划线，${gapLabel}又在《${titleB}》里划了相似的句子`,
    en: `You highlighted in "${titleA}", and ${gapLabelEn} highlighted something similar in "${titleB}"`,
  }
}
