"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash, Plus, Loader2 } from "lucide-react"
import type { Activity } from "@/models/mongodb/types"
import { ObjectId } from "mongodb"

interface EvaluationPlanFormProps {
  initialActivities?: Activity[]
  onSubmit: (activities: Activity[]) => void
  isEditing?: boolean
  isSubmitting?: boolean
}

export default function EvaluationPlanForm({
  initialActivities = [],
  onSubmit,
  isEditing = false,
  isSubmitting = false,
}: EvaluationPlanFormProps) {
  const [activities, setActivities] = useState<Activity[]>(
    initialActivities.length > 0 ? initialActivities : [{ activity_id: new ObjectId(), name: "", percentage: 0 }],
  )

  const [error, setError] = useState<string | null>(null)

  const addActivity = () => {
    setActivities([...activities, { activity_id: new ObjectId(), name: "", percentage: 0 }])
  }

  const removeActivity = (index: number) => {
    if (activities.length > 1) {
      setActivities(activities.filter((_, i) => i !== index))
    }
  }

  const updateActivity = (index: number, field: keyof Activity, value: string | number) => {
    const updatedActivities = [...activities]
    updatedActivities[index] = {
      ...updatedActivities[index],
      [field]: field === "percentage" ? Number(value) : value,
    }
    setActivities(updatedActivities)
  }

  const calculateTotalPercentage = () => {
    return activities.reduce((sum, activity) => sum + activity.percentage, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que todos los campos estén completos
    const hasEmptyFields = activities.some((activity) => !activity.name || activity.percentage <= 0)
    if (hasEmptyFields) {
      setError("Todos los campos son obligatorios y los porcentajes deben ser mayores a 0")
      return
    }

    // Validar que el total sea 100%
    const total = calculateTotalPercentage()
    if (Math.abs(total - 100) > 0.01) {
      setError(`El total de porcentajes debe ser 100%. Actualmente es ${total}%`)
      return
    }

    setError(null)
    onSubmit(activities)
  }

  const totalPercentage = calculateTotalPercentage()
  const isValidTotal = Math.abs(totalPercentage - 100) <= 0.01

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Plan de Evaluación" : "Crear Plan de Evaluación"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.activity_id.toString()} className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor={`activity-${index}`}>Actividad</Label>
                <Input
                  id={`activity-${index}`}
                  value={activity.name}
                  onChange={(e) => updateActivity(index, "name", e.target.value)}
                  placeholder="Ej: Primera evaluación"
                />
              </div>
              <div className="w-24">
                <Label htmlFor={`percentage-${index}`}>Porcentaje</Label>
                <Input
                  id={`percentage-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={activity.percentage}
                  onChange={(e) => updateActivity(index, "percentage", e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeActivity(index)}
                disabled={activities.length <= 1}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <Button type="button" variant="outline" onClick={addActivity}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Actividad
            </Button>
            <div className={`font-medium ${isValidTotal ? "text-green-500" : "text-red-500"}`}>
              Total: {totalPercentage.toFixed(1)}%
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || !isValidTotal}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Actualizando..." : "Creando..."}
              </>
            ) : isEditing ? (
              "Actualizar Plan"
            ) : (
              "Crear Plan"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
