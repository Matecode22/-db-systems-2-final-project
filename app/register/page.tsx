"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [studentId, setStudentId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido")
      setLoading(false)
      return
    }

    // Validar que no sea un dominio de ejemplo
    const exampleDomains = ['example.com', 'test.com', 'demo.com']
    const emailDomain = email.split('@')[1]
    if (exampleDomains.includes(emailDomain)) {
      setError("Por favor, usa un correo electrónico con un dominio válido")
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()

      // Validar longitud de contraseña
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        setLoading(false)
        return
      }

      // Registrar al usuario en Supabase Auth
      const { error: authError, data } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            university_student_id: studentId,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        console.error("Error detallado:", authError)
        if (authError.message.includes("Email")) {
          setError("El correo electrónico no es válido o ya está registrado")
        } else if (authError.message.includes("password")) {
          setError("La contraseña debe tener al menos 6 caracteres")
        } else if (authError.message.includes("rate limit")) {
          setError("Demasiados intentos. Por favor, espera unos minutos antes de intentar de nuevo.")
        } else {
          setError(`Error al registrarse: ${authError.message}`)
        }
        setLoading(false)
        return
      }

      if (data?.user) {
        console.log("Usuario registrado exitosamente:", data.user)
        // Mostrar mensaje de confirmación
        setError("Por favor, revisa tu correo electrónico para confirmar tu cuenta")
        // Redirigir a la página de verificación después de 3 segundos
        setTimeout(() => {
          router.push("/verification")
        }, 3000)
      } else {
        setError("No se pudo crear el usuario. Por favor, intenta de nuevo.")
      }
    } catch (err: any) {
      console.error("Error detallado de registro:", err)
      setError(err.message || "Error al registrarse. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-primary">
              Trackademic
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">Ingresa tus datos para registrarte en Trackademic</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Nombre Completo</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-id">ID de Estudiante (opcional)</Label>
              <Input
                id="student-id"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Ej: 20201020345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
            <p className="text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
