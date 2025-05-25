"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Award, AlertCircle } from "lucide-react"

interface SubjectReport {
  subjectName: string
  professorName: string
  semester: string
  year: number
  currentGrade: number
  projectedGrade: number
  completedActivities: number
  totalActivities: number
  activities: ActivityReport[]
}

interface ActivityReport {
  name: string
  percentage: number
  maxGrade: number
  currentGrade: number
  status: "completed" | "pending" | "partial"
}

interface SemesterStats {
  semester: string
  year: number
  averageGrade: number
  totalSubjects: number
  completedSubjects: number
  highestGrade: number
  lowestGrade: number
}

export default function Reports() {
  const { data: session } = useSession()
  const [subjectReports, setSubjectReports] = useState<SubjectReport[]>([])
  const [semesterStats, setSemesterStats] = useState<SemesterStats[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchReports()
    }
  }, [session])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports")
      if (response.ok) {
        const data = await response.json()
        setSubjectReports(data.subjectReports)
        setSemesterStats(data.semesterStats)
        if (data.semesterStats.length > 0) {
          setSelectedSemester(`${data.semesterStats[0].semester}-${data.semesterStats[0].year}`)
        }
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedSemesterData = () => {
    if (!selectedSemester) return null
    const [semester, year] = selectedSemester.split("-")
    return semesterStats.find((s) => s.semester === semester && s.year.toString() === year)
  }

  const getSubjectsForSemester = () => {
    if (!selectedSemester) return []
    const [semester, year] = selectedSemester.split("-")
    return subjectReports.filter((s) => s.semester === semester && s.year.toString() === year)
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return "text-green-600"
    if (grade >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeBadgeVariant = (grade: number) => {
    if (grade >= 80) return "default"
    if (grade >= 70) return "secondary"
    return "destructive"
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando informes...</div>
  }

  const selectedSemesterData = getSelectedSemesterData()
  const semesterSubjects = getSubjectsForSemester()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Informes Académicos</h1>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar semestre" />
          </SelectTrigger>
          <SelectContent>
            {semesterStats.map((stat) => (
              <SelectItem key={`${stat.semester}-${stat.year}`} value={`${stat.semester}-${stat.year}`}>
                {stat.semester} {stat.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSemesterData && (
        <>
          {/* Resumen del Semestre */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getGradeColor(selectedSemesterData.averageGrade)}`}>
                  {selectedSemesterData.averageGrade.toFixed(1)}%
                </div>
                <Progress value={selectedSemesterData.averageGrade} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materias</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedSemesterData.totalSubjects}</div>
                <p className="text-xs text-muted-foreground">{selectedSemesterData.completedSubjects} completadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nota Más Alta</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{selectedSemesterData.highestGrade.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nota Más Baja</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{selectedSemesterData.lowestGrade.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Detalle por Materia */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Detalle por Materia</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {semesterSubjects.map((subject, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {subject.subjectName}
                      <Badge variant={getGradeBadgeVariant(subject.currentGrade)}>
                        {subject.currentGrade.toFixed(1)}%
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Prof. {subject.professorName} | {subject.completedActivities}/{subject.totalActivities}{" "}
                      actividades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progreso actual</span>
                          <span>{subject.currentGrade.toFixed(1)}%</span>
                        </div>
                        <Progress value={subject.currentGrade} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Nota proyectada</span>
                          <span className={getGradeColor(subject.projectedGrade)}>
                            {subject.projectedGrade.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={subject.projectedGrade} className="h-2" />
                      </div>

                      <div className="border-t pt-3">
                        <h4 className="font-medium mb-2">Actividades</h4>
                        <div className="space-y-1">
                          {subject.activities.slice(0, 3).map((activity, actIndex) => (
                            <div key={actIndex} className="flex justify-between items-center text-sm">
                              <span className="truncate">{activity.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={activity.status === "completed" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {activity.status === "completed"
                                    ? `${activity.currentGrade}/${activity.maxGrade}`
                                    : "Pendiente"}
                                </Badge>
                                <span className="text-xs text-gray-500">{activity.percentage}%</span>
                              </div>
                            </div>
                          ))}
                          {subject.activities.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{subject.activities.length - 3} actividades más
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Análisis y Recomendaciones */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Análisis y Recomendaciones</CardTitle>
              <CardDescription>Insights basados en tu rendimiento académico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    Fortalezas
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {semesterSubjects
                      .filter((s) => s.currentGrade >= 80)
                      .slice(0, 3)
                      .map((subject, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Excelente rendimiento en {subject.subjectName} ({subject.currentGrade.toFixed(1)}%)
                        </li>
                      ))}
                    {selectedSemesterData.averageGrade >= 75 && (
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Promedio general por encima del 75%
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                    Áreas de Mejora
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {semesterSubjects
                      .filter((s) => s.currentGrade < 70)
                      .slice(0, 3)
                      .map((subject, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          Reforzar {subject.subjectName} (actual: {subject.currentGrade.toFixed(1)}%)
                        </li>
                      ))}
                    {semesterSubjects.some((s) => s.completedActivities / s.totalActivities < 0.5) && (
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        Completar actividades pendientes
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
