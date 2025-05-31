"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  AlertCircle, 
  BarChart3, 
  Calendar,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"

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

interface TrendData {
  semester: string
  year: number
  average: number
  subjects: string[]
}

interface Recommendation {
  type: "warning" | "success" | "info"
  icon: any
  title: string
  description: string
  action?: string
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

  // Convertir porcentajes a escala 0-5 (solo si los datos vienen en porcentajes)
  const convertToDecimalScale = (value: number): number => {
    // Si el valor es mayor a 5, asumimos que está en porcentaje y lo convertimos
    // Si es menor o igual a 5, asumimos que ya está en escala decimal
    return value > 5 ? (value / 100) * 5 : value
  }

  const getSelectedSemesterData = () => {
    if (!selectedSemester) return null
    const [semester, year] = selectedSemester.split("-")
    const data = semesterStats.find((s) => s.semester === semester && s.year.toString() === year)
    if (data) {
      return {
        ...data,
        averageGrade: convertToDecimalScale(data.averageGrade),
        highestGrade: convertToDecimalScale(data.highestGrade),
        lowestGrade: convertToDecimalScale(data.lowestGrade)
      }
    }
    return null
  }

  const getSubjectsForSemester = () => {
    if (!selectedSemester) return []
    const [semester, year] = selectedSemester.split("-")
    return subjectReports.filter((s) => s.semester === semester && s.year.toString() === year)
      .map(subject => ({
        ...subject,
        currentGrade: convertToDecimalScale(subject.currentGrade),
        projectedGrade: convertToDecimalScale(subject.projectedGrade)
      }))
  }

