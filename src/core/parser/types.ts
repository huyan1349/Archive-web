export type ClippingType = 'highlight' | 'note' | 'bookmark'

export interface ParsedClipping {
  title: string
  author: string
  type: ClippingType
  content: string
  page: string | null
  location: string | null
  clippedAt: Date | null
  rawBlock: string
}

export interface ParseResult {
  clippings: ParsedClipping[]
  unparsed: UnparsedBlock[]
  totalBlocks: number
  parsedCount: number
  unparsedCount: number
}

export interface UnparsedBlock {
  rawBlock: string
  reason: string
}
