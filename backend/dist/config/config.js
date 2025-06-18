"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    // Server Configuration
    port: process.env.PORT || 8000,
    // OpenAI Configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'chatgpt-4o-latest',
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
        annualRiseRate: 0.3, // Projected annual rise in feet (3.6 inches/year)
        simulationYears: [2025, 2030, 2035, 2040, 2045, 2050, 2055],
    },
    // Performance Thresholds
    thresholds: {
        criticalScore: 60, // Score below which immediate action is recommended
        warningScore: 75, // Score below which improvements should be considered
    },
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
};
