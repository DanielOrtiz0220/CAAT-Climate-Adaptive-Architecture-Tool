"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/ui.button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/ui.card"
import { Input } from "@/components/ui/ui.input"
import { Label } from "@/components/ui/ui.label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/ui.select"
import { Checkbox } from "@/components/ui/ui.checkbox"
import { Textarea } from "@/components/ui/ui.textarea"
import { Alert, AlertDescription } from "@/components/ui/ui.alert"
import { useToast } from "@/hooks/hooks.use-toast"
import { checkBackendHealth, fetchWithFallback } from "@/lib/lib.api"
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
  foundationType: "SLAB_ON_GRADE" | "ELEVATED_FOUNDATION" | "PIER_AND_BEAM" | "PILE_FOUNDATION" | ""
  siteElevation: string
  baseFloodElevation: string
  roofMaterial: "metal" | "asphalt" | "tile" | ""
  floodVents: boolean
  breakawayWalls: boolean
  utilitiesProtected: boolean
  floodZone: "A" | "AE" | "V" | "X" | ""
  yearBuilt: string
  designDescription: string
}

interface EvaluationResult {
  currentScore: number
  timeline: Array<{
    year: number
    projectedBFE: number
    score: number
    recommendations: string[]
  }>
  overallRecommendations: string[]
}

