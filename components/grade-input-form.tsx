"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calculator } from "lucide-react"
import type { Activity, GradeDetail } from "@/models/mongodb/types"

interface GradeInputFormProps {
  activities: Activity[]
  initialGrades?: GradeDetail[]
  onSubmit: (grades: GradeDetail[]) => void
  isSubmitting?: boolean
}

export default function GradeInputForm({
  activities,
  initialGrades = [],
  onSubmit,
  isSubmitting = false,
}: GradeInputFormProps) {
  const [grades, setGrades] = useState<Record<string, number>>({})
  const [calculatedGrade, setCalculatedGrade] = useState<number | null>(null)

  useEffect(() => {
    // Inicializar el estado con las notas existentes
    if (initialGrades.length > 0) {
      const gradesMap: Record<string, number> = {}
      initialGrades.forEach((grade) => {
        gradesMap[grade.activity_id.toString()] = grade.score
      })
      setGrades(gradesMap)
    }
  }, [initialGrades])

  const handleGradeChange = (activityId: string, value: string) => {
    const numValue = value === "" ? 0 : Number.parseFloat(value)
    setGrades({
      ...grades,
      [activityId]: numValue,
    })
  }

  const calculateFinalGrade = () => {
    let finalGrade = 0
    let totalPercentageWithGrades = 0

    activities.forEach((activity) => {
      const activityId = activity.activity_id.toString()
      if (grades[activityId] !== undefined && grades[activityId] > 0) {
        finalGrade += (grades[activityId] * activity.percentage) / 100
        totalPercentageWithGrades += activity.percentage
      }
    })

    // Si no hay notas ingresadas, mostrar 0
    if (totalPercentageWithGrades === 0) {
      return 0
    }

    // Ajustar la nota final según el porcentaje total de las actividades con notas
    return (finalGrade * 100) / totalPercentageWithGrades
  }

  const handleCalculate = () => {
    setCalculatedGrade(calculateFinalGrade())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const gradeDetails: GradeDetail[] = activities.map((activity) => {
      const activityId = activity.activity_id.toString()
      return {
        activity_id: activity.activity_id,
        activity_name: activity.name,
        score: grades[activityId] || 0,
      }
    })

    onSubmit(gradeDetails)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ingresar Notas</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.activity_id.toString()} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-7">
                <span>{activity.name}</span>
              </div>
              <div className="col-span-3">
                <span className="text-muted-foreground">{activity.percentage}%</span>
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={grades[activity.activity_id.toString()] || ""}
                  onChange={(e) => handleGradeChange(activity.activity_id.toString(), e.target.value)}
                  placeholder="0.0"
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={handleCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Nota Actual
          </Button>

          {calculatedGrade !== null && (
            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">
                Nota Calculada: <span className="text-lg">{calculatedGrade.toFixed(2)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Esta nota está calculada basada en las actividades que ya tienen calificación.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Notas"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
