"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const services_scoring_1 = require("../services/services.scoring");
const services_ai_1 = require("../services/services.ai");
const schemas_assessment_1 = require("../schemas/schemas.assessment");
const router = (0, express_1.Router)();
/**
 * POST /api/assess
 * Assess building resilience and generate recommendations
 */
router.post('/assess', async (req, res) => {
    try {
        // Validate request body
        const validatedRequest = schemas_assessment_1.AssessmentRequestSchema.parse(req.body);
        // Calculate current score
        const currentScore = services_scoring_1.ScoringService.calculateCurrentScore(validatedRequest);
        // Generate timeline
        const timeline = services_scoring_1.ScoringService.generateTimeline(validatedRequest);
        // Get base recommendations from the first timeline entry
        const baseRecommendations = timeline[0].recommendations;
        // Generate enhanced recommendations using AI
        const enhancedRecommendations = await services_ai_1.AIService.generateEnhancedRecommendations(validatedRequest, baseRecommendations, timeline);
        // Prepare response
        const response = schemas_assessment_1.AssessmentResponseSchema.parse({
            currentScore,
            timeline,
            overallRecommendations: enhancedRecommendations,
        });
        res.json(response);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                error: 'Invalid request data',
                details: error.errors,
            });
        }
        else {
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
exports.apiRouter = router;
