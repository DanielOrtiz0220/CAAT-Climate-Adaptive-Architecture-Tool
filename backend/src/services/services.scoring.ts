import { config } from '../config/config';
import {
  AssessmentRequest,
  FoundationType,
  MaterialType,
  RoofMaterialType,
  MitigationFeature
} from '../schemas/schemas.assessment';

// Scoring factors for different components
const foundationScores: Record<FoundationType, number> = {
  SLAB_ON_GRADE: 40,
  PIER_AND_BEAM: 60,
  PILE_FOUNDATION: 80,
  ELEVATED_FOUNDATION: 100,
};

const materialScores: Record<MaterialType, number> = {
  CONCRETE: 100,
  STEEL_FRAME: 80,
  WOOD_FRAME: 60,
  MASONRY: 70,
  MIXED: 50,
};

// Source-based roof material scoring with climate resilience evidence
const roofMaterialScores: Record<RoofMaterialType, number> = {
  METAL: 80,           // FEMA P-424: Superior wind resistance (140+ mph), heat reflection, 40-70 year lifespan
  ASPHALT_SHINGLE: 50, // IBHS research: Higher vulnerability to wind uplift and hail, shorter lifespan, heat absorption
  TILE: 75,            // Florida Building Code: Hurricane resistance, coastal durability, fire resistance
};

const mitigationFeatureScores: Record<MitigationFeature, number> = {
  FLOOD_VENTS: 20,
  WATERPROOFING: 25,
  BACKFLOW_PREVENTION: 20,
  ELEVATED_UTILITIES: 20,
  FLOOD_BARRIERS: 15,
};

export class ScoringService {
  /**
   * Calculate the current resilience score based on building parameters
   */
  static calculateCurrentScore(request: AssessmentRequest): number {
    const { scoringWeights } = config;
    
    // Calculate elevation score (linear scale, max at 10 feet above BFE)
    const elevationScore = Math.min(request.elevationAboveBFE * 10, 100);
    
    // Calculate foundation score
    const foundationScore = foundationScores[request.foundationType];
    
    // Calculate materials score (average of all materials)
    const materialsScore = request.materials.reduce(
      (sum, material) => sum + materialScores[material], 
      0
    ) / request.materials.length;
    
    // Calculate roof material score based on climate resilience properties
    const roofMaterialScore = roofMaterialScores[request.roofMaterial];
    
    // Calculate mitigation features score (sum of all features, capped at 100)
    const mitigationScore = Math.min(
      request.mitigationFeatures.reduce(
        (sum, feature) => sum + mitigationFeatureScores[feature],
        0
      ),
      100
    );
    
    // Calculate utility protection score
    const utilityScore = request.utilityProtection ? 100 : 0;
    
    // Calculate weighted total (including roof material as part of materials weight)
    const combinedMaterialsScore = (materialsScore * 0.7) + (roofMaterialScore * 0.3); // 70% structural, 30% roof
    
    return (
      elevationScore * scoringWeights.elevation +
      foundationScore * scoringWeights.foundationType +
      combinedMaterialsScore * scoringWeights.materials +
      mitigationScore * scoringWeights.mitigationFeatures +
      utilityScore * scoringWeights.utilityProtection
    );
  }

  /**
   * Generate timeline of projected scores and BFE
   * Includes projections through 2055 with 3.6 inches/year sea level rise
   */
  static generateTimeline(request: AssessmentRequest) {
    const { baselineFloodParameters } = config;
    const timeline = [];

    // Ensure we have all required simulation years including 2045 and 2055
    const simulationYears = [...baselineFloodParameters.simulationYears].sort((a: number, b: number) => a - b);

    for (const year of simulationYears) {
      // Use 2025 as baseline year and user's BFE as baseline value
      const yearsFrom2025 = year - 2025;
      const projectedBFE = request.currentBFE +
        (yearsFrom2025 * baselineFloodParameters.annualRiseRate);
      
      // Adjust elevation score based on projected BFE rise from user's baseline
      const bfeRise = projectedBFE - request.currentBFE;
      const adjustedRequest = {
        ...request,
        elevationAboveBFE: Math.max(0, request.elevationAboveBFE - bfeRise)
      };

      timeline.push({
        year,
        projectedBFE: Number(projectedBFE.toFixed(2)), // Round to 2 decimal places for consistency
        score: this.calculateCurrentScore(adjustedRequest),
        recommendations: this.generateRecommendations(adjustedRequest, projectedBFE)
      });
    }

    return timeline;
  }

  /**
   * Generate recommendations based on score and parameters
   */
  private static generateRecommendations(
    request: AssessmentRequest, 
    projectedBFE: number
  ): string[] {
    const recommendations: string[] = [];
    const score = this.calculateCurrentScore(request);

    if (score < config.thresholds.criticalScore) {
      recommendations.push('CRITICAL: Immediate action required to improve flood resilience');
    } else if (score < config.thresholds.warningScore) {
      recommendations.push('WARNING: Consider improvements to enhance flood resilience');
    }

    if (request.elevationAboveBFE < 3) {
      recommendations.push(`Consider elevating the structure above projected BFE of ${projectedBFE.toFixed(1)} feet`);
    }

    if (request.foundationType === 'SLAB_ON_GRADE') {
      recommendations.push('Consider upgrading to a more flood-resistant foundation type');
    }

    if (request.materials.includes('WOOD_FRAME')) {
      recommendations.push('Consider using more flood-resistant materials for critical components');
    }

    // Roof material specific recommendations
    if (request.roofMaterial === 'ASPHALT_SHINGLE') {
      recommendations.push('Consider upgrading to metal or tile roofing for better wind resistance and longevity');
    }
    
    if (request.roofMaterial === 'METAL' && request.foundationType === 'SLAB_ON_GRADE') {
      recommendations.push('Metal roofing provides excellent resilience - consider pairing with elevated foundation for maximum protection');
    }

    if (!request.utilityProtection) {
      recommendations.push('Implement utility protection measures to prevent flood damage');
    }

    return recommendations;
  }
}
