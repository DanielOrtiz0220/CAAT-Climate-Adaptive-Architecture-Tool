"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config/config");
class AIService {
    /**
     * Generate enhanced recommendations using OpenAI
     */
    static async generateEnhancedRecommendations(request, baseRecommendations, timeline) {
        try {
            const prompt = this.buildPrompt(request, baseRecommendations, timeline);
            const completion = await this.openai.chat.completions.create({
                model: config_1.config.openai.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert in flood-resilient architecture, climate adaptation, and roofing materials. Provide specific, actionable recommendations for improving building resilience, including roof material considerations for wind resistance, durability, and climate performance.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 250,
            });
            const response = completion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('No response from OpenAI');
            }
            // Parse the response into an array of recommendations
            return response
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map(line => line.replace(/^[-•*]\s*/, '').trim());
        }
        catch (error) {
            console.error('Error generating AI recommendations:', error);
            return baseRecommendations; // Fallback to base recommendations
        }
    }
    /**
     * Build the prompt for OpenAI
     */
    static buildPrompt(request, baseRecommendations, timeline) {
        return `
      Building Assessment Details:
      - Foundation Type: ${request.foundationType}
      - Elevation Above BFE: ${request.elevationAboveBFE} feet
      - Structural Materials: ${request.materials.join(', ')}
      - Roof Material: ${request.roofMaterial} (${this.getRoofMaterialDescription(request.roofMaterial)})
      - Mitigation Features: ${request.mitigationFeatures.join(', ')}
      - Utility Protection: ${request.utilityProtection ? 'Yes' : 'No'}
      ${request.designDescription ? `
      Design Description & Goals:
      ${request.designDescription}` : ''}

      Current Recommendations:
      ${baseRecommendations.map(rec => `- ${rec}`).join('\n')}

      Projected Timeline:
      ${timeline.map(year => `
        Year ${year.year}:
        - Projected BFE: ${year.projectedBFE.toFixed(1)} feet
        - Resilience Score: ${year.score.toFixed(1)}
      `).join('\n')}

      Please provide specific, actionable recommendations for improving the building's flood resilience, considering:
      1. Immediate improvements needed
      2. Long-term adaptation strategies
      3. Cost-effective solutions
      4. Local building codes and regulations
      5. Climate change projections
      6. Roof material performance in extreme weather conditions
      ${request.designDescription ? '7. The user\'s design goals and requirements described above' : ''}

      Format each recommendation as a separate line, starting with a bullet point.
    `;
    }
    /**
     * Get descriptive information about roof material properties
     */
    static getRoofMaterialDescription(roofMaterial) {
        const descriptions = {
            'METAL': 'Superior wind resistance up to 140+ mph, excellent heat reflection, 40-70 year lifespan',
            'ASPHALT_SHINGLE': 'Standard residential material, vulnerable to wind uplift and hail, 15-30 year lifespan',
            'TILE': 'Excellent hurricane resistance, coastal durability, superior fire resistance'
        };
        return descriptions[roofMaterial] || 'Unknown material properties';
    }
}
exports.AIService = AIService;
AIService.openai = new openai_1.default({
    apiKey: config_1.config.openai.apiKey,
});
