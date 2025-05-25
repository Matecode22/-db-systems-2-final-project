import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()
    const path = req.nextUrl.pathname

    console.log("Middleware - Ruta:", path, "Sesión:", session ? "Activa" : "No hay sesión")

    // Si el usuario intenta acceder a /dashboard (o subrutas) sin sesión, redirige a /login
    if (path.startsWith("/dashboard") && !session) {
      console.log("Middleware - Redirigiendo a login")
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Si el usuario está autenticado y accede a /login o /register, redirige a /dashboard
    if (session && (path === "/login" || path === "/register")) {
      console.log("Middleware - Redirigiendo a dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Permite el acceso a cualquier otra ruta
    return res
  } catch (error) {
    console.error("Error en middleware:", error)
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
