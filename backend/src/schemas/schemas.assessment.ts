import { z } from 'zod';

// Foundation Types
export const FoundationType = z.enum([
  'SLAB_ON_GRADE',
  'PIER_AND_BEAM',
  'PILE_FOUNDATION',
  'ELEVATED_FOUNDATION',
]);

// Material Types
export const MaterialType = z.enum([
  'CONCRETE',
  'STEEL_FRAME',
  'WOOD_FRAME',
  'MASONRY',
  'MIXED',
]);

// Mitigation Features
export const MitigationFeature = z.enum([
  'FLOOD_VENTS',
  'WATERPROOFING',
  'BACKFLOW_PREVENTION',
  'ELEVATED_UTILITIES',
  'FLOOD_BARRIERS',
]);

// Assessment Request Schema
export const AssessmentRequestSchema = z.object({
  foundationType: FoundationType,
  elevationAboveBFE: z.number().min(0),
  materials: z.array(MaterialType),
  mitigationFeatures: z.array(MitigationFeature),
  utilityProtection: z.boolean(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  designDescription: z.string().optional(),
});

// Assessment Response Schema
export const AssessmentResponseSchema = z.object({
  currentScore: z.number(),
  timeline: z.array(z.object({
    year: z.number(),
    projectedBFE: z.number(),
    score: z.number(),
    recommendations: z.array(z.string()),
  })),
  overallRecommendations: z.array(z.string()),
});

// TypeScript Types
export type FoundationType = z.infer<typeof FoundationType>;
export type MaterialType = z.infer<typeof MaterialType>;
export type MitigationFeature = z.infer<typeof MitigationFeature>;
export type AssessmentRequest = z.infer<typeof AssessmentRequestSchema>;
export type AssessmentResponse = z.infer<typeof AssessmentResponseSchema>;
