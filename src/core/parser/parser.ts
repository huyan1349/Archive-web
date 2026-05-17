import type { ParsedClipping, ParseResult, UnparsedBlock } from './types'
import { parseTitle, parseMeta } from './patterns'

const SEPARATOR = '=========='

export function splitBlocks(raw: string): string[] {
  return raw
    .split(SEPARATOR)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)
}

export function parseBlock(rawBlock: string): ParsedClipping | UnparsedBlock {
  const lines = rawBlock.split('\n').map((l) => l.trimEnd()).filter((l) => l.length > 0)

  if (lines.length < 2) {
    return { rawBlock, reason: 'block has fewer than 2 lines' }
  }

  const titleResult = parseTitle(lines[0])
  if (!titleResult) {
    return { rawBlock, reason: `failed to parse title line: "${lines[0]}"` }
  }

  const metaResult = parseMeta(lines[1])
  if (!metaResult) {
    return { rawBlock, reason: `failed to parse meta line: "${lines[1]}"` }
  }

  const contentLines = lines.slice(2)
  const content = contentLines.join('\n').trim()

  if (metaResult.type !== 'bookmark' && content.length === 0) {
    return { rawBlock, reason: 'highlight or note block has empty content' }
  }

  return {
    title: titleResult.title,
    author: titleResult.author,
    type: metaResult.type,
    content,
    page: metaResult.page,
    location: metaResult.location,
    clippedAt: metaResult.clippedAt,
    rawBlock,
  }
}

export function parseClippings(raw: string): ParseResult {
  const blocks = splitBlocks(raw)
  const clippings: ParsedClipping[] = []
  const unparsed: UnparsedBlock[] = []

  for (const block of blocks) {
    const result = parseBlock(block)
    if ('reason' in result) {
      unparsed.push(result)
    } else {
      clippings.push(result)
    }
  }

  return {
    clippings,
    unparsed,
    totalBlocks: blocks.length,
    parsedCount: clippings.length,
    unparsedCount: unparsed.length,
  }
}
