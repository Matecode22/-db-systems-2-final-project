"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, Users, BookOpen, Settings } from "lucide-react"

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const seedDatabase = async () => {
    setIsSeeding(true)
    setMessage("")

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
      })

      if (response.ok) {
        setMessage("Base de datos poblada exitosamente! Usuarios de prueba creados.")
        setMessageType("success")
      } else {
        const error = await response.json()
        setMessage(error.error || "Error al poblar la base de datos")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Error de conexión")
      setMessageType("error")
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Poblar Base de Datos
            </CardTitle>
            <CardDescription>Carga datos de ejemplo para probar la aplicación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Esto creará:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• Datos universitarios (campus, facultades, profesores, materias)</li>
                <li>• Usuarios de prueba</li>
                <li>• Planes de evaluación de ejemplo</li>
                <li>• Grupos y materias</li>
              </ul>

              <Button onClick={seedDatabase} disabled={isSeeding} className="w-full">
                {isSeeding ? "Poblando..." : "Poblar Base de Datos"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Usuarios de Prueba
            </CardTitle>
            <CardDescription>Credenciales para probar la aplicación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">Estudiante 1</p>
                <p className="text-sm text-gray-600">juan.perez@estudiante.edu.co</p>
                <p className="text-sm text-gray-600">Contraseña: 123456</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-medium">Estudiante 2</p>
                <p className="text-sm text-gray-600">maria.gonzalez@estudiante.edu.co</p>
                <p className="text-sm text-gray-600">Contraseña: 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Datos de Ejemplo
            </CardTitle>
            <CardDescription>Información sobre los datos cargados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Materias:</strong> Bases de Datos, POO, Cálculo, Estructuras de Datos
              </p>
              <p>
                <strong>Profesores:</strong> Mónica Rojas, Carlos Mendoza, Ana García
              </p>
              <p>
                <strong>Semestres:</strong> 2024-1, 2024-2
              </p>
              <p>
                <strong>Campus:</strong> Principal (Bogotá), Norte (Medellín)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Variables de Entorno
            </CardTitle>
            <CardDescription>Estado de la configuración</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Supabase:</span>
                <span className="text-green-600">✓ Configurado</span>
              </div>
              <div className="flex justify-between">
                <span>MongoDB:</span>
                <span className="text-green-600">✓ Configurado</span>
              </div>
              <div className="flex justify-between">
                <span>NextAuth:</span>
                <span className="text-green-600">✓ Configurado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {message && (
        <Alert className={`mt-6 ${messageType === "success" ? "border-green-500" : "border-red-500"}`}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