export default function ClimateAdaptiveArchitectureTool() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<string>("")
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [usingFallback, setUsingFallback] = useState<boolean>(false)
  const [currentBackendUrl, setCurrentBackendUrl] = useState<string>('')
  const [formData, setFormData] = useState<FormData>({
    foundationType: "",
    siteElevation: "0",
    baseFloodElevation: "0",
    roofMaterial: "",
    floodVents: false,
    breakawayWalls: false,
    utilitiesProtected: false,
    floodZone: "",
    yearBuilt: new Date().getFullYear().toString(),
    designDescription: "",
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Check backend connectivity on component mount
  const checkBackendHealthStatus = async () => {
    try {
      const healthResult = await checkBackendHealth()
      setBackendConnected(healthResult.connected)
      setUsingFallback(healthResult.usingFallback)
      setCurrentBackendUrl(healthResult.url)
    } catch (error) {
      setBackendConnected(false)
      setUsingFallback(false)
      setCurrentBackendUrl('')
    }
  }

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealthStatus()
  }, [])

  const validateForm = (): boolean => {
    const errors: string[] = []

    const siteElevationNum = Number.parseFloat(formData.siteElevation) || 0
    const baseFloodElevationNum = Number.parseFloat(formData.baseFloodElevation) || 0

    if (siteElevationNum < 0) {
      errors.push("Site elevation must be 0 or greater")
    }

    if (baseFloodElevationNum < 0) {
      errors.push("Base flood elevation must be 0 or greater")
    }

    if (siteElevationNum < baseFloodElevationNum) {
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

    if (formData.designDescription.length > 1000) {
      errors.push("Design description must be 1000 characters or less")
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
    setLoadingStep("Preparing assessment...")

    try {
      // Check backend connectivity first
      if (backendConnected === false) {
        throw new Error("Backend server is not available")
      }

      setLoadingStep("Analyzing building characteristics...")

      // Transform frontend form data to backend API format
      const siteElevationNum = Number.parseFloat(formData.siteElevation) || 0
      const baseFloodElevationNum = Number.parseFloat(formData.baseFloodElevation) || 0
      
      // Map frontend roof material values to backend enum values
      const roofMaterialMapping = {
        'metal': 'METAL' as const,
        'asphalt': 'ASPHALT_SHINGLE' as const,
        'tile': 'TILE' as const,
      };
      
      const backendRequest = {
        foundationType: formData.foundationType,
        elevationAboveBFE: Math.max(0, siteElevationNum - baseFloodElevationNum),
        currentBFE: baseFloodElevationNum, // Add missing currentBFE field
        materials: ["MIXED"], // Default for now, can be enhanced later
        roofMaterial: roofMaterialMapping[formData.roofMaterial as keyof typeof roofMaterialMapping],
        mitigationFeatures: [
          ...(formData.floodVents ? ["FLOOD_VENTS"] : []),
          ...(formData.utilitiesProtected ? ["ELEVATED_UTILITIES"] : []),
        ],
        utilityProtection: formData.utilitiesProtected,
        location: {
          latitude: 29.9511, // New Orleans default coordinates
          longitude: -90.0715,
        },
        designDescription: formData.designDescription,
      }

      // Debug logging to confirm request structure
      console.log('Backend request payload:', backendRequest)

      setLoadingStep("Calculating resilience scores...")

      const response = await fetchWithFallback("/api/assess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendRequest),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Backend validation error:', errorData)
        
        // Extract more specific error details for Zod validation errors
        if (errorData.error === 'Invalid request data' && errorData.details) {
          const missingFields = errorData.details
            .filter((detail: any) => detail.code === 'invalid_type')
            .map((detail: any) => detail.path.join('.'))
          
          if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
          }
        }
        
        throw new Error(errorData.message || errorData.error || "Failed to evaluate architecture")
      }

      setLoadingStep("Generating AI recommendations...")

      const data: EvaluationResult = await response.json()
      setResult(data)

      toast({
        title: "Assessment Complete! 🎉",
        description: `Resilience score: ${data.currentScore}/100 with ${data.overallRecommendations.length} AI recommendations`,
      })
    } catch (error) {
      console.error("Assessment error:", error)
      toast({
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "Unable to connect to backend. Please ensure the backend server is running.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setLoadingStep("")
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Climate-Adaptive Architecture Tool</h1>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                AI-Powered
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-2">
              Advanced climate resilience assessment with AI-enhanced recommendations
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Timeline Projections
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Risk Analysis
              </span>
              <span className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Smart Recommendations
              </span>
            </div>
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
                        <SelectItem value="SLAB_ON_GRADE">Slab on Grade</SelectItem>
                        <SelectItem value="ELEVATED_FOUNDATION">Elevated Foundation</SelectItem>
                        <SelectItem value="PIER_AND_BEAM">Pier and Beam</SelectItem>
                        <SelectItem value="PILE_FOUNDATION">Pile Foundation</SelectItem>
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
                        onChange={(e) => updateFormData("siteElevation", e.target.value)}
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
                        onChange={(e) => updateFormData("baseFloodElevation", e.target.value)}
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
                        onChange={(e) => updateFormData("yearBuilt", e.target.value)}
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  {/* Design Description */}
                  <div className="space-y-2">
                    <Label htmlFor="designDescription">Design Description (Optional)</Label>
                    <div className="space-y-1">
                      <Textarea
                        id="designDescription"
                        value={formData.designDescription}
                        onChange={(e) => updateFormData("designDescription", e.target.value)}
                        placeholder="Describe your architectural design, materials, special features, or any specific climate considerations..."
                        className="min-h-[100px] resize-vertical"
                        maxLength={1000}
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          Help the AI provide more targeted recommendations
                        </span>
                        <span className={`${
                          formData.designDescription.length > 900 ? 'text-red-600' :
                          formData.designDescription.length > 800 ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {formData.designDescription.length}/1000
                        </span>
                      </div>
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

                  <Button type="submit" className="w-full" disabled={isLoading || backendConnected === false}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {loadingStep || "Processing..."}
                      </>
                    ) : backendConnected === false ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Backend Unavailable
                      </>
                    ) : (
                      "🚀 Analyze with AI"
                    )}
                  </Button>

                  {/* Backend Status Indicator */}
                  {backendConnected !== null && (
                    <div className="flex flex-col items-center justify-center gap-1 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          backendConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={backendConnected ? 'text-green-700' : 'text-red-700'}>
                          {backendConnected ? 'AI Backend Connected' : 'AI Backend Disconnected'}
                        </span>
                        {!backendConnected && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={checkBackendHealthStatus}
                            className="p-0 h-auto text-blue-600"
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                      {backendConnected && currentBackendUrl && (
                        <div className="text-xs text-gray-500">
                          {usingFallback ? (
                            <span className="text-yellow-600">
                              ⚠️ Using fallback: localhost
                            </span>
                          ) : (
                            <span className="text-green-600">
                              ✅ Using production: Railway
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
              <div className="space-y-6">
                {/* Resilience Score */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      AI-Calculated Resilience Score
                    </CardTitle>
                    <CardDescription>
                      Comprehensive assessment using advanced climate modeling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-6xl font-bold text-blue-600 mb-2">{result.currentScore}</div>
                      <div className="text-lg text-gray-600 mb-4">out of 100</div>
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full transition-all duration-1000 ${
                              result.currentScore >= 80 ? 'bg-green-500' :
                              result.currentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${result.currentScore}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.currentScore >= 80 ? '🟢 Excellent resilience' :
                         result.currentScore >= 60 ? '🟡 Good resilience, improvements recommended' :
                         '🔴 Critical improvements needed'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Timeline</CardTitle>
                    <CardDescription>Projected resilience scores with climate change impacts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.timeline}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [
                              name === 'score' ? `${value} points` : `${value} ft`,
                              name === 'score' ? 'Resilience Score' : 'Projected BFE'
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ fill: "#2563eb" }}
                            name="score"
                          />
                          <Line
                            type="monotone"
                            dataKey="projectedBFE"
                            stroke="#dc2626"
                            strokeWidth={2}
                            dot={{ fill: "#dc2626" }}
                            name="projectedBFE"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Enhanced Recommendations</CardTitle>
                    <CardDescription>Intelligent suggestions for improving climate resilience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.overallRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Timeline Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline Insights</CardTitle>
                    <CardDescription>Year-by-year projections and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.timeline.slice(0, 3).map((timepoint, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-900">{timepoint.year}</h4>
                            <span className="text-sm text-gray-600">Score: {timepoint.score}/100</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Projected BFE: {timepoint.projectedBFE.toFixed(1)} ft
                          </p>
                          {timepoint.recommendations.length > 0 && (
                            <ul className="text-sm text-gray-700 space-y-1">
                              {timepoint.recommendations.slice(0, 2).map((rec, recIndex) => (
                                <li key={recIndex} className="flex items-start gap-2">
                                  <span className="text-blue-600">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
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
