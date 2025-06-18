"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentResponseSchema = exports.AssessmentRequestSchema = exports.MitigationFeature = exports.RoofMaterialType = exports.MaterialType = exports.FoundationType = void 0;
const zod_1 = require("zod");
// Foundation Types
exports.FoundationType = zod_1.z.enum([
    'SLAB_ON_GRADE',
    'PIER_AND_BEAM',
    'PILE_FOUNDATION',
    'ELEVATED_FOUNDATION',
]);
// Material Types
exports.MaterialType = zod_1.z.enum([
    'CONCRETE',
    'STEEL_FRAME',
    'WOOD_FRAME',
    'MASONRY',
    'MIXED',
]);
// Roof Material Types (separate from structural materials)
exports.RoofMaterialType = zod_1.z.enum([
    'METAL',
    'ASPHALT_SHINGLE',
    'TILE',
]);
// Mitigation Features
exports.MitigationFeature = zod_1.z.enum([
    'FLOOD_VENTS',
    'WATERPROOFING',
    'BACKFLOW_PREVENTION',
    'ELEVATED_UTILITIES',
    'FLOOD_BARRIERS',
]);
// Assessment Request Schema
exports.AssessmentRequestSchema = zod_1.z.object({
    foundationType: exports.FoundationType,
    elevationAboveBFE: zod_1.z.number().min(0),
    currentBFE: zod_1.z.number().min(0), // User's site Base Flood Elevation in feet
    materials: zod_1.z.array(exports.MaterialType),
    roofMaterial: exports.RoofMaterialType,
    mitigationFeatures: zod_1.z.array(exports.MitigationFeature),
    utilityProtection: zod_1.z.boolean(),
    location: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
    }),
    designDescription: zod_1.z.string().optional(),
});
// Assessment Response Schema
exports.AssessmentResponseSchema = zod_1.z.object({
    currentScore: zod_1.z.number(),
    timeline: zod_1.z.array(zod_1.z.object({
        year: zod_1.z.number(),
        projectedBFE: zod_1.z.number(),
        score: zod_1.z.number(),
        recommendations: zod_1.z.array(zod_1.z.string()),
    })),
    overallRecommendations: zod_1.z.array(zod_1.z.string()),
});
