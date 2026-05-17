export type ClippingType = 'highlight' | 'note' | 'bookmark'

export interface Book {
  id: string
  title: string
  author: string
  createdAt: Date
  updatedAt: Date
}

export interface Fragment {
  id: string
  bookId: string
  type: ClippingType
  content: string
  note: string | null
  page: string | null
  location: string | null
  clippedAt: Date | null
  sourceHash: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ImportRecord {
  id: string
  sourcePath: string
  importedAt: Date
  totalBlocks: number
  importedCount: number
  skippedCount: number
  failedCount: number
}

export interface Mood {
  id: string
  name: string
  createdAt: Date
}

export interface FragmentMood {
  fragmentId: string
  moodId: string
}
