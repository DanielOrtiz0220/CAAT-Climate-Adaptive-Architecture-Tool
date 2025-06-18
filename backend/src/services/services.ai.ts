import OpenAI from 'openai';
import { config } from '../config/config';
import { AssessmentRequest } from '../schemas/schemas.assessment';

export class AIService {
  private static openai = new OpenAI({
    apiKey: config.openai.apiKey,
  });

  /**
   * Generate enhanced recommendations using OpenAI
   */
  static async generateEnhancedRecommendations(
    request: AssessmentRequest,
    baseRecommendations: string[],
    timeline: any[]
  ): Promise<string[]> {
    try {
      const prompt = this.buildPrompt(request, baseRecommendations, timeline);
      
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in flood-resilient architecture and climate adaptation. Provide specific, actionable recommendations for improving building resilience.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
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
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return baseRecommendations; // Fallback to base recommendations
    }
  }

  /**
   * Build the prompt for OpenAI
   */
  private static buildPrompt(
    request: AssessmentRequest,
    baseRecommendations: string[],
    timeline: any[]
  ): string {
    return `
      Building Assessment Details:
      - Foundation Type: ${request.foundationType}
      - Elevation Above BFE: ${request.elevationAboveBFE} feet
      - Materials: ${request.materials.join(', ')}
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
      ${request.designDescription ? '6. The user\'s design goals and requirements described above' : ''}

      Format each recommendation as a separate line, starting with a bullet point.
    `;
  }
}
