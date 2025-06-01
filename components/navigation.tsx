"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Home,
  Calculator,
  FileText,
  Settings,
  Database,
  LogOut,
  User,
  Bug,
  Target,
  BarChart3,
} from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Planes", href: "/evaluation-plans", icon: FileText },
    { name: "Notas", href: "/grades", icon: Calculator },
    { name: "Calculadora", href: "/calculator", icon: Target },
    { name: "Informes", href: "/reports", icon: BarChart3 },
  ]

  const debugNavigation = [
    { name: "Diagnósticos", href: "/diagnostics", icon: Settings },
    { name: "Debug DB", href: "/supabase-debug", icon: Bug },
    { name: "Resumen BD", href: "/database-overview", icon: Database },
  ]

  if (!session) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Trackademic
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Debug Menu */}
            <div className="hidden sm:flex sm:space-x-4">
              {debugNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                      isActive ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center space-x-2 border-l pl-4">
              <User className="w-4 h-4" />
              <span className="text-sm text-gray-700">{session.user?.name || session.user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
