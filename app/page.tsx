"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FileText, Calculator, TrendingUp, Database, Target } from "lucide-react"

export default function Dashboard() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-600">Trackademic</CardTitle>
            <CardDescription>Sistema de Gestión de Notas Académicas</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Inicia sesión para acceder al sistema de gestión de notas y planes de evaluación
            </p>
            <Link href="/auth/signin">
              <Button className="w-full">Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header Principal */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Trackademic</h1>
        <p className="text-xl text-gray-600 mb-4">Sistema de Gestión de Notas y Planes de Evaluación Académica</p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <Target className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Objetivo:</strong> Ayudar a estudiantes a manejar sus notas semestrales y calcular estimados de
                calificaciones necesarias para aprobar materias, con manejo preciso de porcentajes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Funcionalidades Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Planes de Evaluación
            </CardTitle>
            <CardDescription>Crear y gestionar sistemas de evaluación por materia y grupo</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li>• Definir actividades y porcentajes (suma = 100%)</li>
              <li>• Planes por materia y grupo específico</li>
              <li>• Sistema colaborativo con comentarios</li>
              <li>• Modificar y eliminar actividades</li>
            </ul>
            <Link href="/evaluation-plans">
              <Button className="w-full">Gestionar Planes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-green-600" />
              Gestión de Notas
            </CardTitle>
            <CardDescription>Ingresar, editar y calcular notas por semestre</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li>• Seleccionar semestre y curso</li>
              <li>• Ingresar notas por actividad</li>
              <li>• Editar y eliminar notas</li>
              <li>• Cálculo automático de promedios</li>
            </ul>
            <Link href="/grades">
              <Button className="w-full">Gestionar Notas</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Calculadora de Estimados
            </CardTitle>
            <CardDescription>Calcular notas necesarias para aprobar</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li>• Estimado de notas requeridas</li>
              <li>• Análisis de porcentajes pendientes</li>
              <li>• Proyección de nota final</li>
              <li>• Metas personalizables</li>
            </ul>
            <Link href="/calculator">
              <Button className="w-full">Usar Calculadora</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2 text-red-600" />
              Arquitectura Híbrida
            </CardTitle>
            <CardDescription>PostgreSQL + MongoDB</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li>• Supabase: Datos universitarios</li>
              <li>• MongoDB: Planes y notas</li>
              <li>• Sincronización automática</li>
              <li>• Escalabilidad garantizada</li>
            </ul>
            <Link href="/database-overview">
              <Button className="w-full">Ver Arquitectura</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
