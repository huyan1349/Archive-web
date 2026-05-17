import type { Book, Fragment, ImportRecord, Mood, FragmentMood } from './types'
import type {
  BookRepository,
  FragmentRepository,
  ImportRepository,
  MoodRepository,
  FragmentMoodRepository,
  Database,
} from './interfaces'

const DB_NAME = 'lucerna-archive'
const DB_VERSION = 1

const STORES = {
  books: 'books',
  fragments: 'fragments',
  imports: 'imports',
  moods: 'moods',
  fragmentMoods: 'fragment_moods',
} as const

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORES.books)) {
        const store = db.createObjectStore(STORES.books, { keyPath: 'id' })
        store.createIndex('title_author', ['title', 'author'], { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.fragments)) {
        const store = db.createObjectStore(STORES.fragments, { keyPath: 'id' })
        store.createIndex('bookId', 'bookId', { unique: false })
        store.createIndex('sourceHash', 'sourceHash', { unique: true })
        store.createIndex('isFavorite', 'isFavorite', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORES.imports)) {
        db.createObjectStore(STORES.imports, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.moods)) {
        db.createObjectStore(STORES.moods, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORES.fragmentMoods)) {
        const store = db.createObjectStore(STORES.fragmentMoods, { keyPath: ['fragmentId', 'moodId'] })
        store.createIndex('fragmentId', 'fragmentId', { unique: false })
        store.createIndex('moodId', 'moodId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function tx<T>(storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        const request = fn(store)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }),
  )
}

function serializeDate<T extends object>(obj: T): T {
  const out = { ...obj }
  const record = out as Record<string, unknown>
  for (const [key, value] of Object.entries(record)) {
    if (value instanceof Date) {
      record[key] = value.toISOString()
    }
  }
  return out
}

function deserializeDate<T extends object>(obj: T, fields: string[]): T {
  const out = { ...obj }
  const record = out as Record<string, unknown>
  for (const field of fields) {
    const value = record[field]
    if (typeof value === 'string') {
      record[field] = new Date(value)
    }
  }
  return out
}

class IndexedDBBookRepository implements BookRepository {
  private store = STORES.books

  async findAll(): Promise<Book[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const request = store.getAll()
      request.onsuccess = () => {
        const books = (request.result as Book[]).map((b) =>
          deserializeDate(b, ['createdAt', 'updatedAt']),
        )
        resolve(books)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async findById(id: string): Promise<Book | null> {
    const result = await tx<Book | undefined>(this.store, 'readonly', (s) => s.get(id))
    if (!result) return null
    return deserializeDate(result, ['createdAt', 'updatedAt'])
  }

  async findByTitleAndAuthor(title: string, author: string): Promise<Book | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const index = store.index('title_author')
      const request = index.get([title, author])
      request.onsuccess = () => {
        if (!request.result) {
          resolve(null)
          return
        }
        resolve(deserializeDate(request.result as Book, ['createdAt', 'updatedAt']))
      }
      request.onerror = () => reject(request.error)
    })
  }

  async create(book: Book): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.add(serializeDate(book)))
  }

  async update(book: Book): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.put(serializeDate(book)))
  }

  async delete(id: string): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.delete(id))
  }
}

class IndexedDBFragmentRepository implements FragmentRepository {
  private store = STORES.fragments

  async findAll(): Promise<Fragment[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const request = store.getAll()
      request.onsuccess = () => {
        const fragments = (request.result as Fragment[]).map((f) =>
          deserializeDate(f, ['clippedAt', 'createdAt', 'updatedAt']),
        )
        resolve(fragments)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async findById(id: string): Promise<Fragment | null> {
    const result = await tx<Fragment | undefined>(this.store, 'readonly', (s) => s.get(id))
    if (!result) return null
    return deserializeDate(result, ['clippedAt', 'createdAt', 'updatedAt'])
  }

  async findByBookId(bookId: string): Promise<Fragment[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const index = store.index('bookId')
      const request = index.getAll(bookId)
      request.onsuccess = () => {
        const fragments = (request.result as Fragment[]).map((f) =>
          deserializeDate(f, ['clippedAt', 'createdAt', 'updatedAt']),
        )
        resolve(fragments)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async findBySourceHash(hash: string): Promise<Fragment | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const index = store.index('sourceHash')
      const request = index.get(hash)
      request.onsuccess = () => {
        if (!request.result) {
          resolve(null)
          return
        }
        resolve(deserializeDate(request.result as Fragment, ['clippedAt', 'createdAt', 'updatedAt']))
      }
      request.onerror = () => reject(request.error)
    })
  }

  async existsBySourceHash(hash: string): Promise<boolean> {
    const result = await this.findBySourceHash(hash)
    return result !== null
  }

  async findFavorites(): Promise<Fragment[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const index = store.index('isFavorite')
      const request = index.getAll(1)
      request.onsuccess = () => {
        const fragments = (request.result as Fragment[]).map((f) =>
          deserializeDate(f, ['clippedAt', 'createdAt', 'updatedAt']),
        )
        resolve(fragments)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async create(fragment: Fragment): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.add(serializeDate(fragment)))
  }

  async update(fragment: Fragment): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.put(serializeDate(fragment)))
  }

  async delete(id: string): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.delete(id))
  }
}

class IndexedDBImportRepository implements ImportRepository {
  private store = STORES.imports

  async findAll(): Promise<ImportRecord[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const request = store.getAll()
      request.onsuccess = () => {
        const records = (request.result as ImportRecord[]).map((r) =>
          deserializeDate(r, ['importedAt']),
        )
        resolve(records)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async findById(id: string): Promise<ImportRecord | null> {
    const result = await tx<ImportRecord | undefined>(this.store, 'readonly', (s) => s.get(id))
    if (!result) return null
    return deserializeDate(result, ['importedAt'])
  }

  async create(record: ImportRecord): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.add(serializeDate(record)))
  }
}

class IndexedDBMoodRepository implements MoodRepository {
  private store = STORES.moods

  async findAll(): Promise<Mood[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const request = store.getAll()
      request.onsuccess = () => {
        const moods = (request.result as Mood[]).map((m) =>
          deserializeDate(m, ['createdAt']),
        )
        resolve(moods)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async findById(id: string): Promise<Mood | null> {
    const result = await tx<Mood | undefined>(this.store, 'readonly', (s) => s.get(id))
    if (!result) return null
    return deserializeDate(result, ['createdAt'])
  }

  async create(mood: Mood): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.add(serializeDate(mood)))
  }

  async delete(id: string): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.delete(id))
  }
}

class IndexedDBFragmentMoodRepository implements FragmentMoodRepository {
  private store = STORES.fragmentMoods

  async findByFragmentId(fragmentId: string): Promise<FragmentMood[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.store, 'readonly')
      const store = transaction.objectStore(this.store)
      const index = store.index('fragmentId')
      const request = index.getAll(fragmentId)
      request.onsuccess = () => resolve(request.result as FragmentMood[])
      request.onerror = () => reject(request.error)
    })
  }

  async create(fm: FragmentMood): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.add(fm))
  }

  async delete(fragmentId: string, moodId: string): Promise<void> {
    await tx(this.store, 'readwrite', (s) => s.delete([fragmentId, moodId]))
  }
}

export async function createDatabase(): Promise<Database> {
  await openDB()
  return {
    books: new IndexedDBBookRepository(),
    fragments: new IndexedDBFragmentRepository(),
    imports: new IndexedDBImportRepository(),
    moods: new IndexedDBMoodRepository(),
    fragmentMoods: new IndexedDBFragmentMoodRepository(),
  }
}
