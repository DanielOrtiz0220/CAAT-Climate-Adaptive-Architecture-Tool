import { Router } from 'express';
import { z } from 'zod';
import { ScoringService } from '../services/services.scoring';
import { AIService } from '../services/services.ai';
import { AssessmentRequestSchema, AssessmentResponseSchema } from '../schemas/schemas.assessment';

const router = Router();

/**
 * POST /api/assess
 * Assess building resilience and generate recommendations
 */
router.post('/assess', async (req, res) => {
  try {
    // Validate request body
    const validatedRequest = AssessmentRequestSchema.parse(req.body);
    
    // Calculate current score
    const currentScore = ScoringService.calculateCurrentScore(validatedRequest);
    
    // Generate timeline
    const timeline = ScoringService.generateTimeline(validatedRequest);
    
    // Get base recommendations from the first timeline entry
    const baseRecommendations = timeline[0].recommendations;
    
    // Generate enhanced recommendations using AI
    const enhancedRecommendations = await AIService.generateEnhancedRecommendations(
      validatedRequest,
      baseRecommendations,
      timeline
    );
    
    // Prepare response
    const response = AssessmentResponseSchema.parse({
      currentScore,
      timeline,
      overallRecommendations: enhancedRecommendations,
    });
    
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid request data',
        details: error.errors,
      });
    } else {
      console.error('Assessment error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process assessment request',
      });
    }
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

export const apiRouter = router;
