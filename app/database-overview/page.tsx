"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Users, BookOpen, Building, RefreshCw } from "lucide-react"

interface TableData {
  groups: any[]
  subjects: any[]
  employees: any[]
  campuses: any[]
  programs: any[]
  areas: any[]
  faculties: any[]
}

export default function DatabaseOverview() {
  const [data, setData] = useState<TableData>({
    groups: [],
    subjects: [],
    employees: [],
    campuses: [],
    programs: [],
    areas: [],
    faculties: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/database-overview")
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error fetching data")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Cargando datos de la base de datos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Resumen de Base de Datos</h1>
        <Button onClick={fetchAllData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Resumen General */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Materias</p>
                <p className="text-2xl font-bold">{data.subjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Grupos</p>
                <p className="text-2xl font-bold">{data.groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empleados</p>
                <p className="text-2xl font-bold">{data.employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campus</p>
                <p className="text-2xl font-bold">{data.campuses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">Grupos ({data.groups.length})</TabsTrigger>
          <TabsTrigger value="subjects">Materias ({data.subjects.length})</TabsTrigger>
          <TabsTrigger value="employees">Empleados ({data.employees.length})</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grupos Disponibles</CardTitle>
              <CardDescription>Estos son los grupos que tienen planes de evaluación disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.groups.map((group, index) => {
                  const subject = data.subjects.find((s) => s.code === group.subject_code)
                  const employee = data.employees.find((e) => e.id === group.professor_id)

                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{subject?.name || "Materia Desconocida"}</h3>
                          <p className="text-sm text-gray-600">
                            Código: {group.subject_code} | Grupo: {group.number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Profesor: {employee ? `${employee.first_name} ${employee.last_name}` : "Desconocido"}
                          </p>
                        </div>
                        <Badge variant="outline">{group.semester}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Materias</CardTitle>
              <CardDescription>Lista completa de materias en la base de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.subjects.map((subject, index) => {
                  const hasGroup = data.groups.some((g) => g.subject_code === subject.code)
                  const program = data.programs.find((p) => p.code === subject.program_code)

                  return (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{subject.name}</h4>
                          <p className="text-sm text-gray-600">Código: {subject.code}</p>
                          <p className="text-xs text-gray-500">Programa: {program?.name || "N/A"}</p>
                        </div>
                        <Badge variant={hasGroup ? "default" : "secondary"}>
                          {hasGroup ? "Con Grupo" : "Sin Grupo"}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Empleados</CardTitle>
              <CardDescription>Lista de empleados en la base de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.employees.map((employee, index) => {
                  const isTeaching = data.groups.some((g) => g.professor_id === employee.id)
                  const faculty = data.faculties.find((f) => f.code === employee.faculty_code)

                  return (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </h4>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                          <p className="text-xs text-gray-500">
                            {employee.employee_type} | {employee.contract_type}
                          </p>
                          <p className="text-xs text-gray-500">Facultad: {faculty?.name || "N/A"}</p>
                        </div>
                        <Badge variant={isTeaching ? "default" : "secondary"}>
                          {isTeaching ? "Enseñando" : "No Asignado"}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Materias Sin Grupos</CardTitle>
                <CardDescription>Materias que no tienen grupos asignados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.subjects
                    .filter((subject) => !data.groups.some((g) => g.subject_code === subject.code))
                    .map((subject, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{subject.name}</p>
                        <p className="text-sm text-gray-600">Código: {subject.code}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profesores Sin Asignación</CardTitle>
                <CardDescription>Empleados docentes sin grupos asignados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.employees
                    .filter(
                      (employee) =>
                        employee.employee_type === "Docente" &&
                        !data.groups.some((g) => g.professor_id === employee.id),
                    )
                    .map((employee, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{employee.contract_type}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones</CardTitle>
              <CardDescription>Sugerencias para completar los datos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-800">Agregar más grupos</h4>
                  <p className="text-sm text-blue-700">
                    Tienes {data.subjects.length} materias pero solo {data.groups.length} grupos. Considera agregar
                    grupos para las materias restantes.
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-medium text-green-800">Datos disponibles</h4>
                  <p className="text-sm text-green-700">
                    La aplicación está funcionando correctamente con los {data.groups.length} grupos disponibles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
