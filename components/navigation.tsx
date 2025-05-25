"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Calculator, BarChart3, LogOut, User, Settings, Bug } from "lucide-react"

export function Navigation() {
  const { data: session } = useSession()

  if (!session) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Trackademic
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/evaluation-plans">
              <Button variant="ghost" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Planes
              </Button>
            </Link>
            <Link href="/grades">
              <Button variant="ghost" size="sm">
                <Calculator className="w-4 h-4 mr-2" />
                Notas
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Informes
              </Button>
            </Link>

            {/* Menú de diagnósticos */}
            <div className="flex items-center space-x-1">
              <Link href="/diagnostics">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Diagnósticos
                </Button>
              </Link>
              <Link href="/supabase-debug">
                <Button variant="ghost" size="sm">
                  <Bug className="w-4 h-4 mr-2" />
                  Debug DB
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
              <User className="w-4 h-4" />
              <span className="text-sm">{session.user?.name}</span>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
