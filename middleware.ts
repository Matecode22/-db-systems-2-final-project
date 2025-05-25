import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Permitir acceso a rutas públicas
    const publicPaths = ["/auth/signin", "/auth/signup", "/api/auth"]
    const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))

    if (isPublicPath) {
      return NextResponse.next()
    }

    // Redirigir a login si no está autenticado
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a rutas públicas sin token
        const publicPaths = ["/auth/signin", "/auth/signup", "/api/auth"]
        const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))

        if (isPublicPath) return true

        // Requerir token para rutas protegidas
        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
