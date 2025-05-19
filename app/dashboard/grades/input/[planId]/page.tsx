"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import GradeInputForm from "@/components/grade-input-form"
import type { GradeDetail, EvaluationPlan } from "@/models/mongodb/types"

export default function GradeInputPage({ params }: { params: { planId: string } }) {
  const router = useRouter()
  const [plan, setPlan] = useState<EvaluationPlan | null>(null)
  const [existingGrades, setExistingGrades] = useState<GradeDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Cargar el plan de evaluación y las notas existentes
  useEffect(() => {
    async function fetchData() {
      try {
        // Cargar el plan de evaluación desde MongoDB
        const planResponse = await fetch(`/api/evaluation-plans/${params.planId}`)
        if (!planResponse.ok) {
          throw new Error("Error al cargar el plan de evaluación")
        }
        const planData = await planResponse.json()
        setPlan(planData)

        // Cargar las notas existentes si las hay
        const gradesResponse = await fetch(
          `/api/student-grades?studentUserId=user123&evaluationPlanId=${params.planId}`,
        )
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json()
          if (gradesData && gradesData.grades_details) {
            setExistingGrades(gradesData.grades_details)
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.planId])

  const handleSubmitGrades = async (gradeDetails: GradeDetail[]) => {
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Guardar las notas en MongoDB
      const response = await fetch("/api/student-grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_user_id: "user123", // En una implementación real, esto vendría de la sesión
          evaluation_plan_id: params.planId,
          grades_details: gradeDetails,
          semester_ref: plan?.group_ref.semester || "",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al guardar las notas")
      }

      setSuccess("Notas guardadas correctamente")

      // Actualizar las notas existentes
      setExistingGrades(gradeDetails)

      // Esperar 2 segundos y redirigir
      setTimeout(() => {
        router.push("/dashboard/grades")
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Plan de evaluación no encontrado</h2>
              <p className="mb-6">El plan de evaluación que estás buscando no existe o ha sido eliminado.</p>
              <Link href="/dashboard/grades">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Mis Notas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/dashboard/grades">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Notas
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ingresar Notas</CardTitle>
          <CardDescription>
            {plan.plan_name} - {plan.group_ref.subject_code} - Grupo {plan.group_ref.group_number} -{" "}
            {plan.group_ref.semester}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
          )}

          <GradeInputForm
            activities={plan.activities}
            initialGrades={existingGrades}
            onSubmit={handleSubmitGrades}
            isSubmitting={submitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}
