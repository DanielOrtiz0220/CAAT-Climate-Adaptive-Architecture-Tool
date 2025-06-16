# CAAT - Climate Adaptive Architecture Tool

A comprehensive tool for climate-adaptive architecture design and analysis.

## Project Structure

```
CAAT-Climate-Adaptive-Architecture-Tool/
├── config/           # Configuration files
├── frontend/         # Next.js frontend application
│   └── src/         # Frontend source code
├── backend/         # Backend services
│   └── src/         # Backend source code
├── data/            # Data storage and resources
└── README.md        # Project documentation
```

## Overview

CAAT (Climate Adaptive Architecture Tool) is a comprehensive platform designed to assist architects and designers in creating climate-responsive buildings. The tool provides analysis, recommendations, and visualization capabilities for climate-adaptive architecture.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Python 3.8+ (for backend services)

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   pnpm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Development

1. Start the frontend development server:
   ```bash
   cd frontend
   pnpm dev
   ```

2. Start the backend server:
   ```bash
   cd backend
   python src/main.py
   ```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.