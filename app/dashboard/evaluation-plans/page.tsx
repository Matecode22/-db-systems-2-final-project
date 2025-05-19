"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Edit, Trash2, MessageSquare, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { EvaluationPlan } from "@/models/mongodb/types"

export default function EvaluationPlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<EvaluationPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Cargar los planes de evaluación
  useEffect(() => {
    async function fetchPlans() {
      try {
        // En una implementación real, esto cargaría todos los planes del usuario actual
        const response = await fetch("/api/evaluation-plans?userId=user123")
        if (!response.ok) {
          throw new Error("Error al cargar los planes de evaluación")
        }
        const data = await response.json()
        setPlans(data)
      } catch (err: any) {
        console.error("Error fetching plans:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleDeleteClick = (planId: string) => {
    setPlanToDelete(planId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!planToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/evaluation-plans/${planToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el plan de evaluación")
      }

      // Actualizar la lista de planes
      setPlans(plans.filter((plan) => plan._id?.toString() !== planToDelete))
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    } catch (err: any) {
      console.error("Error deleting plan:", err)
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Planes de Evaluación</h1>
        <Link href="/dashboard/evaluation-plans/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear Plan
          </Button>
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No tienes planes de evaluación</h2>
              <p className="mb-6">Crea tu primer plan de evaluación para comenzar a gestionar tus notas.</p>
              <Link href="/dashboard/evaluation-plans/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Plan de Evaluación
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Planes de Evaluación</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Plan</TableHead>
                  <TableHead>Asignatura</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Actividades</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan._id?.toString()}>
                    <TableCell className="font-medium">{plan.plan_name}</TableCell>
                    <TableCell>{plan.group_ref.subject_code}</TableCell>
                    <TableCell>{plan.group_ref.group_number}</TableCell>
                    <TableCell>{plan.group_ref.semester}</TableCell>
                    <TableCell>{plan.activities.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/dashboard/grades/input/${plan._id}`)}
                          title="Ingresar Notas"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/dashboard/evaluation-plans/${plan._id}/edit`)}
                          title="Editar Plan"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/dashboard/evaluation-plans/${plan._id}/comments`)}
                          title="Ver Comentarios"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(plan._id?.toString() || "")}
                          title="Eliminar Plan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el plan de evaluación y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
