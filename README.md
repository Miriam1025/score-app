# Score — Sourdough Tracker

## Overview

A Progressive Web App (PWA) for tracking sourdough baking sessions with the goal of optimizing outcomes through data correlation. The app minimizes manual data entry by leveraging photo uploads to automatically capture timestamps, location, weather conditions, and volume changes.

Built as a personal tool with potential for future App Store publication.

## Goals

- Track starter and dough through each baking stage with minimal manual entry
- Leverage photo metadata and image analysis for automated data capture
- Correlate variables (temperature, humidity, timing, ratios) to baking outcomes
- Learn GCP services (Cloud Functions, Cloud Vision, BigQuery) through hands-on use

## Features

### Core Workflow
- Stage-by-stage bake workflow following user's established recipe
- Card-based UI with current stage prominent, others collapsed
- Adjustable measurements with +/- buttons (defaults from recipe)
- Water temperature toggle (room temp / warmed) per stage

### Photo-Based Tracking
- Upload from camera or photo library
- Auto-extract timestamp and GPS from photo metadata
- Weather lookup (temperature, humidity) from location and time
- Volume tracking via photo pairs (baseline + check)
- Cloud Vision API for automated fill-level detection

### Timers and Reminders
- Optional per-stage timers (toggle on/off)
- Stretch and fold reminders (30 min intervals)
- Stage duration estimates displayed upfront

### History and Analytics
- Persistent bake history
- BigQuery integration for SQL analysis
- Correlate conditions to outcomes over time

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| PWA | Vite PWA plugin |
| Database | Firestore |
| Auth | Firebase Auth |
| Photo Storage | Firebase Storage |
| Backend Logic | Cloud Functions (Python) |
| Image Analysis | Cloud Vision API |
| Analytics | BigQuery (Firestore export) |
| Weather API | Open-Meteo |
| Hosting | Netlify |

See [STACK.md](./STACK.md) for detailed rationale.

## UI Principles

- Clean, simple, dyslexic-friendly design
- Action words in ALL CAPS (STIR, MIX, COVER)
- Times visually distinct (separate color/weight)
- Total time estimate at stage start with durations inline

See [UI_SPEC.md](./UI_SPEC.md) for full specification.

## Project Documents

| Document | Description |
|----------|-------------|
| [STACK.md](./STACK.md) | Tech stack details and rationale |
| [UI_SPEC.md](./UI_SPEC.md) | UI decisions, styling, accessibility |
| [RECIPE.md](./RECIPE.md) | Sourdough recipe with defaults |
| [DATA_MODEL.md](./DATA_MODEL.md) | Firestore structure |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System diagram and data flow |
| [PHASES.md](./PHASES.md) | Build phases and milestones |

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI
- GCP account with Blaze plan
- VS Code (recommended IDE)

### Local Development
```bash
# Clone repo
git clone <repo-url>
cd score-app

# Install frontend dependencies
cd frontend
npm install

# Run development server
npm run dev
```

### Firebase Setup
```bash
# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy functions
cd functions
firebase deploy --only functions
```

### Environment Variables
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## License

Personal project. License TBD if published.
