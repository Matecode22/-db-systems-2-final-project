// Sistema de fallback usando almacenamiento local para desarrollo
interface LocalData {
  users: any[]
  evaluation_plans: any[]
  student_grades: any[]
}

class LocalDatabase {
  private data: LocalData = {
    users: [],
    evaluation_plans: [],
    student_grades: [],
  }

  constructor() {
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("trackademic_local_db")
      if (stored) {
        try {
          this.data = JSON.parse(stored)
        } catch (error) {
          console.warn("Error loading local data:", error)
        }
      }
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("trackademic_local_db", JSON.stringify(this.data))
    }
  }

  collection(name: keyof LocalData) {
    return {
      find: (query: any = {}) => ({
        toArray: () => {
          const items = this.data[name] || []
          if (Object.keys(query).length === 0) return Promise.resolve(items)

          const filtered = items.filter((item) => {
            return Object.entries(query).every(([key, value]) => item[key] === value)
          })
          return Promise.resolve(filtered)
        },
      }),

      findOne: (query: any) => {
        const items = this.data[name] || []
        const found = items.find((item) => {
          return Object.entries(query).every(([key, value]) => item[key] === value)
        })
        return Promise.resolve(found || null)
      },

      insertOne: (doc: any) => {
        const id = Date.now().toString()
        const newDoc = { ...doc, _id: id }
        this.data[name].push(newDoc)
        this.saveToLocalStorage()
        return Promise.resolve({ insertedId: id })
      },

      updateOne: (query: any, update: any) => {
        const items = this.data[name] || []
        const index = items.findIndex((item) => {
          return Object.entries(query).every(([key, value]) => item[key] === value)
        })

        if (index !== -1) {
          if (update.$set) {
            items[index] = { ...items[index], ...update.$set }
          }
          if (update.$push) {
            Object.entries(update.$push).forEach(([key, value]) => {
              if (!items[index][key]) items[index][key] = []
              items[index][key].push(value)
            })
          }
          this.saveToLocalStorage()
        }

        return Promise.resolve({ modifiedCount: index !== -1 ? 1 : 0 })
      },

      deleteMany: (query: any) => {
        const items = this.data[name] || []
        const initialLength = items.length

        if (Object.keys(query).length === 0) {
          this.data[name] = []
        } else {
          this.data[name] = items.filter((item) => {
            return !Object.entries(query).every(([key, value]) => item[key] === value)
          })
        }

        this.saveToLocalStorage()
        return Promise.resolve({ deletedCount: initialLength - this.data[name].length })
      },
    }
  }
}

let localDb: LocalDatabase

export function getLocalDatabase() {
  if (!localDb) {
    localDb = new LocalDatabase()
  }
  return localDb
}
