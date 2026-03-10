# Architecture

## Overview

This document describes how all components connect and data flows through the system.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   USER                                       │
│                              (Phone/Browser)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NETLIFY (Frontend)                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         React + Vite PWA                               │  │
│  │                                                                        │  │
│  │  • Card-based UI for bake workflow                                    │  │
│  │  • Photo capture (camera + upload)                                    │  │
│  │  • Timer management                                                    │  │
│  │  • Offline support via service worker                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│   Firebase Auth      │  │    Firestore     │  │  Firebase Storage    │
│                      │  │                  │  │                      │
│  • User accounts     │  │  • Bake sessions │  │  • Photo uploads     │
│  • Anonymous auth    │  │  • Stage data    │  │  • Image serving     │
│  • Session mgmt      │  │  • Preferences   │  │                      │
└──────────────────────┘  └──────────────────┘  └──────────────────────┘
                                      │                 │
                                      │                 │
                                      ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUD FUNCTIONS (Python)                             │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────────┐   │
│  │ extract_metadata  │  │   fetch_weather   │  │    analyze_volume     │   │
│  │                   │  │                   │  │                       │   │
│  │ Trigger: Storage  │  │ Trigger: Firestore│  │ Trigger: Storage      │   │
│  │ • Read EXIF data  │  │ • Call Open-Meteo │  │ • Call Vision API     │   │
│  │ • Get timestamp   │  │ • Get historical  │  │ • Detect fill level   │   │
│  │ • Get GPS coords  │  │   weather         │  │ • Assess bubble       │   │
│  │ • Update Firestore│  │ • Update Firestore│  │   activity            │   │
│  └───────────────────┘  └───────────────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                     │
                    ▼                                     ▼
        ┌──────────────────┐                  ┌──────────────────┐
        │    Open-Meteo    │                  │ Cloud Vision API │
        │   (Weather API)  │                  │                  │
        │                  │                  │  • Object detect │
        │  • Free, no key  │                  │  • Fill level    │
        │  • Historical wx │                  │  • OCR (thermo)  │
        └──────────────────┘                  └──────────────────┘

                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BigQuery                                        │
│                                                                              │
│  • Firestore export (scheduled)                                             │
│  • SQL analytics across bake history                                        │
│  • Correlate weather, timing, outcomes                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Photo Upload

```
1. User takes/uploads photo
         │
         ▼
2. Frontend uploads to Firebase Storage
   Path: /users/{userId}/bakes/{bakeId}/photos/{photoId}.jpg
         │
         ▼
3. Storage trigger fires Cloud Function: extract_metadata
         │
         ▼
4. Function reads image, extracts EXIF:
   • Timestamp (DateTimeOriginal)
   • GPS coordinates (GPSLatitude, GPSLongitude)
         │
         ▼
5. Function writes metadata to Firestore photo document
         │
         ▼
6. Firestore trigger fires Cloud Function: fetch_weather
         │
         ▼
7. Function calls Open-Meteo API with:
   • Latitude, Longitude
   • Date/time from photo
         │
         ▼
8. Function updates Firestore with weather data:
   • Temperature
   • Humidity
   • Pressure
         │
         ▼
9. Storage trigger also fires: analyze_volume
         │
         ▼
10. Function calls Cloud Vision API:
    • Object detection
    • Estimate fill level
         │
         ▼
11. Function updates Firestore with analysis:
    • Fill level percentage
    • Bubble activity assessment
    • Confidence score
         │
         ▼
12. Frontend receives real-time update via Firestore listener
    • Displays weather info
    • Shows volume analysis
```

---

## Data Flow: Start New Bake

```
1. User taps "Start New Bake"
         │
         ▼
2. Frontend creates Firestore documents:
   • /users/{userId}/bakes/{bakeId}
   • /users/{userId}/bakes/{bakeId}/stages/stage1
   • /users/{userId}/bakes/{bakeId}/stages/stage2
   • ... (all 5 stages with defaults)
         │
         ▼
3. Frontend navigates to Stage 1 card (expanded)
         │
         ▼
4. User adjusts measurements if needed
   • +/- buttons update local state
   • Changes saved to Firestore on stage complete
         │
         ▼
5. User uploads baseline photo
   • Triggers photo flow (above)
         │
         ▼
6. User marks stage complete
   • Firestore updated with:
     - completedAt timestamp
     - Final measurements
     - Environment data
   • currentStage incremented
   • Next stage card expands
```

---

## Data Flow: Timer/Reminders

```
1. User enables timer toggle for stage
         │
         ▼
2. Frontend sets up timer:
   • Stores target time in local state
   • Registers with browser Notification API (if permitted)
         │
         ▼
3. Timer counts down (visible in UI)
         │
         ▼
4. At zero:
   • Browser notification fires (if tab backgrounded)
   • Audio chime plays (if enabled)
   • UI shows alert
         │
         ▼
5. User acknowledges or snoozes
   • Event logged to Firestore stage document
```

---

## Offline Behavior

### Service Worker Strategy
- **Static assets:** Cache-first (HTML, JS, CSS, images)
- **API calls:** Network-first with fallback to cache
- **Firestore:** Built-in offline persistence

### Offline Capabilities
| Feature | Offline Support |
|---------|-----------------|
| View current bake | Yes (cached data) |
| Adjust measurements | Yes (queued writes) |
| Upload photos | Queued until online |
| Timers | Yes (runs locally) |
| Weather lookup | No (requires network) |
| Vision analysis | No (requires network) |

### Sync on Reconnect
- Firestore automatically syncs queued writes
- Photos upload when connection restored
- Cloud Functions process backlog

---

## Authentication Flow

### Initial State (MVP)
- Anonymous authentication
- Single device, single user
- Data tied to anonymous UID

### Future State (Published App)
- Email/password or Google sign-in
- Data migrates from anonymous to permanent account
- Multi-device sync

```
1. App loads
         │
         ▼
2. Check for existing Firebase Auth session
         │
    ┌────┴────┐
    ▼         ▼
Exists     None
    │         │
    ▼         ▼
Use it    Sign in anonymously
    │         │
    └────┬────┘
         │
         ▼
3. Firestore security rules allow access to /users/{uid}/*
```

---

## Environment Configuration

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### Cloud Functions
- Environment variables set via Firebase CLI
- Secrets managed via Secret Manager for API keys (if needed)

### GCP Services to Enable
```bash
gcloud services enable vision.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
```

---

## Deployment Pipeline

### Frontend (Netlify)
```
1. Push to main branch
         │
         ▼
2. Netlify detects change
         │
         ▼
3. Runs: npm run build
         │
         ▼
4. Deploys dist/ to CDN
         │
         ▼
5. Live at: https://score-app.netlify.app
```

### Cloud Functions
```
1. cd functions/
         │
         ▼
2. firebase deploy --only functions
         │
         ▼
3. Functions deployed to GCP
         │
         ▼
4. Triggers automatically connected
```

---

## Monitoring & Debugging

### Firebase Console
- Auth: User sessions
- Firestore: Data explorer
- Storage: File browser
- Functions: Logs, invocations

### GCP Console
- Cloud Logging: Function logs, errors
- Cloud Monitoring: Metrics, alerts
- Vision API: Usage dashboard
- BigQuery: Query history, costs

### Local Development
```bash
# Start Firebase emulators
firebase emulators:start

# Emulates:
# - Firestore (localhost:8080)
# - Auth (localhost:9099)
# - Storage (localhost:9199)
# - Functions (localhost:5001)
```
