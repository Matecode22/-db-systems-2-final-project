import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
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
        <section className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-4xl font-bold mb-6">Gestiona tus notas académicas</h2>
          <p className="text-xl mb-8">
            Trackademic te ayuda a organizar y calcular tus notas para que siempre sepas cómo vas en tus cursos.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Comenzar ahora</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">
                Conocer más
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 py-12">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3">Planes de evaluación</h3>
            <p>Crea y gestiona planes de evaluación para tus cursos con porcentajes personalizados.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3">Cálculo de notas</h3>
            <p>Calcula automáticamente tus notas finales basadas en los porcentajes de cada evaluación.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3">Colaboración</h3>
            <p>Comparte planes de evaluación con tus compañeros y comenta en los planes de otros.</p>
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
