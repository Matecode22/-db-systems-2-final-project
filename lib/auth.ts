import { SupabaseAdapter } from "@auth/supabase-adapter"
import type { NextAuthOptions, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getSupabaseClient } from "@/lib/supabase/server"

declare module "next-auth" {
  interface Session extends DefaultSession {
    supabaseAccessToken?: string
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user }) {
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()

      if (data?.session?.access_token) {
        session.supabaseAccessToken = data.session.access_token
      }
      return session
    },
  },
  providers: [
    // Usar CredentialsProvider como alternativa temporal
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const supabase = getSupabaseClient()
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) return null

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email,
          }
        } catch (error) {
          console.error("Error en autenticación:", error)
          return null
        }
      },
    }),
    // Comentamos los providers que requieren configuración adicional
    /*
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    */
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "temporal-secret-para-desarrollo",
}
