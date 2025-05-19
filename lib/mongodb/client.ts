import { MongoClient, ServerApiVersion } from "mongodb"

// Patrón singleton para la conexión a MongoDB
let client: MongoClient | null = null

export async function getMongoClient() {
  if (!client) {
    // Usar la cadena de conexión proporcionada
    // En producción, esto debería venir de una variable de entorno
    const uri =
      process.env.MONGODB_URI ||
      "mongodb+srv://traqueto:sp5pZhKPf9CtSiWI@trackademicc.qamp8w4.mongodb.net/?retryWrites=true&w=majority&appName=trackademicc"

    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })

    try {
      // Conectar al cliente
      await client.connect()
      console.log("Conexión a MongoDB establecida correctamente")
    } catch (error) {
      console.error("Error al conectar a MongoDB:", error)
      client = null
      throw error
    }
  }

  return client
}

export async function getMongoDb() {
  const client = await getMongoClient()
  // Usar el nombre de base de datos correcto: "trackademicc"
  return client.db("trackademicc")
}

// Función para cerrar la conexión cuando la aplicación se cierra
export async function closeMongoConnection() {
  if (client) {
    await client.close()
    client = null
    console.log("Conexión a MongoDB cerrada")
  }
}
