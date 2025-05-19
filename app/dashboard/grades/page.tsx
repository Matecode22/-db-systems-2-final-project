"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function GradesPage() {
  const [semesters, setSemesters] = useState(["2023-1", "2023-2"])
  const [selectedSemester, setSelectedSemester] = useState("")
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedSemester) {
      fetchGrades(selectedSemester)
    }
  }, [selectedSemester])

  const fetchGrades = async (semester: string) => {
    setLoading(true)
    setError(null)

    try {
      // En una implementación real, esto sería una llamada a la API
      // const response = await fetch(`/api/student-grades?studentUserId=user123&semester=${semester}`);
      // if (!response.ok) {
      //   throw new Error("Error al obtener las notas");
      // }
      // const data = await response.json();

      // Datos de ejemplo
      const data = [
        {
          _id: "grade1",
          evaluation_plan_id: "plan1",
          plan_name: "Plan Oficial G1 BD",
          subject_name: "Bases de Datos",
          group_number: 1,
          grades_details: [
            { activity_name: "Primera evaluación", percentage: 10, score: 4.5 },
            { activity_name: "Segunda evaluación", percentage: 20, score: 4.0 },
            { activity_name: "Tercera evaluación", percentage: 20, score: 3.8 },
          ],
          final_grade: 4.0,
        },
        {
          _id: "grade2",
          evaluation_plan_id: "plan2",
          plan_name: "Plan Oficial G2 Programación",
          subject_name: "Programación",
          group_number: 2,
          grades_details: [
            { activity_name: "Parcial 1", percentage: 25, score: 3.5 },
            { activity_name: "Parcial 2", percentage: 25, score: 4.2 },
            { activity_name: "Proyecto Final", percentage: 50, score: 4.7 },
          ],
          final_grade: 4.3,
        },
      ]

      setGrades(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateFinalGrade = (gradeDetails: any[]) => {
    let finalGrade = 0
    let totalPercentage = 0

    gradeDetails.forEach((detail) => {
      finalGrade += (detail.score * detail.percentage) / 100
      totalPercentage += detail.percentage
    })

    if (totalPercentage === 0) return 0

    return (finalGrade * 100) / totalPercentage
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Notas</h1>

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
          <h2 className="text-2xl font-semibold">Notas del Semestre {selectedSemester}</h2>

          {loading ? (
            <p>Cargando notas...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : grades.length === 0 ? (
            <p>No hay notas registradas para este semestre.</p>
          ) : (
            <div className="space-y-8">
              {grades.map((grade: any) => (
                <Card key={grade._id}>
                  <CardHeader>
                    <CardTitle>
                      {grade.subject_name} - Grupo {grade.group_number}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-muted-foreground">{grade.plan_name}</p>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Actividad</TableHead>
                          <TableHead className="w-24">Porcentaje</TableHead>
                          <TableHead className="w-24">Nota</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grade.grades_details.map((detail: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{detail.activity_name}</TableCell>
                            <TableCell>{detail.percentage}%</TableCell>
                            <TableCell>{detail.score.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <p className="font-medium">
                        Nota Final:{" "}
                        <span className="text-lg">{calculateFinalGrade(grade.grades_details).toFixed(2)}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Calculada con base en{" "}
                        {grade.grades_details.reduce((sum: number, detail: any) => sum + detail.percentage, 0)}% del
                        curso
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
