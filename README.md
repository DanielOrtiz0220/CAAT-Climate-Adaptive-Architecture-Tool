# Climate-Adaptive Architecture Tool (CAAT)

A comprehensive web application designed to help architects and building professionals design flood-resilient buildings for New Orleans through 2055. CAAT evaluates building resilience against climate change projections and provides AI-powered recommendations for improving flood resistance.

## 🌊 Project Overview

The Climate-Adaptive Architecture Tool addresses the critical need for flood-resilient building design in New Orleans, a city facing increasing flood risks due to climate change. By 2055, sea level rise and changing precipitation patterns will significantly impact building performance. CAAT provides:

- **Real-time resilience scoring** based on building characteristics
- **Climate projections** through 2055 with annual flood level increases
- **AI-powered recommendations** for improving building resilience
- **Cost-benefit analysis** for proposed improvements
- **Timeline visualization** showing performance degradation over time

## ✨ Features

### Core Capabilities
- **Building Assessment**: Comprehensive evaluation of foundation types, materials, elevation, and mitigation features
- **Resilience Scoring**: Weighted scoring algorithm considering elevation, foundation type, materials, mitigation features, and utility protection
- **Climate Projections**: Timeline analysis from 2025-2055 with projected Base Flood Elevation (BFE) increases
- **AI Recommendations**: OpenAI-powered suggestions for immediate and long-term improvements
- **Performance Visualization**: Interactive charts showing resilience degradation over time
- **Cost-Benefit Analysis**: Economic impact assessment of recommended improvements

### Assessment Parameters
- **Foundation Types**: Slab-on-grade, Pier & Beam, Pile Foundation, Elevated Foundation
- **Building Materials**: Concrete, Steel Frame, Wood Frame, Masonry, Mixed
- **Mitigation Features**: Flood vents, Waterproofing, Backflow prevention, Elevated utilities, Flood barriers
- **Location Data**: GPS coordinates for localized climate projections
- **Utility Protection**: Assessment of critical system elevation and protection

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI Integration**: OpenAI GPT-4 for enhanced recommendations
- **Validation**: Zod for schema validation and type safety
- **Configuration**: Environment-based configuration management

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks and context

### Development Tools
- **Language**: TypeScript for full-stack type safety
- **Package Manager**: npm (backend), pnpm (frontend)
- **Build Tools**: TypeScript compiler, Next.js build system
- **Development**: Hot reload with ts-node-dev (backend), Next.js dev server (frontend)

## 📁 Project Structure

```
CAAT-Climate-Adaptive-Architecture-Tool/
├── backend/                          # Express.js API server
│   ├── src/
│   │   ├── api/
│   │   │   └── api.routes.ts         # API route definitions
│   │   ├── config/
│   │   │   └── config.ts             # Application configuration
│   │   ├── schemas/
│   │   │   └── schemas.assessment.ts # Zod validation schemas
│   │   ├── services/
│   │   │   ├── services.ai.ts        # OpenAI integration
│   │   │   └── services.scoring.ts   # Resilience scoring algorithms
│   │   └── app.ts                    # Express application setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/                         # Next.js web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/evaluate/
│   │   │   │   └── route.ts          # Frontend API route (legacy)
│   │   │   ├── globals.css           # Global styles
│   │   │   ├── layout.tsx            # Root layout component
│   │   │   └── page.tsx              # Main application page
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   └── components.theme-provider.tsx
│   │   ├── hooks/
│   │   │   └── hooks.use-toast.ts    # Toast notification hook
│   │   └── lib/
│   │       └── lib.utils.ts          # Utility functions
│   ├── package.json
│   └── next.config.mjs
├── data/                             # Climate and reference data
└── README.md
```

## 🚀 Installation and Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- OpenAI API key (for AI recommendations)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Required environment variables**:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   LOG_LEVEL=info
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or npm install
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   # or npm run dev
   ```

4. **Build for production**:
   ```bash
   pnpm build
   pnpm start
   ```

### Full Stack Development

1. **Start backend** (Terminal 1):
   ```bash
   cd backend && npm run dev
   ```

2. **Start frontend** (Terminal 2):
   ```bash
   cd frontend && pnpm dev
   ```

3. **Access application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api
   - Health check: http://localhost:3000/api/health

## 📖 Usage Examples

### Basic Building Assessment

1. **Access the application** at http://localhost:3000
2. **Fill out the building assessment form**:
   - Select foundation type (e.g., "Pier & Beam")
   - Enter site elevation (e.g., 10 feet)
   - Enter base flood elevation (e.g., 8 feet)
   - Select roof material (e.g., "Metal")
   - Check applicable mitigation features
   - Select flood zone (e.g., "AE")
   - Enter year built

3. **Submit for evaluation** to receive:
   - Current resilience score (0-100)
   - Performance timeline through 2055
   - AI-generated recommendations
   - Cost-benefit analysis

### API Usage Example

```typescript
// POST /api/assess
const assessmentRequest = {
  foundationType: "PIER_AND_BEAM",
  elevationAboveBFE: 2.0,
  materials: ["WOOD_FRAME", "CONCRETE"],
  mitigationFeatures: ["FLOOD_VENTS", "ELEVATED_UTILITIES"],
  utilityProtection: true,
  location: {
    latitude: 29.9511,
    longitude: -90.0715
  }
};

