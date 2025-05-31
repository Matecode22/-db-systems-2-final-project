"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calculator, Target, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GradeEntry {
  id: string
  name: string
  grade: number
  weight: number
}

export default function GradeCalculator() {
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [newGrade, setNewGrade] = useState({ name: "", grade: 0, weight: 0 })
  const [targetGrade, setTargetGrade] = useState(3.0)

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedGrades = localStorage.getItem("calculator-grades")
    if (savedGrades) {
      try {
        setGrades(JSON.parse(savedGrades))
      } catch (error) {
        console.error("Error loading saved grades:", error)
      }
    }
  }, [])

  // Guardar en localStorage cuando cambien las notas
  useEffect(() => {
    localStorage.setItem("calculator-grades", JSON.stringify(grades))
  }, [grades])

  const addGrade = () => {
    if (newGrade.name && newGrade.grade >= 0 && newGrade.weight > 0) {
      const grade: GradeEntry = {
        id: Date.now().toString(),
        name: newGrade.name,
        grade: newGrade.grade,
        weight: newGrade.weight,
      }
      setGrades([...grades, grade])
      setNewGrade({ name: "", grade: 0, weight: 0 })
    }
  }

  const removeGrade = (id: string) => {
    setGrades(grades.filter((grade) => grade.id !== id))
  }

  const updateGrade = (id: string, field: string, value: any) => {
    setGrades(prev => 
      prev.map(grade => 
        grade.id === id 
          ? { ...grade, [field]: value }
          : grade
      )
    )
  }

  const calculateWeightedAverage = (): number => {
    if (grades.length === 0) return 0

    let totalWeightedGrade = 0
    let totalWeight = 0

    grades.forEach((grade) => {
      totalWeightedGrade += grade.grade * grade.weight
      totalWeight += grade.weight
    })

    return totalWeight > 0 ? totalWeightedGrade / totalWeight : 0
  }

  const getTotalWeight = (): number => {
    return grades.reduce((total, grade) => total + grade.weight, 0)
  }

  const calculateRequiredGradeForTarget = (): { requiredGrade: number; remainingWeight: number } => {
    const currentWeightedSum = grades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0)
    const currentWeight = getTotalWeight()
    const remainingWeight = 100 - currentWeight

    if (remainingWeight <= 0) {
      return { requiredGrade: 0, remainingWeight: 0 }
    }

    const requiredWeightedSum = (targetGrade * 100) - currentWeightedSum
    const requiredGrade = requiredWeightedSum / remainingWeight

    return { requiredGrade: Math.max(0, requiredGrade), remainingWeight }
  }

  const clearAll = () => {
    setGrades([])
  }

  const calculateSampleScenarios = () => {
    const scenarios = [
      { name: "Aprobado mínimo", target: 3.0 },
      { name: "Buena nota", target: 3.5 },
      { name: "Excelente", target: 4.0 },
      { name: "Sobresaliente", target: 4.5 },
    ]

    return scenarios.map(scenario => {
      const currentWeightedSum = grades.reduce((sum, grade) => sum + (grade.grade * grade.weight), 0)
      const currentWeight = getTotalWeight()
      const remainingWeight = 100 - currentWeight

      if (remainingWeight <= 0) {
        return { ...scenario, requiredGrade: "N/A", feasible: false }
      }

      const requiredWeightedSum = (scenario.target * 100) - currentWeightedSum
      const requiredGrade = requiredWeightedSum / remainingWeight

      return {
        ...scenario,
        requiredGrade: Math.max(0, requiredGrade).toFixed(2),
        feasible: requiredGrade <= 5.0 && requiredGrade >= 0
      }
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Calculadora de Notas</h1>
        <p className="text-xl text-gray-600">Calcula tu promedio ponderado y planifica tus objetivos académicos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de entrada de notas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Agregar Nota
              </CardTitle>
              <CardDescription>Ingresa el nombre, la nota (0-5) y el peso porcentual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre de la actividad</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Parcial 1, Quiz 2, Proyecto..."
                    value={newGrade.name}
                    onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">Nota (0-5)</Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={newGrade.grade || ""}
                      onChange={(e) => setNewGrade({ ...newGrade, grade: Number(e.target.value) })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">Peso (%)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      max="100"
                      value={newGrade.weight || ""}
                      onChange={(e) => setNewGrade({ ...newGrade, weight: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <Button onClick={addGrade} className="w-full" disabled={!newGrade.name || newGrade.grade < 0 || newGrade.weight <= 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Nota
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de notas */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notas Ingresadas</CardTitle>
                  <CardDescription>{grades.length} notas • Peso total: {getTotalWeight()}%</CardDescription>
                </div>
                {grades.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Limpiar Todo
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay notas ingresadas</p>
                  <p className="text-sm">Agrega tu primera nota para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grades.map((grade) => (
                    <div key={grade.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <Input
                          value={grade.name}
                          onChange={(e) => updateGrade(grade.id, "name", e.target.value)}
                          className="font-medium"
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={grade.grade}
                          onChange={(e) => updateGrade(grade.id, "grade", Number(e.target.value))}
                        />
                      </div>
                      <div className="w-16">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={grade.weight}
                          onChange={(e) => updateGrade(grade.id, "weight", Number(e.target.value))}
                        />
                      </div>
                      <Badge variant="outline">{grade.weight}%</Badge>
                      <Button size="sm" variant="destructive" onClick={() => removeGrade(grade.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de resultados */}
        <div className="space-y-6">
          {/* Promedio actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Promedio Ponderado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {calculateWeightedAverage().toFixed(2)}
                </div>
                <p className="text-gray-600">
                  {grades.length > 0 ? `Basado en ${grades.length} nota${grades.length > 1 ? 's' : ''}` : 'Sin notas'}
                </p>
                {getTotalWeight() !== 100 && getTotalWeight() > 0 && (
                  <Alert className="mt-4 border-amber-500 bg-amber-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-amber-700">
                      El peso total es {getTotalWeight()}%. Para un cálculo completo, debería ser 100%.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meta personalizada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Meta Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="target">Meta deseada (0-5)</Label>
                  <Input
                    id="target"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(Number(e.target.value))}
                  />
                </div>

                {grades.length > 0 && getTotalWeight() < 100 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-800 mb-2">
                      Para alcanzar {targetGrade.toFixed(1)}:
                    </p>
                    <p className="text-blue-700">
                      Necesitas un promedio de{" "}
                      <span className="font-bold text-xl">
                        {calculateRequiredGradeForTarget().requiredGrade.toFixed(2)}
                      </span>{" "}
                      en el {calculateRequiredGradeForTarget().remainingWeight}% restante
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Escenarios */}
          {grades.length > 0 && getTotalWeight() < 100 && (
            <Card>
              <CardHeader>
                <CardTitle>Escenarios de Nota</CardTitle>
                <CardDescription>¿Qué necesitas para diferentes objetivos?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculateSampleScenarios().map((scenario, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <span className="font-medium">{scenario.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({scenario.target.toFixed(1)})</span>
                      </div>
                      <div className={`font-semibold ${scenario.feasible ? 'text-green-600' : 'text-red-600'}`}>
                        {scenario.feasible ? scenario.requiredGrade : 'No factible'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 