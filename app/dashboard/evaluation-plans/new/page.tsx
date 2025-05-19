"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import EvaluationPlanForm from "@/components/evaluation-plan-form"
import type { Activity } from "@/models/mongodb/types"

export default function NewEvaluationPlanPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [planName, setPlanName] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar asignaturas desde PostgreSQL (Supabase)
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch("/api/subjects")
        if (!response.ok) {
          throw new Error("Error al cargar las asignaturas")
        }
        const data = await response.json()
        setSubjects(data)
      } catch (err: any) {
        console.error("Error fetching subjects:", err)
        setError(err.message)
      } finally {
        setFetchingData(false)
      }
    }

    fetchSubjects()
  }, [])

  // Cargar grupos cuando se selecciona una asignatura
  useEffect(() => {
    if (selectedSubject) {
      async function fetchGroups() {
        setFetchingData(true)
        try {
          const response = await fetch(`/api/groups?subjectCode=${selectedSubject}`)
          if (!response.ok) {
            throw new Error("Error al cargar los grupos")
          }
          const data = await response.json()
          setGroups(data)
        } catch (err: any) {
          console.error("Error fetching groups:", err)
          setError(err.message)
        } finally {
          setFetchingData(false)
        }
      }

      fetchGroups()
    } else {
      setGroups([])
    }
  }, [selectedSubject])

  const handleSubmitPlan = async (activities: Activity[]) => {
    if (!selectedSubject || !selectedGroup || !planName) {
      setError("Debes seleccionar una asignatura, un grupo y proporcionar un nombre para el plan")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Extraer los datos del grupo seleccionado
      const [groupNumber, semester, professorId] = selectedGroup.split("|")

      // Crear el plan de evaluación en MongoDB
      const response = await fetch("/api/evaluation-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creator_user_id: "user123", // En una implementación real, esto vendría de la sesión
          group_ref: {
            subject_code: selectedSubject,
            group_number: Number.parseInt(groupNumber),
            semester: semester,
          },
          professor_id_ref: professorId,
          plan_name: planName,
          activities: activities,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al crear el plan de evaluación")
      }

      const data = await response.json()

      // Redirigir a la página de detalles del plan
      router.push(`/dashboard/evaluation-plans/${data.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Plan de Evaluación</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Seleccionar Curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fetchingData ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subject">Asignatura</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Seleccionar asignatura" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.code} value={subject.code}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group">Grupo</Label>
                  <Select
                    value={selectedGroup}
                    onValueChange={setSelectedGroup}
                    disabled={!selectedSubject || groups.length === 0}
                  >
                    <SelectTrigger id="group">
                      <SelectValue
                        placeholder={groups.length === 0 ? "No hay grupos disponibles" : "Seleccionar grupo"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem
                          key={`${group.number}|${group.semester}|${group.professor_id}`}
                          value={`${group.number}|${group.semester}|${group.professor_id}`}
                        >
                          Grupo {group.number} - {group.semester} - {group.professor_name || group.professor_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-name">Nombre del Plan</Label>
                  <Input
                    id="plan-name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ej: Plan Oficial G1 BD"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <EvaluationPlanForm onSubmit={handleSubmitPlan} isSubmitting={loading} />
        </div>
      </div>
    </div>
  )
}
