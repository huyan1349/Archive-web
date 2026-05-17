import type { ClippingType } from './types'

export interface TitleMatch {
  title: string
  author: string
}

export interface MetaMatch {
  type: ClippingType
  page: string | null
  location: string | null
  clippedAt: Date | null
}

const TITLE_RE = /^(.+?)\s*\((.+?)\)\s*$/

const EN_HIGHLIGHT_RE =
  /- Your Highlight on page (\d+)(?:-(\d+))?\s*\|\s*location (\d+)-(\d+)\s*\|\s*Added on (.+)$/

const EN_NOTE_RE =
  /- Your Note on page (\d+)\s*\|\s*location (\d+)\s*\|\s*Added on (.+)$/

const EN_BOOKMARK_RE =
  /- Your Bookmark on page (\d+)\s*\|\s*location (\d+)\s*\|\s*Added on (.+)$/

const CN_HIGHLIGHT_RE =
  /- 您在位置 #(\d+)-(\d+)的标注\s*\|\s*添加于 (.+)$/

const CN_NOTE_RE =
  /- 您在位置 #(\d+)的笔记\s*\|\s*添加于 (.+)$/

const CN_BOOKMARK_RE =
  /- 您在位置 #(\d+)的书签\s*\|\s*添加于 (.+)$/

const EN_DATE_RE =
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(.+?)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i

const CN_DATE_RE =
  /^(\d{4})年(\d{1,2})月(\d{1,2})日(星期[一二三四五六日天])\s+(上午|下午)(\d{1,2}):(\d{2}):(\d{2})$/

export function parseTitle(line: string): TitleMatch | null {
  const m = line.match(TITLE_RE)
  if (!m) return null
  return { title: m[1].trim(), author: m[2].trim() }
}

function parseEnDate(raw: string): Date | null {
  const m = raw.trim().match(EN_DATE_RE)
  if (!m) return null
  const monthStr = m[2]
  const day = parseInt(m[3], 10)
  const year = parseInt(m[4], 10)
  let hour = parseInt(m[5], 10)
  const minute = parseInt(m[6], 10)
  const second = parseInt(m[7], 10)
  const ampm = m[8].toUpperCase()
  if (ampm === 'PM' && hour !== 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0
  const monthIndex = parseMonth(monthStr)
  if (monthIndex === -1) return null
  return new Date(year, monthIndex, day, hour, minute, second)
}

function parseCnDate(raw: string): Date | null {
  const m = raw.trim().match(CN_DATE_RE)
  if (!m) return null
  const year = parseInt(m[1], 10)
  const month = parseInt(m[2], 10)
  const day = parseInt(m[3], 10)
  let hour = parseInt(m[6], 10)
  const minute = parseInt(m[7], 10)
  const second = parseInt(m[8], 10)
  const period = m[5]
  if (period === '下午' && hour !== 12) hour += 12
  if (period === '上午' && hour === 12) hour = 0
  return new Date(year, month - 1, day, hour, minute, second)
}

function parseMonth(name: string): number {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return months.findIndex((m) => m.toLowerCase() === name.toLowerCase().replace(',', ''))
}

export function parseMeta(line: string): MetaMatch | null {
  let m: RegExpMatchArray | null

  m = line.match(EN_HIGHLIGHT_RE)
  if (m) {
    return {
      type: 'highlight',
      page: m[1],
      location: `${m[3]}-${m[4]}`,
      clippedAt: parseEnDate(m[5]),
    }
  }

  m = line.match(EN_NOTE_RE)
  if (m) {
    return {
      type: 'note',
      page: m[1],
      location: m[2],
      clippedAt: parseEnDate(m[3]),
    }
  }

  m = line.match(EN_BOOKMARK_RE)
  if (m) {
    return {
      type: 'bookmark',
      page: m[1],
      location: m[2],
      clippedAt: parseEnDate(m[3]),
    }
  }

  m = line.match(CN_HIGHLIGHT_RE)
  if (m) {
    return {
      type: 'highlight',
      page: null,
      location: `${m[1]}-${m[2]}`,
      clippedAt: parseCnDate(m[3]),
    }
  }

  m = line.match(CN_NOTE_RE)
  if (m) {
    return {
      type: 'note',
      page: null,
      location: m[1],
      clippedAt: parseCnDate(m[2]),
    }
  }

  m = line.match(CN_BOOKMARK_RE)
  if (m) {
    return {
      type: 'bookmark',
      page: null,
      location: m[1],
      clippedAt: parseCnDate(m[2]),
    }
  }

  return null
}
