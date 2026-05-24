/**
 * mediaDB — IndexedDB wrapper for large media files (videos, images).
 *
 * Why IndexedDB?
 *  • localStorage has a ~5-10 MB limit and cannot store binary data reliably.
 *  • IndexedDB can store hundreds of MB (or more) as raw ArrayBuffers.
 *  • Persists across page reloads — fixing the core "video disappears on refresh" bug.
 *
 * Flow:
 *  1. Teacher uploads a file → mediaDB.store(id, file)
 *  2. Page reloads → courseService.fetchAll() calls mediaDB.getBlobUrl(id) per media item
 *  3. A fresh, valid ObjectURL is created from the stored ArrayBuffer → video plays ✅
 */

const DB_NAME = 'mentoro_media'
const DB_VERSION = 1
const STORE_NAME = 'media_blobs'

let _db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result
      resolve(_db)
    }
    req.onerror = () => reject(req.error)
  })
}

export const mediaDB = {
  /** Store a File or Blob under a stable ID. */
  store: async (id: string, file: File | Blob): Promise<void> => {
    const db = await openDB()
    const buffer = await file.arrayBuffer()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put({ id, buffer, type: file.type })
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  },

  /**
   * Retrieve a fresh ObjectURL for playback/display.
   * The caller is responsible for revoking when done (or we let the browser clean up on unload).
   */
  getBlobUrl: async (id: string): Promise<string | null> => {
    try {
      const db = await openDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.get(id)
        req.onsuccess = () => {
          const result = req.result as { id: string; buffer: ArrayBuffer; type: string } | undefined
          if (!result) { resolve(null); return }
          const blob = new Blob([result.buffer], { type: result.type })
          resolve(URL.createObjectURL(blob))
        }
        req.onerror = () => resolve(null)
      })
    } catch {
      return null
    }
  },

  /** Delete stored binary data (called when teacher removes a video/image). */
  remove: async (id: string): Promise<void> => {
    try {
      const db = await openDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.delete(id)
        tx.oncomplete = () => resolve()
        tx.onerror = () => resolve() // fail silently
      })
    } catch { /* ignore */ }
  },

  /** Check whether binary data exists for a given ID. */
  exists: async (id: string): Promise<boolean> => {
    try {
      const db = await openDB()
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.count(id)
        req.onsuccess = () => resolve(req.result > 0)
        req.onerror = () => resolve(false)
      })
    } catch {
      return false
    }
  },
}
