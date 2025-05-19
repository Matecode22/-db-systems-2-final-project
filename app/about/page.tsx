import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calculator, Users, Award, ArrowLeft } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Trackademic</h1>
          <div className="space-x-2">
            <Link href="/login">
              <Button variant="outline" className="bg-primary-foreground text-primary">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <section className="max-w-4xl mx-auto text-center py-8">
          <h2 className="text-4xl font-bold mb-6">Acerca de Trackademic</h2>
          <p className="text-xl mb-8">
            Trackademic es una plataforma diseñada para ayudar a estudiantes universitarios a gestionar y calcular sus
            notas académicas de manera eficiente y colaborativa.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Nuestra Misión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Nuestra misión es simplificar la gestión académica para los estudiantes, proporcionando herramientas
                intuitivas que les permitan tener un mejor control sobre su desempeño académico y tomar decisiones
                informadas sobre sus estudios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Nuestra Visión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Aspiramos a ser la plataforma líder en gestión académica, creando un ecosistema donde los estudiantes
                puedan colaborar, compartir conocimientos y mejorar continuamente su rendimiento académico.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="py-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Características Principales</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Planes de Evaluación
                </CardTitle>
                <CardDescription>Gestiona tus planes de evaluación</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Crea y personaliza planes de evaluación para cada uno de tus cursos. Define actividades, asigna
                  porcentajes y mantén un registro organizado de tus evaluaciones.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Cálculo de Notas
                </CardTitle>
                <CardDescription>Calcula tus notas automáticamente</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Trackademic calcula automáticamente tus notas finales basadas en los porcentajes de cada evaluación.
                  También puedes simular escenarios para determinar qué notas necesitas en futuras evaluaciones.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Colaboración
                </CardTitle>
                <CardDescription>Comparte y colabora con compañeros</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Comparte tus planes de evaluación con compañeros de clase, comenta en los planes de otros y colabora
                  para mantener la información actualizada y precisa.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-8 text-center">
          <h3 className="text-2xl font-bold mb-6">¿Listo para comenzar?</h3>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Registrarse Ahora</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-6 px-4">
        <div className="container mx-auto text-center">
          <p>© 2023 Trackademic - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  )
}
