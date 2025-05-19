"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function SemesterSummaryPage() {
  const [semesters, setSemesters] = useState(["2023-1", "2023-2"])
  const [selectedSemester, setSelectedSemester] = useState("")
  const [summaryData, setSummaryData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedSemester) {
      fetchSummaryData(selectedSemester)
    }
  }, [selectedSemester])

  const fetchSummaryData = async (semester: string) => {
    setLoading(true)
    setError(null)

    try {
      // Obtener las notas del estudiante para el semestre seleccionado
      const response = await fetch(`/api/student-grades?studentUserId=user123&semester=${semester}`)

      if (!response.ok) {
        throw new Error("Error al obtener las notas del semestre")
      }

      const gradesData = await response.json()

      // Procesar los datos para el informe
      if (gradesData.length === 0) {
        setSummaryData({
          semester,
          courses: [],
          averageGrade: 0,
          totalCredits: 0,
          completedActivities: 0,
          pendingActivities: 0,
        })
        setLoading(false)
        return
      }

      // Obtener los detalles de los planes de evaluación
      const planIds = gradesData.map((grade: any) => grade.evaluation_plan_id)

      // Calcular estadísticas
      let totalGrade = 0
      let totalPercentage = 0
      let completedActivities = 0
      let pendingActivities = 0

      // Procesar los datos de cada curso
      const courses = gradesData
        .map((grade: any) => {
          if (!grade.plan_details) return null

          const courseGrade = calculateCourseGrade(grade.grades_details)
          totalGrade += courseGrade.finalGrade
          totalPercentage += courseGrade.percentageCompleted

          completedActivities += grade.grades_details.filter((detail: any) => detail.score > 0).length
          pendingActivities += grade.grades_details.filter((detail: any) => detail.score === 0).length

          return {
            name: grade.plan_details.subject_code,
            grade: courseGrade.finalGrade,
            percentageCompleted: courseGrade.percentageCompleted,
          }
        })
        .filter(Boolean)

      const averageGrade = courses.length > 0 ? totalGrade / courses.length : 0

      setSummaryData({
        semester,
        courses,
        averageGrade,
        totalCredits: courses.length * 3, // Asumiendo 3 créditos por curso
        completedActivities,
        pendingActivities,
      })
    } catch (err: any) {
      console.error("Error fetching summary data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateCourseGrade = (gradeDetails: any[]) => {
    let finalGrade = 0
    let totalPercentage = 0
    let percentageCompleted = 0

    gradeDetails.forEach((detail: any) => {
      if (detail.score > 0) {
        finalGrade += (detail.score * detail.percentage) / 100
        percentageCompleted += detail.percentage
      }
      totalPercentage += detail.percentage
    })

    // Ajustar la nota final según el porcentaje completado
    const adjustedFinalGrade = percentageCompleted > 0 ? (finalGrade * 100) / percentageCompleted : 0

    return {
      finalGrade: adjustedFinalGrade,
      percentageCompleted: (percentageCompleted / totalPercentage) * 100,
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Resumen del Semestre</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Semestre</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="semester">Semestre</Label>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Seleccionar semestre" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedSemester && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Resumen del Semestre {selectedSemester}</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
          ) : summaryData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Promedio General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <p className="text-5xl font-bold">{summaryData.averageGrade.toFixed(2)}</p>
                      <p className="text-muted-foreground mt-2">sobre 5.0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progreso del Semestre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <p className="text-5xl font-bold">
                        {Math.round(
                          (summaryData.completedActivities /
                            (summaryData.completedActivities + summaryData.pendingActivities)) *
                            100,
                        ) || 0}
                        %
                      </p>
                      <p className="text-muted-foreground mt-2">
                        {summaryData.completedActivities} de{" "}
                        {summaryData.completedActivities + summaryData.pendingActivities} actividades completadas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Notas por Asignatura</CardTitle>
                </CardHeader>
                <CardContent>
                  {summaryData.courses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No hay notas registradas para este semestre.
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={summaryData.courses} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                          <YAxis domain={[0, 5]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="grade" fill="#8884d8" name="Nota" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
