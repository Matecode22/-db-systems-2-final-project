"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database, Wifi } from "lucide-react"

interface SystemStatus {
  mongodb: "connected" | "disconnected" | "fallback"
  supabase: "connected" | "disconnected"
  auth: "working" | "error"
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    mongodb: "disconnected",
    supabase: "disconnected",
    auth: "error",
  })

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    // Verificar MongoDB
    try {
      const mongoResponse = await fetch("/api/diagnostics/mongodb")
      const mongoData = await mongoResponse.json()
      setStatus((prev) => ({
        ...prev,
        mongodb: mongoData.success ? "connected" : "fallback",
      }))
    } catch {
      setStatus((prev) => ({ ...prev, mongodb: "fallback" }))
    }

    // Verificar Supabase
    try {
      const supabaseResponse = await fetch("/api/diagnostics/supabase")
      const supabaseData = await supabaseResponse.json()
      setStatus((prev) => ({
        ...prev,
        supabase: supabaseData.success ? "connected" : "disconnected",
      }))
    } catch {
      setStatus((prev) => ({ ...prev, supabase: "disconnected" }))
    }

    // Verificar Auth
    try {
      const authResponse = await fetch("/api/diagnostics/auth")
      const authData = await authResponse.json()
      setStatus((prev) => ({
        ...prev,
        auth: authData.success ? "working" : "error",
      }))
    } catch {
      setStatus((prev) => ({ ...prev, auth: "error" }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "working":
        return <Badge className="bg-green-100 text-green-800">Funcionando</Badge>
      case "fallback":
        return <Badge className="bg-yellow-100 text-yellow-800">Modo Local</Badge>
      case "disconnected":
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "working":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "fallback":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "disconnected":
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Wifi className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Estado del Sistema</h1>
          <p className="text-gray-600">Estado actual de las conexiones y servicios</p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(status.mongodb)}
                  <span className="ml-3">Base de Datos (MongoDB)</span>
                </div>
                {getStatusBadge(status.mongodb)}
              </CardTitle>
              <CardDescription>
                {status.mongodb === "connected" && "Conectado a MongoDB Atlas"}
                {status.mongodb === "fallback" && "Usando almacenamiento local como respaldo"}
                {status.mongodb === "disconnected" && "Sin conexión a base de datos"}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(status.supabase)}
                  <span className="ml-3">Base de Datos Universitaria (Supabase)</span>
                </div>
                {getStatusBadge(status.supabase)}
              </CardTitle>
              <CardDescription>
                {status.supabase === "connected" && "Conectado a Supabase - datos universitarios disponibles"}
                {status.supabase === "disconnected" && "Sin conexión a Supabase"}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(status.auth)}
                  <span className="ml-3">Sistema de Autenticación</span>
                </div>
                {getStatusBadge(status.auth)}
              </CardTitle>
              <CardDescription>
                {status.auth === "working" && "Sistema de login funcionando correctamente"}
                {status.auth === "error" && "Problemas con el sistema de autenticación"}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Modo de funcionamiento:</span>
                <span className="font-medium">{status.mongodb === "connected" ? "Completo" : "Local"}</span>
              </div>
              <div className="flex justify-between">
                <span>Usuarios de prueba:</span>
                <span className="font-medium">Disponibles</span>
              </div>
              <div className="flex justify-between">
                <span>Datos universitarios:</span>
                <span className="font-medium">
                  {status.supabase === "connected" ? "Disponibles" : "No disponibles"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {status.mongodb === "fallback" && (
          <Card className="mt-4 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Modo Local Activo</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    La aplicación está funcionando en modo local. Puedes usar todas las funcionalidades, pero los datos
                    se guardan localmente en tu navegador.
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    <strong>Usuario de prueba:</strong> juan.perez@estudiante.edu.co / 123456
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
