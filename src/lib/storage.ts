// LocalStorage utilities
export const localStorage = {
  get: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key)
    } catch (error) {
      console.error('LocalStorage get error:', error)
      return null
    }
  },

  set: (key: string, value: string): boolean => {
    try {
      window.localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error('LocalStorage set error:', error)
      return false
    }
  },

  remove: (key: string): boolean => {
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('LocalStorage remove error:', error)
      return false
    }
  },

  clear: (): boolean => {
    try {
      window.localStorage.clear()
      return true
    } catch (error) {
      console.error('LocalStorage clear error:', error)
      return false
    }
  }
}

// IndexedDB utilities
const DB_NAME = 'BotAI_DB'
const DB_VERSION = 2

let dbInstance: IDBDatabase | null = null

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains('chats')) {
        db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true })
      }

      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true })
      }

      if (!db.objectStoreNames.contains('vectors')) {
        db.createObjectStore('vectors', { keyPath: 'id', autoIncrement: true })
      }

      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions', { keyPath: 'userId' })
      }
    }
  })
}

export const db = {
  save: async <T>(storeName: string, data: T): Promise<IDBValidKey> => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  put: async <T>(storeName: string, data: T): Promise<IDBValidKey> => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  get: async <T>(storeName: string, id: IDBValidKey): Promise<T | undefined> => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  getAll: async <T>(storeName: string): Promise<T[]> => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  delete: async (storeName: string, id: IDBValidKey): Promise<void> => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  clear: async (storeName: string): Promise<void> => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

