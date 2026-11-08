import { mockConfig } from './config'
import { createSeed, type Database } from './seed'

const STORAGE_KEY = 'flowboard:db'

function load(): Database {
  if (mockConfig.persist) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved) as Database
    } catch {
      // Ignore broken or unavailable storage and use the seed.
    }
  }
  return createSeed()
}

let db: Database | null = null

/** The current data. Loaded on first use. */
export function getDb(): Database {
  db ??= load()
  return db
}

export function save() {
  if (!mockConfig.persist || !db) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage is full or disabled. The data stays in memory.
  }
}

/** Replace all data with the seed (or with the given data). Use it in tests. */
export function resetDb(data: Database = createSeed()) {
  db = structuredClone(data)
  save()
}

/** Give items 0-based positions in their current order. */
export function renumber<T extends { position: number }>(items: T[]) {
  items.forEach((item, index) => {
    item.position = index
  })
}
