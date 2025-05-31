"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, MessageCircle, Database, AlertCircle, Bug, Edit, Save, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BookOpen } from "lucide-react"

interface EvaluationPlan {
  _id: string
  groupId: number
  subjectName: string
  professorName: string
  semester: string
  year: number
  activities: Activity[]
  createdBy: string
  createdAt: string
  comments: Comment[]
}

interface Activity {
  id: string
  name: string
  percentage: number
  maxGrade: number
}

interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  date: string
}

interface Group {
  id: number
  subject_id: number
  group_number: string
  semester: string
  year: number
  employee_id: number
  campus_id: number
  subject_name?: string
  subject_code?: string
  professor_name?: string
  campus_name?: string
  _original?: any
  _columns?: string[]
}

interface GroupsResponse {
  success: boolean
  groups: Group[]
  metadata: {
    totalGroups: number
    availableColumns: string[]
    columnMapping: any
    tablesAccessed: any
  }
}

export default function EvaluationPlans() {
  const { data: session } = useSession()
  const [plans, setPlans] = useState<EvaluationPlan[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [groupsMetadata, setGroupsMetadata] = useState<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [newActivity, setNewActivity] = useState({ name: "", percentage: 0, maxGrade: 5 })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<EvaluationPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estados para edición
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editingActivities, setEditingActivities] = useState<Activity[]>([])
  const [editingActivity, setEditingActivity] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
    fetchGroups()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/evaluation-plans")
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      } else {
        const errorData = await response.json()
        setError(`Error cargando planes: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
      setError("Error de conexión al cargar planes")
    }
  }

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/groups")
      const data = await response.json()

      if (response.ok && data.success) {
        setGroups(data.groups)
        setGroupsMetadata(data.metadata)
        console.log("Groups loaded successfully:", data.metadata)
      } else {
        setError(`Error cargando grupos: ${data.error}`)
        console.error("Groups API error:", data)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
      setError("Error de conexión al cargar grupos de Supabase")
    } finally {
      setLoading(false)
    }
  }

  const addActivity = () => {
    if (newActivity.name && newActivity.percentage > 0) {
      const activity: Activity = {
        id: Date.now().toString(),
        name: newActivity.name,
        percentage: newActivity.percentage,
        maxGrade: newActivity.maxGrade,
      }
      setActivities([...activities, activity])
      setNewActivity({ name: "", percentage: 0, maxGrade: 5 })
    }
  }

  const removeActivity = (id: string) => {
    setActivities(activities.filter((activity) => activity.id !== id))
  }

  const getTotalPercentage = () => {
    return activities.reduce((total, activity) => total + activity.percentage, 0)
  }

  const createPlan = async () => {
    if (!selectedGroup || activities.length === 0 || getTotalPercentage() !== 100) {
      alert("Por favor completa todos los campos y asegúrate de que el porcentaje total sea 100%")
      return
    }

    try {
      const response = await fetch("/api/evaluation-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          subjectName: selectedGroup.subject_name,
          professorName: selectedGroup.professor_name,
          semester: selectedGroup.semester,
          year: selectedGroup.year,
          activities,
        }),
      })

      if (response.ok) {
        fetchPlans()
        setActivities([])
        setSelectedGroup(null)
        setIsCreateDialogOpen(false)
      } else {
        const errorData = await response.json()
        alert(`Error creando plan: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error creating plan:", error)
      alert("Error de conexión al crear plan")
    }
  }

  const addComment = async (planId: string) => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/evaluation-plans/${planId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: newComment,
        }),
      })

      if (response.ok) {
        fetchPlans()
        setNewComment("")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const updatePlan = async (planId: string, updatedActivities: Activity[]) => {
    try {
      const response = await fetch(`/api/evaluation-plans/${planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activities: updatedActivities,
        }),
      })

      if (response.ok) {
        await fetchPlans()
        setEditingPlan(null)
        setEditingActivities([])
        setError("")
      } else {
        const errorData = await response.json()
        setError(`Error actualizando plan: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error updating plan:", error)
      setError("Error de conexión al actualizar plan")
    }
  }

  const deletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/evaluation-plans/${planId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchPlans()
        setError("")
      } else {
        const errorData = await response.json()
        setError(`Error eliminando plan: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
      setError("Error de conexión al eliminar plan")
    }
  }

  const startEditingPlan = (plan: EvaluationPlan) => {
    setEditingPlan(plan._id)
    setEditingActivities([...plan.activities])
  }

  const cancelEditingPlan = () => {
    setEditingPlan(null)
    setEditingActivities([])
    setEditingActivity(null)
  }

  const saveEditingPlan = () => {
    if (editingPlan && editingActivities.length > 0) {
      const totalPercentage = editingActivities.reduce((sum, activity) => sum + activity.percentage, 0)
      if (totalPercentage !== 100) {
        setError("La suma de porcentajes debe ser exactamente 100%")
        return
      }
      updatePlan(editingPlan, editingActivities)
    }
  }

  const updateEditingActivity = (activityId: string, field: string, value: any) => {
    setEditingActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, [field]: value }
          : activity
      )
    )
  }

  const removeEditingActivity = (activityId: string) => {
    setEditingActivities(prev => prev.filter(activity => activity.id !== activityId))
  }

  const addEditingActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: "Nueva actividad",
      percentage: 0,
      maxGrade: 5,
    }
    setEditingActivities(prev => [...prev, newActivity])
  }

  const getEditingTotalPercentage = () => {
    return editingActivities.reduce((total, activity) => total + activity.percentage, 0)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Database className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Cargando datos de Supabase...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Planes de Evaluación</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/supabase-debug", "_blank")}>
            <Bug className="w-4 h-4 mr-2" />
            Debug DB
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Plan de Evaluación</DialogTitle>
                <DialogDescription>Define las actividades y porcentajes para una materia</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="group">Seleccionar Grupo</Label>
                  <Select
                    onValueChange={(value) => {
                      const group = groups.find((g) => g.id.toString() === value)
                      setSelectedGroup(group || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.length > 0 ? (
                        groups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {group.subject_name} ({group.subject_code})
                              </span>
                              <span className="text-sm text-gray-500">
                                Grupo {group.group_number} - Prof. {group.professor_name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {group.semester} {group.year} - {group.campus_name}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-groups" disabled>
                          No hay grupos disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {groups.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Cargando grupos desde Supabase... ({groups.length} encontrados)
                    </p>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Actividades de Evaluación</h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                    <Input
                      placeholder="Nombre de la actividad"
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Porcentaje"
                      value={newActivity.percentage || ""}
                      onChange={(e) => setNewActivity({ ...newActivity, percentage: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="Nota máxima"
                      value={newActivity.maxGrade}
                      onChange={(e) => setNewActivity({ ...newActivity, maxGrade: Number(e.target.value) })}
                    />
                    <Button onClick={addActivity}>Agregar</Button>
                  </div>

                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{activity.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{activity.percentage}%</Badge>
                          <Badge variant="outline">Max: {activity.maxGrade}</Badge>
                          <Button size="sm" variant="destructive" onClick={() => removeActivity(activity.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <span className="font-semibold">
                      Total: {getTotalPercentage()}%
                      {getTotalPercentage() !== 100 && <span className="text-red-500 ml-2">(Debe ser 100%)</span>}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={createPlan}
                  className="w-full"
                  disabled={getTotalPercentage() !== 100 || activities.length === 0}
                >
                  Crear Plan de Evaluación
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {groupsMetadata && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <Database className="h-4 w-4" />
          <AlertDescription className="text-green-700">
            ✅ Conectado a Supabase - {groupsMetadata.totalGroups} grupos disponibles
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer">Ver detalles técnicos</summary>
              <div className="mt-1 bg-white p-2 rounded text-gray-600">
                <div>Columnas detectadas: {groupsMetadata.availableColumns?.join(", ")}</div>
                <div>
                  Tablas accesibles:{" "}
                  {Object.entries(groupsMetadata.tablesAccessed || {})
                    .filter(([, accessible]) => accessible)
                    .map(([table]) => table)
                    .join(", ")}
                </div>
              </div>
            </details>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.subjectName}</CardTitle>
                  <CardDescription>
                    Profesor: {plan.professorName} | {plan.semester} {plan.year}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {editingPlan === plan._id ? (
                    <>
                      <Button size="sm" onClick={saveEditingPlan} disabled={getEditingTotalPercentage() !== 100}>
                        <Save className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditingPlan}>
                        <X className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEditingPlan(plan)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar plan de evaluación?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el plan de evaluación de {plan.subjectName}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePlan(plan._id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {editingPlan === plan._id ? (
                  // Modo edición
                  <>
                    {editingActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-2 p-2 border rounded">
                        <Input
                          value={activity.name}
                          onChange={(e) => updateEditingActivity(activity.id, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={activity.percentage}
                          onChange={(e) => updateEditingActivity(activity.id, "percentage", Number(e.target.value))}
                          className="w-20"
                          min="0"
                          max="100"
                        />
                        <span className="text-sm text-gray-500">%</span>
                        <Input
                          type="number"
                          value={activity.maxGrade}
                          onChange={(e) => updateEditingActivity(activity.id, "maxGrade", Number(e.target.value))}
                          className="w-20"
                          min="1"
                          max="10"
                        />
                        <Button size="sm" variant="destructive" onClick={() => removeEditingActivity(activity.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={addEditingActivity}>
                        <Plus className="w-3 h-3 mr-1" />
                        Agregar Actividad
                      </Button>
                    </div>
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <span className="font-semibold">
                        Total: {getEditingTotalPercentage()}%
                        {getEditingTotalPercentage() !== 100 && (
                          <span className="text-red-500 ml-2">(Debe ser 100%)</span>
                        )}
                      </span>
                    </div>
                  </>
                ) : (
                  // Modo visualización
                  plan.activities.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center p-2 border rounded">
                      <span>{activity.name}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{activity.percentage}%</Badge>
                        <Badge variant="outline">Max: {activity.maxGrade}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sección de comentarios - solo mostrar si no está en modo edición */}
              {editingPlan !== plan._id && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comentarios ({plan.comments.length})
                  </h4>

                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                    {plan.comments.map((comment) => (
                      <div key={comment.id} className="text-sm p-2 bg-gray-50 rounded">
                        <div className="font-medium">{comment.userName}</div>
                        <div>{comment.text}</div>
                        <div className="text-xs text-gray-500">{new Date(comment.date).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar comentario..."
                      value={selectedPlan?._id === plan._id ? newComment : ""}
                      onChange={(e) => {
                        setNewComment(e.target.value)
                        setSelectedPlan(plan)
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addComment(plan._id)
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => addComment(plan._id)} disabled={!newComment.trim()}>
                      Enviar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No hay planes de evaluación</h3>
            <p className="text-gray-600 mb-4">Crea tu primer plan de evaluación seleccionando una materia</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