const response = await fetch('/api/assess', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(assessmentRequest)
});

const result = await response.json();
// Returns: currentScore, timeline, overallRecommendations
```

## 🔌 API Documentation

### Endpoints

#### `POST /api/assess`
Evaluate building resilience and generate recommendations.

**Request Body**:
```typescript
{
  foundationType: "SLAB_ON_GRADE" | "PIER_AND_BEAM" | "PILE_FOUNDATION" | "ELEVATED_FOUNDATION",
  elevationAboveBFE: number,
  materials: Array<"CONCRETE" | "STEEL_FRAME" | "WOOD_FRAME" | "MASONRY" | "MIXED">,
  mitigationFeatures: Array<"FLOOD_VENTS" | "WATERPROOFING" | "BACKFLOW_PREVENTION" | "ELEVATED_UTILITIES" | "FLOOD_BARRIERS">,
  utilityProtection: boolean,
  location: {
    latitude: number,
    longitude: number
  }
}
```

**Response**:
```typescript
{
  currentScore: number,
  timeline: Array<{
    year: number,
    projectedBFE: number,
    score: number,
    recommendations: string[]
  }>,
  overallRecommendations: string[]
}
```

#### `GET /api/health`
Health check endpoint.

**Response**:
```json
{ "status": "healthy" }
```

### Scoring Algorithm

The resilience score (0-100) is calculated using weighted factors:

- **Elevation (40%)**: Linear scale, maximum at 10 feet above BFE
- **Foundation Type (20%)**: Slab (40) → Elevated (100)
- **Materials (15%)**: Average score of all materials
- **Mitigation Features (15%)**: Sum of feature scores (capped at 100)
- **Utility Protection (10%)**: Binary score (0 or 100)

### Climate Projections

- **Base Flood Elevation**: Currently 8.0 feet (New Orleans)
- **Annual Rise Rate**: 0.1 feet per year
- **Simulation Years**: 2025, 2030, 2035, 2040, 2045, 2050, 2055
- **Performance Thresholds**: Critical (<60), Warning (<75)

## 🔄 Development Workflow

### Code Organization
- **Backend**: Service-oriented architecture with clear separation of concerns
- **Frontend**: Component-based architecture with reusable UI elements
- **Validation**: Shared Zod schemas ensure type safety across the stack
- **Configuration**: Environment-based configuration for different deployment stages

### Development Commands

**Backend**:
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
npm test         # Run test suite
```

**Frontend**:
```bash
pnpm dev         # Start Next.js development server
pnpm build       # Build for production
pnpm start       # Start production server
pnpm lint        # Run ESLint
```

### Code Quality
- **TypeScript**: Full-stack type safety
- **Zod Validation**: Runtime type checking and validation
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Configurable logging levels for debugging and monitoring

## 🗺 Future Roadmap

### Phase 1: Enhanced Integration (Q1 2025)
- [ ] **Backend-Frontend Integration**: Replace frontend mock API with backend services
- [ ] **Authentication System**: User accounts and project management
- [ ] **Data Persistence**: Database integration for saving assessments
- [ ] **Enhanced UI/UX**: Improved user interface and experience

### Phase 2: Advanced Features (Q2 2025)
- [ ] **Geographic Integration**: FEMA flood map integration
- [ ] **Building Code Compliance**: Local regulation checking
- [ ] **3D Visualization**: Building model visualization
- [ ] **Batch Processing**: Multiple building assessments

### Phase 3: Professional Tools (Q3 2025)
- [ ] **Report Generation**: PDF reports for clients
- [ ] **Cost Estimation**: Detailed cost modeling for improvements
- [ ] **Insurance Integration**: Premium calculation assistance
- [ ] **Regulatory Compliance**: Building permit assistance

### Phase 4: Platform Expansion (Q4 2025)
- [ ] **Multi-City Support**: Expand beyond New Orleans
- [ ] **Mobile Application**: Native mobile app development
- [ ] **API Marketplace**: Third-party integrations
- [ ] **Machine Learning**: Enhanced prediction models

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FEMA**: Flood zone data and building guidelines
- **NOAA**: Climate projection data
- **New Orleans Building Department**: Local building codes and regulations
- **OpenAI**: AI-powered recommendation engine

---

**Built for resilient architecture in the face of climate change** 🌊🏗️

For questions, support, or contributions, please open an issue or contact the development team.