  const getTrendData = (): TrendData[] => {
    return semesterStats.map(stat => ({
      semester: stat.semester,
      year: stat.year,
      average: convertToDecimalScale(stat.averageGrade),
      subjects: subjectReports
        .filter(s => s.semester === stat.semester && s.year === stat.year)
        .map(s => s.subjectName)
    })).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.semester.localeCompare(b.semester)
    })
  }

  const getSubjectComparison = () => {
    const subjects = getSubjectsForSemester()
    return subjects.sort((a, b) => b.currentGrade - a.currentGrade)
  }

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = []
    const subjects = getSubjectsForSemester()
    const selectedData = getSelectedSemesterData()

    if (!selectedData || subjects.length === 0) return recommendations

    // Análisis de rendimiento general
    if (selectedData.averageGrade >= 4.0) {
      recommendations.push({
        type: "success",
        icon: Award,
        title: "¡Excelente rendimiento!",
        description: `Tu promedio de ${selectedData.averageGrade.toFixed(1)} está en el rango sobresaliente. Continúa con el buen trabajo.`,
        action: "Mantén tu rutina de estudio"
      })
    } else if (selectedData.averageGrade >= 3.0) {
      recommendations.push({
        type: "info",
        icon: Target,
        title: "Rendimiento satisfactorio",
        description: `Tu promedio de ${selectedData.averageGrade.toFixed(1)} está en rango aprobatorio. Hay oportunidades de mejora.`,
        action: "Identifica materias para mejorar"
      })
    } else {
      recommendations.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Necesita atención urgente",
        description: `Tu promedio de ${selectedData.averageGrade.toFixed(1)} está por debajo del mínimo para aprobar.`,
        action: "Revisa tu estrategia de estudio"
      })
    }

    // Materias en riesgo
    const failingSubjects = subjects.filter(s => s.currentGrade < 3.0 && s.currentGrade > 0)
    if (failingSubjects.length > 0) {
      recommendations.push({
        type: "warning",
        icon: AlertCircle,
        title: `${failingSubjects.length} materia(s) en riesgo`,
        description: `${failingSubjects.map(s => s.subjectName).join(", ")} necesitan atención inmediata.`,
        action: "Enfocar esfuerzos en estas materias"
      })
    }

    // Actividades pendientes
    const pendingActivities = subjects.reduce((total, subject) => 
      total + (subject.totalActivities - subject.completedActivities), 0)
    
    if (pendingActivities > 0) {
      recommendations.push({
        type: "info",
        icon: Clock,
        title: `${pendingActivities} actividades pendientes`,
        description: "Tienes actividades sin completar que podrían mejorar tu promedio.",
        action: "Revisa tu calendario académico"
      })
    }

    // Análisis de tendencias
    const trends = getTrendData()
    if (trends.length >= 2) {
      const current = trends[trends.length - 1].average
      const previous = trends[trends.length - 2].average
      const improvement = current - previous

      if (improvement > 0.3) {
        recommendations.push({
          type: "success",
          icon: TrendingUp,
          title: "Tendencia positiva",
          description: `Has mejorado ${improvement.toFixed(1)} puntos respecto al semestre anterior.`,
          action: "Continúa con tu estrategia actual"
        })
      } else if (improvement < -0.3) {
        recommendations.push({
          type: "warning",
          icon: TrendingDown,
          title: "Tendencia descendente",
          description: `Has bajado ${Math.abs(improvement).toFixed(1)} puntos respecto al semestre anterior.`,
          action: "Evalúa qué cambió en tu rutina"
        })
      }
    }

    return recommendations
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 4.0) return "text-green-600"
    if (grade >= 3.5) return "text-blue-600"
    if (grade >= 3.0) return "text-yellow-600"
    return "text-red-600"
  }

  const getGradeBadgeVariant = (grade: number) => {
    if (grade >= 4.0) return "default"
    if (grade >= 3.5) return "secondary" 
    if (grade >= 3.0) return "outline"
    return "destructive"
  }

  const getStatusIcon = (subject: any) => {
    if (subject.completedActivities === subject.totalActivities) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    if (subject.completedActivities > 0) {
      return <Clock className="w-4 h-4 text-yellow-600" />
    }
    return <AlertCircle className="w-4 h-4 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-4 animate-pulse" />
            <p>Generando informes académicos...</p>
          </div>
        </div>
      </div>
    )
  }

  const selectedSemesterData = getSelectedSemesterData()
  const semesterSubjects = getSubjectsForSemester()
  const trendData = getTrendData()
  const subjectComparison = getSubjectComparison()
  const recommendations = generateRecommendations()

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Informes Académicos</h1>
          <p className="text-gray-600">Análisis completo de tu rendimiento académico</p>
        </div>
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

      <Tabs defaultValue="consolidado" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consolidado">Consolidado</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
          <TabsTrigger value="comparacion">Comparación</TabsTrigger>
          <TabsTrigger value="recomendaciones">Recomendaciones</TabsTrigger>
        </TabsList>

        {/* Consolidado por Semestre */}
        <TabsContent value="consolidado" className="space-y-6">
          {selectedSemesterData && (
            <>
              {/* Resumen del Semestre */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getGradeColor(selectedSemesterData.averageGrade)}`}>
                      {selectedSemesterData.averageGrade.toFixed(1)}
                    </div>
                    <Progress value={(selectedSemesterData.averageGrade / 5) * 100} className="mt-2" />
                    <div className="text-xs text-gray-500 mt-1">Escala 0.0 - 5.0</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Materias</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedSemesterData.totalSubjects}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedSemesterData.completedSubjects} con todas las actividades
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nota Más Alta</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedSemesterData.highestGrade.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nota Más Baja</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {selectedSemesterData.lowestGrade.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalle por Materia */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {selectedSemester} - Detalle por Materia
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {semesterSubjects.map((subject, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(subject)}
                            {subject.subjectName}
                          </div>
                          <Badge variant={getGradeBadgeVariant(subject.currentGrade)}>
                            {subject.currentGrade.toFixed(1)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Prof. {subject.professorName} | {subject.completedActivities}/{subject.totalActivities} actividades
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Nota actual</span>
                              <span>{subject.currentGrade.toFixed(1)}/5.0</span>
                            </div>
                            <Progress value={(subject.currentGrade / 5) * 100} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progreso</span>
                              <span>{Math.round((subject.completedActivities / subject.totalActivities) * 100)}%</span>
                            </div>
                            <Progress value={(subject.completedActivities / subject.totalActivities) * 100} className="h-2" />
                          </div>

                          {subject.currentGrade < 3.0 && subject.currentGrade > 0 && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Necesita mejorar para aprobar</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Análisis de Tendencias */}
        <TabsContent value="tendencias" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Análisis de Tendencias
            </h2>

            {trendData.length >= 2 ? (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolución del Promedio</CardTitle>
                    <CardDescription>Tu rendimiento a través de los semestres</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trendData.map((data, index) => {
                        const isLast = index === trendData.length - 1
                        const prevData = index > 0 ? trendData[index - 1] : null
                        const change = prevData ? data.average - prevData.average : 0
                        
                        return (
                          <div key={`${data.semester}-${data.year}`} className={`flex items-center justify-between p-4 rounded-lg border ${isLast ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <div>
                              <div className="font-medium">{data.semester} {data.year}</div>
                              <div className="text-sm text-gray-500">{data.subjects.length} materias</div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getGradeColor(data.average)}`}>
                                {data.average.toFixed(1)}
                              </div>
                              {change !== 0 && (
                                <div className={`text-sm flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                  {change > 0 ? '+' : ''}{change.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Datos insuficientes</h3>
                  <p className="text-gray-600">Necesitas al menos 2 semestres para ver tendencias</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Comparación entre Materias */}
        <TabsContent value="comparacion" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Comparación entre Materias
            </h2>

            {subjectComparison.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Materias</CardTitle>
                  <CardDescription>Ordenadas por rendimiento actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjectComparison.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{subject.subjectName}</div>
                            <div className="text-sm text-gray-500">Prof. {subject.professorName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getGradeColor(subject.currentGrade)}`}>
                            {subject.currentGrade.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subject.completedActivities}/{subject.totalActivities} actividades
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Sin datos para comparar</h3>
                  <p className="text-gray-600">Agrega notas para ver la comparación entre materias</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recomendaciones Personalizadas */}
        <TabsContent value="recomendaciones" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Recomendaciones Personalizadas
            </h2>

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const Icon = rec.icon
                  return (
                    <Card key={index} className={`border-l-4 ${
                      rec.type === 'success' ? 'border-green-500 bg-green-50' :
                      rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Icon className={`w-6 h-6 mt-1 ${
                            rec.type === 'success' ? 'text-green-600' :
                            rec.type === 'warning' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{rec.title}</h3>
                            <p className="text-gray-700 mb-3">{rec.description}</p>
                            {rec.action && (
                              <div className={`text-sm font-medium ${
                                rec.type === 'success' ? 'text-green-700' :
                                rec.type === 'warning' ? 'text-yellow-700' :
                                'text-blue-700'
                              }`}>
                                💡 {rec.action}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Sin recomendaciones disponibles</h3>
                  <p className="text-gray-600">Agrega más notas para recibir recomendaciones personalizadas</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
