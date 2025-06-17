import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview',
  },

  // Scoring Weights
  scoringWeights: {
    elevation: 0.40,
    foundationType: 0.20,
    materials: 0.15,
    mitigationFeatures: 0.15,
    utilityProtection: 0.10,
  },

  // Baseline Flood Parameters (New Orleans specific)
  baselineFloodParameters: {
    currentBFE: 8.0, // Base Flood Elevation in feet
    annualRiseRate: 0.1, // Projected annual rise in feet
    simulationYears: [2025, 2030, 2035, 2040, 2045, 2050, 2055],
  },

  // Performance Thresholds
  thresholds: {
    criticalScore: 60, // Score below which immediate action is recommended
    warningScore: 75,  // Score below which improvements should be considered
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

// Type for the config object
export type Config = typeof config;
