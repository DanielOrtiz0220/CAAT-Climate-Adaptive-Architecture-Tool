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

// Roof Material Types (separate from structural materials)
export const RoofMaterialType = z.enum([
  'METAL',
  'ASPHALT_SHINGLE',
  'TILE',
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
  currentBFE: z.number().min(0), // User's site Base Flood Elevation in feet
  materials: z.array(MaterialType),
  roofMaterial: RoofMaterialType,
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
export type RoofMaterialType = z.infer<typeof RoofMaterialType>;
export type MitigationFeature = z.infer<typeof MitigationFeature>;
export type AssessmentRequest = z.infer<typeof AssessmentRequestSchema>;
export type AssessmentResponse = z.infer<typeof AssessmentResponseSchema>;
