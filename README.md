# TutorGalaxy Frontend

This is the frontend application for the TutorGalaxy project, built with Next.js and Material UI. For the complete application, you'll also need to set up the backend which can be found at [TutorGalaxy Backend Repository](https://github.com/TutorGalaxy/backend).

## Quick Start Guide

### Prerequisites

1. Install Node.js:
   - Download and install Node.js (v18 or higher) from [nodejs.org](https://nodejs.org/)
   - Verify installation by running:
```sh
node --version
npm --version
```

### Environment Setup

1. Create a `.env.local` file in the root directory:
```sh
cp .env.example .env.local
```

2. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000    # Backend API URL
REACT_APP_API_URL=http://localhost:8000      # Backend API URL
```

### Installation & Setup

1. Install dependencies:
```sh
npm install
```

2. Start development server:
```sh
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

> **Note**: Make sure you have the backend server running as well. Follow the setup instructions in the [backend repository](https://github.com/TutorGalaxy/backend).


