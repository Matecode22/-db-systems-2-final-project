"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Comment, EvaluationPlan } from "@/models/mongodb/types"

export default function CommentsPage({ params }: { params: { id: string } }) {
  const [plan, setPlan] = useState<EvaluationPlan | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar el plan de evaluación y los comentarios
  useEffect(() => {
    async function fetchData() {
      try {
        // Cargar el plan de evaluación
        const planResponse = await fetch(`/api/evaluation-plans/${params.id}`)
        if (!planResponse.ok) {
          throw new Error("Error al cargar el plan de evaluación")
        }
        const planData = await planResponse.json()
        setPlan(planData)

        // Cargar los comentarios
        const commentsResponse = await fetch(`/api/comments?evaluationPlanId=${params.id}`)
        if (!commentsResponse.ok) {
          throw new Error("Error al cargar los comentarios")
        }
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evaluation_plan_id: params.id,
          commenter_user_id: "user123", // En una implementación real, esto vendría de la sesión
          text: newComment,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al publicar el comentario")
      }

      const data = await response.json()

      // Agregar el nuevo comentario a la lista
      const newCommentObj: Comment = {
        _id: data.id,
        evaluation_plan_id: params.id,
        commenter_user_id: "user123",
        text: newComment,
        created_at: new Date(),
        commenter_name: "Usuario Actual", // En una implementación real, esto vendría de la sesión
      }

      setComments([...comments, newCommentObj])
      setNewComment("")
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
              <Link href="/dashboard/evaluation-plans">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Planes de Evaluación
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
        <Link href="/dashboard/evaluation-plans">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Planes de Evaluación
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Comentarios</CardTitle>
          <CardDescription>
            {plan.plan_name} - {plan.group_ref.subject_code} - Grupo {plan.group_ref.group_number} -{" "}
            {plan.group_ref.semester}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          <div className="space-y-6 mb-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay comentarios aún. Sé el primero en comentar.
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id?.toString()} className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>{comment.commenter_name ? comment.commenter_name.charAt(0) : "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{comment.commenter_name || "Usuario"}</p>
                        <p className="text-sm text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="mt-2">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitComment} disabled={!newComment.trim() || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publicar Comentario
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
