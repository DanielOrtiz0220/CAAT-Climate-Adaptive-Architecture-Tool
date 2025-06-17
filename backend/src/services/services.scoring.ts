import { config } from '../config/config';
import { 
  AssessmentRequest, 
  FoundationType, 
  MaterialType, 
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
    
    // Calculate weighted total
    return (
      elevationScore * scoringWeights.elevation +
      foundationScore * scoringWeights.foundationType +
      materialsScore * scoringWeights.materials +
      mitigationScore * scoringWeights.mitigationFeatures +
      utilityScore * scoringWeights.utilityProtection
    );
  }

  /**
   * Generate timeline of projected scores and BFE
   */
  static generateTimeline(request: AssessmentRequest) {
    const { baselineFloodParameters } = config;
    const timeline = [];

    for (const year of baselineFloodParameters.simulationYears) {
      const yearsFromNow = year - new Date().getFullYear();
      const projectedBFE = baselineFloodParameters.currentBFE + 
        (yearsFromNow * baselineFloodParameters.annualRiseRate);
      
      // Adjust elevation score based on projected BFE
      const adjustedRequest = {
        ...request,
        elevationAboveBFE: Math.max(0, request.elevationAboveBFE - 
          (projectedBFE - baselineFloodParameters.currentBFE))
      };

      timeline.push({
        year,
        projectedBFE,
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

    if (!request.utilityProtection) {
      recommendations.push('Implement utility protection measures to prevent flood damage');
    }

    return recommendations;
  }
}
