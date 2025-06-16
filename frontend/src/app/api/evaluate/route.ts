import { type NextRequest, NextResponse } from "next/server"

interface FormData {
  foundationType: "slab" | "elevated slab" | "pier" | "amphibious"
  siteElevation: number
  baseFloodElevation: number
  roofMaterial: "metal" | "asphalt" | "tile"
  floodVents: boolean
  breakawayWalls: boolean
  utilitiesProtected: boolean
  floodZone: "A" | "AE" | "V" | "X"
  yearBuilt: number
}

interface EvaluationResult {
  score: number
  performance: Array<{ year: number; resilience: number }>
  recs: string[]
  cost: string
}

export async function POST(request: NextRequest) {
  try {
    const data: FormData = await request.json()

    // Simple scoring algorithm
    let score = 50 // Base score

    // Foundation scoring
    const foundationScores = {
      slab: 10,
      "elevated slab": 25,
      pier: 35,
      amphibious: 45,
    }
    score += foundationScores[data.foundationType] || 0

    // Elevation scoring
    const elevationDiff = data.siteElevation - data.baseFloodElevation
    if (elevationDiff >= 2) score += 20
    else if (elevationDiff >= 1) score += 15
    else if (elevationDiff >= 0) score += 10
    else score -= 10 // Below BFE

    // Roof material scoring
    const roofScores = { metal: 15, tile: 10, asphalt: 5 }
    score += roofScores[data.roofMaterial] || 0

    // Feature scoring
    if (data.floodVents) score += 8
    if (data.breakawayWalls) score += 12
    if (data.utilitiesProtected) score += 10

    // Flood zone adjustment
    const zoneAdjustments = { X: 5, A: 0, AE: -5, V: -10 }
    score += zoneAdjustments[data.floodZone] || 0

    // Age penalty
    const currentYear = new Date().getFullYear()
    const age = currentYear - data.yearBuilt
    if (age > 30) score -= 5
    if (age > 50) score -= 10

    // Cap score between 0 and 100
    score = Math.max(0, Math.min(100, score))

    // Generate performance data
    const performance = Array.from({ length: 10 }, (_, i) => ({
      year: currentYear + i * 5,
      resilience: Math.max(20, score - i * 2 + (Math.random() * 10 - 5)),
    }))

    // Generate recommendations
    const recs: string[] = []

    if (data.siteElevation <= data.baseFloodElevation) {
      recs.push("Consider elevating the structure above Base Flood Elevation")
    }

    if (data.foundationType === "slab") {
      recs.push("Upgrade to elevated slab or pier foundation for better flood resistance")
    }

    if (!data.floodVents) {
      recs.push("Install flood vents to allow water flow and reduce structural pressure")
    }

    if (!data.breakawayWalls) {
      recs.push("Consider breakaway walls in flood-prone areas to reduce structural damage")
    }

    if (!data.utilitiesProtected) {
      recs.push("Elevate utilities (HVAC, electrical) above potential flood levels")
    }

    if (data.roofMaterial === "asphalt") {
      recs.push("Consider upgrading to metal roofing for better wind and weather resistance")
    }

    if (data.floodZone === "V") {
      recs.push("Implement additional wave-resistant design features for coastal velocity zones")
    }

    if (recs.length === 0) {
      recs.push("Your building shows good resilience features. Consider regular maintenance and monitoring.")
    }

    // Generate cost-benefit analysis
    const costBenefit = `Based on your building's current resilience score of ${score}/100, implementing the recommended improvements could increase your score by 15-25 points. The estimated cost for major upgrades ranges from $15,000-$75,000, but could save $50,000-$200,000 in potential flood damage over the building's lifetime. Additionally, improved resilience may qualify for insurance premium reductions of 10-25% and increase property value by 5-10%.`

    const result: EvaluationResult = {
      score,
      performance,
      recs,
      cost: costBenefit,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Evaluation error:", error)
    return NextResponse.json({ error: "Failed to evaluate architecture" }, { status: 500 })
  }
}
