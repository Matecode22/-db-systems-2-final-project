import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verificar si el usuario está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas que requieren autenticación
  const protectedRoutes = ["/dashboard"]

  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // Si la ruta requiere autenticación y el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si el usuario está autenticado y está intentando acceder a la página de inicio de sesión o registro, redirigir al dashboard
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
