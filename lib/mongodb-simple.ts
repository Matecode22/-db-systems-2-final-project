import { MongoClient } from "mongodb"
import { env } from "./env"

// Configuración mínima y confiable
const options = {
  retryWrites: true,
  w: "majority" as const,
}

let client: MongoClient | null = null
let isConnecting = false

export async function connectToMongoDB() {
  // Si ya hay una conexión, usarla
  if (client) {
    try {
      await client.db("admin").command({ ping: 1 })
      return client.db("trackademic")
    } catch (error) {
      console.warn("Existing connection failed, creating new one")
      client = null
    }
  }

  // Evitar múltiples intentos de conexión simultáneos
  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return connectToMongoDB()
  }

  isConnecting = true

  try {
    console.log("🔄 Intentando conectar a MongoDB...")
    client = new MongoClient(env.MONGODB_URI, options)
    await client.connect()

    // Verificar la conexión
    await client.db("admin").command({ ping: 1 })
    console.log("✅ MongoDB conectado exitosamente")

    isConnecting = false
    return client.db("trackademic")
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message)
    client = null
    isConnecting = false
    return null
  }
}

// Función para cerrar la conexión
export async function closeMongoDB() {
  if (client) {
    try {
      await client.close()
      client = null
      console.log("🔌 Conexión MongoDB cerrada")
    } catch (error) {
      console.error("Error cerrando conexión MongoDB:", error)
    }
  }
}
