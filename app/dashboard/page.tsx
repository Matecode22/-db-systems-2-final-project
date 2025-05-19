import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

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
