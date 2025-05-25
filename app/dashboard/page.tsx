"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Verificando sesión en dashboard...")
        const supabase = getSupabaseClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        console.log("Respuesta de verificación de sesión:", { session, error })

        if (error) {
          console.error("Error al verificar sesión:", error)
          setError(error.message)
          router.push("/login")
          return
        }

        if (!session) {
          console.log("No hay sesión activa, redirigiendo a login")
          router.push("/login")
          return
        }

        console.log("Sesión válida:", session)
        setUser(session.user)
        setLoading(false)
      } catch (err) {
        console.error("Error inesperado:", err)
        setError("Error al verificar la sesión")
        router.push("/login")
      }
    }

    checkSession()
  }, [router])

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      router.push("/login")
    } catch (err) {
      console.error("Error al cerrar sesión:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Cargando...</h2>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Cerrar Sesión
        </Button>
      </div>

      {user && (
        <div className="mb-6">
          <p className="text-lg">Bienvenido, {user.email}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mis Cursos</CardTitle>
            <CardDescription>Gestiona tus cursos y planes de evaluación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/courses">
                <Button className="w-full">Ver Mis Cursos</Button>
              </Link>
              <Link href="/dashboard/evaluation-plans/new">
                <Button variant="outline" className="w-full">
                  Crear Plan de Evaluación
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis Notas</CardTitle>
            <CardDescription>Visualiza y gestiona tus notas por semestre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/grades">
                <Button className="w-full">Ver Mis Notas</Button>
              </Link>
              <Link href="/dashboard/grades/calculate">
                <Button variant="outline" className="w-full">
                  Calcular Nota Final
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informes y Estadísticas</CardTitle>
            <CardDescription>Visualiza informes sobre tu rendimiento académico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/dashboard/reports/semester-summary">
                <Button variant="outline" className="w-full">
                  Resumen del Semestre
                </Button>
              </Link>
              <Link href="/dashboard/reports/grade-trends">
                <Button variant="outline" className="w-full">
                  Tendencias de Notas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
