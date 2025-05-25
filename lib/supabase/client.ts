import { createClient } from "@supabase/supabase-js"

// Creamos un cliente de Supabase para el lado del cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Patrón singleton para evitar múltiples instancias
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            try {
              return JSON.parse(localStorage.getItem(key) || 'null')
            } catch (error) {
              return null
            }
          },
          setItem: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value))
          },
          removeItem: (key) => {
            localStorage.removeItem(key)
          },
        },
      },
    })

    // Suscribirse a cambios en el estado de autenticación
    supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("Cambio en estado de autenticación:", event, session)
      if (event === 'SIGNED_IN') {
        console.log("Usuario ha iniciado sesión")
        // Forzar una recarga de la página para asegurar que el estado se actualice
        window.location.href = "/dashboard"
      } else if (event === 'SIGNED_OUT') {
        console.log("Usuario ha cerrado sesión")
        window.location.href = "/login"
      }
    })
  }
  return supabaseClient
}
