"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, Edit, Save, X } from "lucide-react"

interface EvaluationPlan {
  _id: string
  groupId: number
  subjectName: string
  professorName: string
  semester: string
  year: number
  activities: Activity[]
}

interface Activity {
  id: string
  name: string
  percentage: number
  maxGrade: number
}

interface StudentGrade {
  _id?: string
  studentId: string
  evaluationPlanId: string
  grades: {
    activityId: string
    grade: number
    date: string
  }[]
  semester: string
  year: number
}

export default function Grades() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<EvaluationPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<EvaluationPlan | null>(null)
  const [studentGrades, setStudentGrades] = useState<StudentGrade | null>(null)
  const [editingActivity, setEditingActivity] = useState<string | null>(null)
  const [tempGrade, setTempGrade] = useState<number>(0)

  useEffect(() => {
    fetchPlans()
  }, [])

  useEffect(() => {
    if (selectedPlan) {
      fetchStudentGrades(selectedPlan._id)
    }
  }, [selectedPlan])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/evaluation-plans")
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    }
  }

  const fetchStudentGrades = async (planId: string) => {
    try {
      const response = await fetch(`/api/grades/${planId}`)
      if (response.ok) {
        const data = await response.json()
        setStudentGrades(data)
      } else {
        setStudentGrades(null)
      }
    } catch (error) {
      console.error("Error fetching grades:", error)
    }
  }

  const saveGrade = async (activityId: string, grade: number) => {
    if (!selectedPlan) return

    try {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evaluationPlanId: selectedPlan._id,
          activityId,
          grade,
          semester: selectedPlan.semester,
          year: selectedPlan.year,
        }),
      })

      if (response.ok) {
        fetchStudentGrades(selectedPlan._id)
        setEditingActivity(null)
      }
    } catch (error) {
      console.error("Error saving grade:", error)
    }
  }

  const getActivityGrade = (activityId: string): number => {
    if (!studentGrades) return 0
    const gradeEntry = studentGrades.grades.find((g) => g.activityId === activityId)
    return gradeEntry ? gradeEntry.grade : 0
  }

  const calculateCurrentGrade = (): number => {
    if (!selectedPlan || !studentGrades) return 0

    let totalWeightedGrade = 0
    let totalWeight = 0

    selectedPlan.activities.forEach((activity) => {
      const grade = getActivityGrade(activity.id)
      if (grade > 0) {
        totalWeightedGrade += (grade / activity.maxGrade) * activity.percentage
        totalWeight += activity.percentage
      }
    })

    return totalWeight > 0 ? (totalWeightedGrade / totalWeight) * 100 : 0
  }

  const calculateProjectedGrade = (): number => {
    if (!selectedPlan) return 0

    let totalWeightedGrade = 0

    selectedPlan.activities.forEach((activity) => {
      const grade = getActivityGrade(activity.id)
      if (grade > 0) {
        totalWeightedGrade += (grade / activity.maxGrade) * activity.percentage
      }
    })

    return totalWeightedGrade
  }

  const getRequiredGradeForTarget = (targetGrade: number): { activityId: string; requiredGrade: number }[] => {
    if (!selectedPlan) return []

    const currentWeightedGrade = calculateProjectedGrade()
    const remainingActivities = selectedPlan.activities.filter((activity) => getActivityGrade(activity.id) === 0)
    const remainingWeight = remainingActivities.reduce((sum, activity) => sum + activity.percentage, 0)

    if (remainingWeight === 0) return []

    const requiredWeightedGrade = targetGrade - currentWeightedGrade

    return remainingActivities.map((activity) => ({
      activityId: activity.id,
      requiredGrade: Math.min(
        activity.maxGrade,
        Math.max(
          0,
          (((requiredWeightedGrade * activity.percentage) / remainingWeight) * activity.maxGrade) / activity.percentage,
        ),
      ),
    }))
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Notas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de Materia */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Materia</CardTitle>
            <CardDescription>Elige la materia para gestionar tus notas</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={(value) => {
                const plan = plans.find((p) => p._id === value)
                setSelectedPlan(plan || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una materia" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan._id} value={plan._id}>
                    {plan.subjectName} - {plan.semester} {plan.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Resumen de Notas */}
        {selectedPlan && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Nota Actual</Label>
                  <div className="text-2xl font-bold text-blue-600">{calculateCurrentGrade().toFixed(1)}%</div>
                  <Progress value={calculateCurrentGrade()} className="mt-2" />
                </div>

                <div>
                  <Label>Nota Proyectada</Label>
                  <div className="text-xl font-semibold">{calculateProjectedGrade().toFixed(1)}%</div>
                </div>

                <div className="border-t pt-4">
                  <Label>Para obtener 70%:</Label>
                  <div className="text-sm space-y-1">
                    {getRequiredGradeForTarget(70).map((req) => {
                      const activity = selectedPlan.activities.find((a) => a.id === req.activityId)
                      return (
                        <div key={req.activityId}>
                          {activity?.name}: {req.requiredGrade.toFixed(1)}/{activity?.maxGrade}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actividades */}
        {selectedPlan && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedPlan.subjectName}</CardTitle>
              <CardDescription>
                {selectedPlan.professorName} | {selectedPlan.semester} {selectedPlan.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedPlan.activities.map((activity) => {
                  const currentGrade = getActivityGrade(activity.id)
                  const isEditing = editingActivity === activity.id

                  return (
                    <div key={activity.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-sm text-gray-500">
                            {activity.percentage}% | Max: {activity.maxGrade}
                          </div>
                        </div>
                        <Badge variant={currentGrade > 0 ? "default" : "secondary"}>
                          {currentGrade > 0 ? `${currentGrade}/${activity.maxGrade}` : "Sin nota"}
                        </Badge>
                      </div>

                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={activity.maxGrade}
                            step="0.1"
                            value={tempGrade}
                            onChange={(e) => setTempGrade(Number(e.target.value))}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={() => saveGrade(activity.id, tempGrade)}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingActivity(null)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingActivity(activity.id)
                            setTempGrade(currentGrade)
                          }}
                          className="w-full"
                        >
                          <Edit className="w-3 h-3 mr-2" />
                          {currentGrade > 0 ? "Editar Nota" : "Agregar Nota"}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
