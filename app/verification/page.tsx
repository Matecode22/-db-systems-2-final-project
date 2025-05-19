import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function VerificationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-primary">
              Trackademic
            </Link>
          </div>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verifica tu correo electrónico</CardTitle>
          <CardDescription className="text-center">
            Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, revisa tu bandeja de entrada y
            haz clic en el enlace para verificar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Si no recibes el correo en unos minutos, revisa tu carpeta de spam o solicita un nuevo enlace de
            verificación.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full">Volver a Iniciar Sesión</Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              Volver al Inicio
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
