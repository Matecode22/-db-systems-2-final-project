"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function GradeTrendsPage() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [trendsData, setTrendsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Simular la carga de asignaturas desde la API
  useEffect(() => {
    // En una implementación real, esto sería una llamada a la API
    setSubjects([
      { code: "S101", name: "Psicología General" },
      { code: "S102", name: "Cálculo I" },
      { code: "S103", name: "Programación" },
      { code: "S104", name: "Estructuras de Datos" },
      { code: "S105", name: "Bases de Datos" },
    ])
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchTrendsData(selectedSubject)
    }
  }, [selectedSubject])

  const fetchTrendsData = async (subjectCode: string) => {
    setLoading(true)
    setError(null)

    try {
      // En una implementación real, esto sería una llamada a la API
      // const response = await fetch(`/api/reports/grade-trends?studentUserId=user123&subjectCode=${subjectCode}`);
      // if (!response.ok) {
      //   throw new Error("Error al obtener las tendencias de notas");
      // }
      // const data = await response.json();

      // Datos de ejemplo
      const subjectName = subjects.find((s: any) => s.code === subjectCode)?.name || ""

      const data = {
        subjectCode,
        subjectName,
        semesters: ["2022-1", "2022-2", "2023-1", "2023-2"],
        grades: [3.5, 3.8, 4.2, 4.5],
        activities: [
          { name: "Actividad 1", grades: [3.0, 3.5, 4.0, 4.5] },
          { name: "Actividad 2", grades: [3.8, 4.0, 4.2, 4.7] },
          { name: "Actividad 3", grades: [3.2, 3.6, 4.3, 4.2] },
        ],
      }

      // Transformar los datos para el gráfico
      const chartData = data.semesters.map((semester, index) => {
        const activityGrades: Record<string, number> = {}
        data.activities.forEach((activity) => {
          activityGrades[activity.name] = activity.grades[index]
        })

        return {
          semester,
          finalGrade: data.grades[index],
          ...activityGrades,
        }
      })

      setTrendsData({
        ...data,
        chartData,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tendencias de Notas</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Asignatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="subject">Asignatura</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Seleccionar asignatura" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject.code} value={subject.code}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedSubject && (
        <div className="space-y-6">
          {loading ? (
            <p>Cargando datos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : trendsData ? (
            <>
              <h2 className="text-2xl font-semibold">Tendencias de Notas: {trendsData.subjectName}</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Notas por Semestre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendsData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="finalGrade" stroke="#8884d8" name="Nota Final" strokeWidth={2} />
                        {trendsData.activities.map((activity: any, index: number) => (
                          <Line
                            key={activity.name}
                            type="monotone"
                            dataKey={activity.name}
                            stroke={`hsl(${index * 40}, 70%, 50%)`}
                            name={activity.name}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Progreso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      <span className="font-medium">Nota Inicial:</span> {trendsData.grades[0].toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Nota Actual:</span>{" "}
                      {trendsData.grades[trendsData.grades.length - 1].toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Mejora:</span>{" "}
                      {(trendsData.grades[trendsData.grades.length - 1] - trendsData.grades[0]).toFixed(2)} puntos
                    </p>
                    <p>
                      <span className="font-medium">Tendencia:</span>{" "}
                      {trendsData.grades[trendsData.grades.length - 1] > trendsData.grades[0]
                        ? "Positiva ↗️"
                        : trendsData.grades[trendsData.grades.length - 1] < trendsData.grades[0]
                          ? "Negativa ↘️"
                          : "Estable →"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
