"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/ui.button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui.card"
import { Input } from "@/components/ui/ui.input"
import { Label } from "@/components/ui/ui.label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui.select"
import { Checkbox } from "@/components/ui/ui.checkbox"
import { Alert, AlertDescription } from "@/components/ui/ui.alert"
import { useToast } from "@/hooks/hooks.use-toast"
import { Loader2, AlertTriangle, Home, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

/*
Folder Structure:
/ (root)
 ├─ app/
 │   ├─ page.tsx
 │   └─ api/evaluate/route.ts
 ├─ lib/engine.ts
 ├─ lib/rules.json
 ├─ types.ts
 ├─ README.md
*/

interface FormData {
  foundationType: "slab" | "elevated slab" | "pier" | "amphibious" | ""
  siteElevation: number
  baseFloodElevation: number
  roofMaterial: "metal" | "asphalt" | "tile" | ""
  floodVents: boolean
  breakawayWalls: boolean
  utilitiesProtected: boolean
  floodZone: "A" | "AE" | "V" | "X" | ""
  yearBuilt: number
}

interface EvaluationResult {
  score: number
  performance: Array<{ year: number; resilience: number }>
  recs: string[]
  cost: string
}

export default function ClimateAdaptiveArchitectureTool() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [formData, setFormData] = useState<FormData>({
    foundationType: "",
    siteElevation: 0,
    baseFloodElevation: 0,
    roofMaterial: "",
    floodVents: false,
    breakawayWalls: false,
    utilitiesProtected: false,
    floodZone: "",
    yearBuilt: new Date().getFullYear(),
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (formData.siteElevation < 0) {
      errors.push("Site elevation must be 0 or greater")
    }

    if (formData.baseFloodElevation < 0) {
      errors.push("Base flood elevation must be 0 or greater")
    }

    if (formData.siteElevation < formData.baseFloodElevation) {
      errors.push("Warning: Site elevation is below Base Flood Elevation - high flood risk!")
    }

    if (!formData.foundationType) {
      errors.push("Foundation type is required")
    }

    if (!formData.roofMaterial) {
      errors.push("Roof material is required")
    }

    if (!formData.floodZone) {
      errors.push("Flood zone is required")
    }

    setValidationErrors(errors)
    return errors.length === 0 || (errors.length === 1 && errors[0].includes("Warning"))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to evaluate architecture")
      }

      const data: EvaluationResult = await response.json()
      setResult(data)

      toast({
        title: "Evaluation Complete",
        description: `Resilience score: ${data.score}/100`,
      })
    } catch (error) {
      toast({
        title: "Evaluation Failed",
        description: "Unable to evaluate architecture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setValidationErrors([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Climate-Adaptive Architecture Tool</h1>
            </div>
            <p className="text-lg text-gray-600">Evaluate your building's resilience to climate change and flooding</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>Building Assessment</CardTitle>
                <CardDescription>Enter your building details to get a resilience evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Foundation Type */}
                  <div className="space-y-2">
                    <Label htmlFor="foundation">Foundation Type</Label>
                    <Select
                      value={formData.foundationType}
                      onValueChange={(value) => updateFormData("foundationType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select foundation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slab">Slab</SelectItem>
                        <SelectItem value="elevated slab">Elevated Slab</SelectItem>
                        <SelectItem value="pier">Pier</SelectItem>
                        <SelectItem value="amphibious">Amphibious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Elevations */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteElevation">Site Elevation (ft)</Label>
                      <Input
                        id="siteElevation"
                        type="number"
                        value={formData.siteElevation}
                        onChange={(e) => updateFormData("siteElevation", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bfe">Base Flood Elevation (ft)</Label>
                      <Input
                        id="bfe"
                        type="number"
                        value={formData.baseFloodElevation}
                        onChange={(e) => updateFormData("baseFloodElevation", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Roof Material */}
                  <div className="space-y-2">
                    <Label htmlFor="roof">Roof Material</Label>
                    <Select
                      value={formData.roofMaterial}
                      onValueChange={(value) => updateFormData("roofMaterial", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="asphalt">Asphalt</SelectItem>
                        <SelectItem value="tile">Tile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="floodVents"
                        checked={formData.floodVents}
                        onCheckedChange={(checked) => updateFormData("floodVents", checked)}
                      />
                      <Label htmlFor="floodVents">Flood Vents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="breakawayWalls"
                        checked={formData.breakawayWalls}
                        onCheckedChange={(checked) => updateFormData("breakawayWalls", checked)}
                      />
                      <Label htmlFor="breakawayWalls">Breakaway Walls</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="utilitiesProtected"
                        checked={formData.utilitiesProtected}
                        onCheckedChange={(checked) => updateFormData("utilitiesProtected", checked)}
                      />
                      <Label htmlFor="utilitiesProtected">Utilities Protected</Label>
                    </div>
                  </div>

                  {/* Flood Zone and Year */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floodZone">Flood Zone</Label>
                      <Select value={formData.floodZone} onValueChange={(value) => updateFormData("floodZone", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select flood zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="AE">AE</SelectItem>
                          <SelectItem value="V">V</SelectItem>
                          <SelectItem value="X">X</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearBuilt">Year Built</Label>
                      <Input
                        id="yearBuilt"
                        type="number"
                        value={formData.yearBuilt}
                        onChange={(e) =>
                          updateFormData("yearBuilt", Number.parseInt(e.target.value) || new Date().getFullYear())
                        }
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="space-y-2">
                      {validationErrors.map((error, index) => (
                        <Alert key={index} variant={error.includes("Warning") ? "default" : "destructive"}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      "Evaluate Architecture"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
              <div className="space-y-6">
                {/* Resilience Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Resilience Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-6xl font-bold text-blue-600 mb-2">{result.score}</div>
                      <div className="text-lg text-gray-600">out of 100</div>
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${result.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Over Time</CardTitle>
                    <CardDescription>Projected resilience performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.performance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="resilience"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ fill: "#2563eb" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Suggested improvements for better resilience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recs.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Cost-Benefit Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost-Benefit Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed">{result.cost}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          {/* <footer className="text-center mt-12 py-6 border-t border-gray-200">
            <p className="text-gray-600">Made with Next.js ⚡</p>
          </footer> */}
        </div>
      </div>
    </div>
  )
}
