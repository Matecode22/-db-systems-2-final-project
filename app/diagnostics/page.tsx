"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Database, Server } from "lucide-react"

interface DiagnosticResult {
  name: string
  status: "success" | "error" | "warning"
  message: string
  details?: string
}

export default function Diagnostics() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    const tests: DiagnosticResult[] = []

    // Test 1: Variables de entorno
    tests.push({
      name: "Variables de Entorno",
      status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "success" : "error",
      message: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Variables configuradas" : "Variables faltantes",
    })

    // Test 2: Conexión a Supabase
    try {
      const response = await fetch("/api/diagnostics/supabase")
      const data = await response.json()
      tests.push({
        name: "Conexión Supabase",
        status: data.success ? "success" : "error",
        message: data.message,
        details: data.details,
      })
    } catch (error) {
      tests.push({
        name: "Conexión Supabase",
        status: "error",
        message: "Error de conexión",
        details: error.message,
      })
    }

    // Test 3: Conexión a MongoDB
    try {
      const response = await fetch("/api/diagnostics/mongodb")
      const data = await response.json()
      tests.push({
        name: "Conexión MongoDB",
        status: data.success ? "success" : "warning",
        message: data.message,
        details: data.details,
      })
    } catch (error) {
      tests.push({
        name: "Conexión MongoDB",
        status: "warning",
        message: "Usando almacenamiento local como fallback",
        details: error.message,
      })
    }

    // Test 4: Autenticación
    try {
      const response = await fetch("/api/diagnostics/auth")
      const data = await response.json()
      tests.push({
        name: "Sistema de Autenticación",
        status: data.success ? "success" : "error",
        message: data.message,
      })
    } catch (error) {
      tests.push({
        name: "Sistema de Autenticación",
        status: "error",
        message: "Error en configuración de auth",
        details: error.message,
      })
    }

    setResults(tests)
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Advertencia</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Diagnósticos del Sistema</h1>
          <p className="text-gray-600">Verifica el estado de las conexiones y configuraciones</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Ejecutar Diagnósticos
            </CardTitle>
            <CardDescription>Verifica todas las conexiones y configuraciones del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
              {isRunning ? "Ejecutando diagnósticos..." : "Ejecutar Diagnósticos"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resultados</h2>

            {results.map((result, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <h3 className="font-medium">{result.name}</h3>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs bg-gray-50 p-2 rounded">
                      <summary className="cursor-pointer font-medium">Ver detalles</summary>
                      <pre className="mt-2 whitespace-pre-wrap">{result.details}</pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Resumen */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.filter((r) => r.status === "success").length}
                    </div>
                    <div className="text-sm text-gray-600">Exitosos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.filter((r) => r.status === "warning").length}
                    </div>
                    <div className="text-sm text-gray-600">Advertencias</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {results.filter((r) => r.status === "error").length}
                    </div>
                    <div className="text-sm text-gray-600">Errores</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Información adicional */}
        <Alert className="mt-6">
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Si MongoDB no está disponible, la aplicación usará almacenamiento local como
            fallback. Esto permite que la aplicación funcione sin conexión a MongoDB para propósitos de desarrollo y
            demostración.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
