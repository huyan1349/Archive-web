import type { Book, Fragment, ImportRecord, Mood, FragmentMood } from './types'

export interface Database {
  books: BookRepository
  fragments: FragmentRepository
  imports: ImportRepository
  moods: MoodRepository
  fragmentMoods: FragmentMoodRepository
}

export interface BookRepository {
  findAll(): Promise<Book[]>
  findById(id: string): Promise<Book | null>
  findByTitleAndAuthor(title: string, author: string): Promise<Book | null>
  create(book: Book): Promise<void>
  update(book: Book): Promise<void>
  delete(id: string): Promise<void>
}

export interface FragmentRepository {
  findAll(): Promise<Fragment[]>
  findById(id: string): Promise<Fragment | null>
  findByBookId(bookId: string): Promise<Fragment[]>
  findBySourceHash(hash: string): Promise<Fragment | null>
  existsBySourceHash(hash: string): Promise<boolean>
  findFavorites(): Promise<Fragment[]>
  create(fragment: Fragment): Promise<void>
  update(fragment: Fragment): Promise<void>
  delete(id: string): Promise<void>
}

export interface ImportRepository {
  findAll(): Promise<ImportRecord[]>
  findById(id: string): Promise<ImportRecord | null>
  create(record: ImportRecord): Promise<void>
}

export interface MoodRepository {
  findAll(): Promise<Mood[]>
  findById(id: string): Promise<Mood | null>
  create(mood: Mood): Promise<void>
  delete(id: string): Promise<void>
}

export interface FragmentMoodRepository {
  findByFragmentId(fragmentId: string): Promise<FragmentMood[]>
  create(fm: FragmentMood): Promise<void>
  delete(fragmentId: string, moodId: string): Promise<void>
}
