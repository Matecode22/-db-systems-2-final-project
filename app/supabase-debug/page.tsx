"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Info, Database, RefreshCw } from "lucide-react"

interface TableResult {
  table: string
  status: "success" | "error" | "info"
  message: string
  count?: number
  data?: string[]
}

interface DiagnosticResult {
  success: boolean
  tables: TableResult[]
  summary: {
    total: number
    accessible: number
    errors: number
  }
}

export default function SupabaseDebug() {
  const [results, setResults] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [groupsData, setGroupsData] = useState<any[]>([])

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/diagnostics/supabase-tables")
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error running diagnostics:", error)
    } finally {
      setLoading(false)
    }
  }

  const testGroupsAPI = async () => {
    try {
      const response = await fetch("/api/groups")
      if (response.ok) {
        const data = await response.json()
        setGroupsData(data)
        console.log("Groups API successful:", data)
      } else {
        const errorData = await response.json()
        console.error("Groups API error:", errorData)
        alert(`Error: ${errorData.error}\nDetails: ${errorData.details}`)
      }
    } catch (error) {
      console.error("Groups API request failed:", error)
      alert(`Request failed: ${error.message}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "info":
        return <Info className="w-4 h-4 text-blue-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">OK</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Diagnóstico de Supabase</h1>
          <p className="text-gray-600">Verifica el estado de las tablas y conexiones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button onClick={runDiagnostics} disabled={loading} className="w-full">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Verificando..." : "Verificar Tablas"}
          </Button>

          <Button onClick={testGroupsAPI} variant="outline" className="w-full">
            <Database className="w-4 h-4 mr-2" />
            Probar API de Grupos
          </Button>
        </div>

        {results && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{results.summary.accessible}</div>
                    <div className="text-sm text-gray-600">Tablas Accesibles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{results.summary.errors}</div>
                    <div className="text-sm text-gray-600">Errores</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{results.summary.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Estado de las Tablas</h2>

              {results.tables.map((table, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(table.status)}
                        <div>
                          <h3 className="font-medium">{table.table}</h3>
                          <p className="text-sm text-gray-600">{table.message}</p>
                          {table.count !== undefined && (
                            <p className="text-xs text-gray-500">{table.count} registros</p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(table.status)}
                    </div>

                    {table.data && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">Ver estructura</summary>
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                          <strong>Columnas:</strong> {table.data.join(", ")}
                        </div>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {groupsData.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Datos de Grupos (Muestra)</CardTitle>
              <CardDescription>Primeros grupos obtenidos de la API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupsData.slice(0, 5).map((group, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                    <div className="font-medium">
                      {group.subject_name} ({group.subject_code})
                    </div>
                    <div className="text-gray-600">
                      Grupo {group.group_number} - Prof. {group.professor_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {group.semester} {group.year} - {group.campus_name}
                    </div>
                  </div>
                ))}
                {groupsData.length > 5 && (
                  <div className="text-center text-sm text-gray-500">... y {groupsData.length - 5} grupos más</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
