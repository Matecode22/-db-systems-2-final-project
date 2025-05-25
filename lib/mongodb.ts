import { MongoClient, ServerApiVersion } from "mongodb"
import { env } from "./env"

// Configuración corregida del cliente MongoDB
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Configuraciones de conexión simplificadas
  retryWrites: true,
  w: "majority" as const,
  // Timeouts
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  // Pool de conexiones
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  // Configuración TLS simplificada
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usar una variable global para preservar el valor
  // a través de recargas de módulos causadas por HMR (Hot Module Replacement)
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(env.MONGODB_URI, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // En producción, es mejor no usar una variable global
  client = new MongoClient(env.MONGODB_URI, options)
  clientPromise = client.connect()
}

export async function connectToMongoDB() {
  try {
    const client = await clientPromise
    // Verificar la conexión con un ping simple
    await client.db("admin").command({ ping: 1 })
    console.log("✅ Conectado exitosamente a MongoDB")
    return client.db("trackademic")
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error)
    // En lugar de lanzar error, retornar null para usar fallback
    return null
  }
}

// Función para cerrar la conexión (útil para cleanup)
export async function closeMongoDB() {
  try {
    const client = await clientPromise
    await client.close()
    console.log("🔌 Conexión MongoDB cerrada")
  } catch (error) {
    console.error("Error cerrando conexión MongoDB:", error)
  }
}

// Esquemas para MongoDB (mantener los existentes)
export interface EvaluationPlan {
  _id?: string
  groupId: number
  subjectName: string
  professorName: string
  semester: string
  year: number
  activities: Activity[]
  createdBy: string
  createdAt: Date
  comments: Comment[]
}

export interface Activity {
  id: string
  name: string
  percentage: number
  maxGrade: number
}

export interface StudentGrade {
  _id?: string
  studentId: string
  evaluationPlanId: string
  grades: {
    activityId: string
    grade: number
    date: Date
  }[]
  semester: string
  year: number
}

export interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  date: Date
}

export interface User {
  _id?: string
  name: string
  email: string
  password: string
  createdAt: Date
}
