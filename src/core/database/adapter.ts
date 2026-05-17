import type { Repository } from '../importer/importer'
import type { Database } from './interfaces'

export function createRepositoryAdapter(db: Database): Repository {
  return {
    async findBookByTitleAndAuthor(title: string, author: string) {
      return db.books.findByTitleAndAuthor(title, author)
    },
    async createBook(book) {
      await db.books.create(book)
    },
    async existsFragmentByHash(hash: string) {
      return db.fragments.existsBySourceHash(hash)
    },
    async createFragment(fragment) {
      await db.fragments.create(fragment)
    },
    async createImportRecord(record) {
      await db.imports.create(record)
    },
  }
}
