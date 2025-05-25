import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToMongoDB } from "./mongodb"
import { getLocalDatabase } from "./mongodb-fallback"
import { env } from "./env"
import bcrypt from "bcryptjs"

// Usuarios de prueba predefinidos
const testUsers = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@estudiante.edu.co",
    password: "123456",
  },
  {
    id: "2",
    name: "María González",
    email: "maria.gonzalez@estudiante.edu.co",
    password: "123456",
  },
  {
    id: "3",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@estudiante.edu.co",
    password: "123456",
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Intentar conectar a MongoDB primero
          const db = await connectToMongoDB()

          if (db) {
            // MongoDB disponible
            const user = await db.collection("users").findOne({
              email: credentials.email,
            })

            if (user) {
              const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
              if (isPasswordValid) {
                return {
                  id: user._id.toString(),
                  email: user.email,
                  name: user.name,
                }
              }
            }
          }

          // Si MongoDB no está disponible o el usuario no existe, usar fallback
          throw new Error("MongoDB not available, using fallback")
        } catch (mongoError) {
          console.warn("Using fallback authentication:", mongoError.message)

          // Verificar usuarios de prueba
          const testUser = testUsers.find((user) => user.email === credentials.email)

          if (testUser && testUser.password === credentials.password) {
            return {
              id: testUser.id,
              email: testUser.email,
              name: testUser.name,
            }
          }

          // Intentar con base de datos local
          try {
            const localDb = getLocalDatabase()
            const user = await localDb.collection("users").findOne({
              email: credentials.email,
            })

            if (user) {
              const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
              if (isPasswordValid) {
                return {
                  id: user._id.toString(),
                  email: user.email,
                  name: user.name,
                }
              }
            }

            // Si no existe el usuario y es un email de prueba, crearlo
            if (credentials.email.includes("@estudiante.edu.co")) {
              const hashedPassword = await bcrypt.hash(credentials.password, 12)
              const newUser = {
                name: credentials.email
                  .split("@")[0]
                  .replace(".", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
                email: credentials.email,
                password: hashedPassword,
                createdAt: new Date(),
              }
              const result = await localDb.collection("users").insertOne(newUser)
              return {
                id: result.insertedId,
                email: newUser.email,
                name: newUser.name,
              }
            }
          } catch (fallbackError) {
            console.error("Fallback authentication failed:", fallbackError)
          }

          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
}
