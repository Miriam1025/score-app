# Tech Stack

## Overview

This document details each technology choice and the rationale behind it.

---

## Frontend

### React + Vite
- **What:** Modern React framework with fast build tooling
- **Why:** Fast hot reload for development, optimized production builds, excellent PWA plugin ecosystem
- **Alternative considered:** Next.js (overkill for this use case, adds server complexity)

### Tailwind CSS
- **What:** Utility-first CSS framework
- **Why:** Easy to customize for accessibility requirements, clean output, rapid prototyping
- **Accessibility notes:** Will configure for dyslexic-friendly fonts, high contrast, clear visual hierarchy

### Vite PWA Plugin
- **What:** Plugin that adds Progressive Web App capabilities
- **Why:** Makes app installable on phone home screen, enables offline support, better than bookmark
- **Features used:** Service worker, web manifest, offline caching

---

## Backend / GCP Services

### Firestore
- **What:** NoSQL document database (Firebase/GCP)
- **Why:** Real-time sync, offline support, scales automatically, integrates with other Firebase services
- **Structure:** Collections for users, bake sessions, individual stage logs
- **Export:** Native BigQuery export for SQL analytics

### Firebase Auth
- **What:** Authentication service
- **Why:** Handles user accounts if app is published, integrates seamlessly with Firestore security rules
- **Initial use:** Anonymous auth or single user, upgrade path to full auth later

### Firebase Storage
- **What:** File/blob storage for photos
- **Why:** Integrated with Firebase Auth for security, handles image uploads, serves images efficiently
- **Usage:** Store baseline and check photos for each stage

### Cloud Functions (Python)
- **What:** Serverless functions triggered by events or HTTP
- **Why:** Python runtime matches user's skillset, handles backend logic securely
- **Runtime:** Python 3.11+
- **Triggers:**
  - Firestore write (process new photo uploads)
  - HTTP (manual triggers if needed)

**Functions to build:**
| Function | Trigger | Purpose |
|----------|---------|---------|
| `extract_metadata` | Storage upload | Read EXIF data from photo, store in Firestore |
| `fetch_weather` | Firestore write | Get weather for location/time, update document |
| `analyze_volume` | Storage upload | Call Vision API, estimate fill level |

### Cloud Vision API
- **What:** Image analysis service
- **Why:** Automates volume tracking from photos, can detect fill levels, potentially read thermometer
- **Features used:**
  - Object detection (jar, liquid level)
  - OCR (if thermometer in frame)
- **Cost:** Free tier includes 1,000 units/month

### BigQuery
- **What:** Data warehouse with SQL interface
- **Why:** User is skilled in SQL, enables complex analysis across bake history
- **Integration:** Firestore scheduled export to BigQuery
- **Use cases:**
  - Correlate weather conditions to rise times
  - Identify optimal temperature ranges
  - Track improvement over time

---

## External APIs

### Open-Meteo
- **What:** Free weather API
- **Why:** No API key required, supports historical weather lookup, accurate data
- **Endpoint:** Historical weather by lat/long and date
- **Data captured:** Temperature, humidity, barometric pressure

---

## Hosting

### Netlify (Frontend)
- **What:** Static site hosting with CI/CD
- **Why:** User has existing account, free tier sufficient, easy deploy from Git
- **Features:** Auto-deploy on push, preview deploys, custom domain support

### Firebase Hosting (Alternative)
- **What:** Could host frontend on Firebase instead
- **Why not (for now):** User prefers Netlify, keeps frontend hosting separate from backend

---

## Development Tools

### VS Code
- **What:** Code editor / IDE
- **Why:** User preference, excellent extensions, works well with all stack components
- **Recommended extensions:**
  - ES7+ React snippets
  - Tailwind CSS IntelliSense
  - Firebase Explorer
  - Python
  - Prettier

### Firebase CLI
- **What:** Command line tools for Firebase
- **Why:** Deploy functions, manage Firestore, local emulation
- **Key commands:**
  - `firebase emulators:start` (local dev)
  - `firebase deploy --only functions`

### Google Cloud CLI
- **What:** Command line tools for GCP
- **Why:** Manage Cloud Vision API, BigQuery, IAM permissions
- **Key commands:**
  - `gcloud auth login`
  - `gcloud services enable vision.googleapis.com`

---

## Cost Considerations

### Firebase Blaze Plan
- Pay-as-you-go but includes free tier allowances
- For personal use, likely $0/month
- Set budget alerts at $1 threshold

### Free Tier Limits (Monthly)
| Service | Free Allowance |
|---------|----------------|
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Firestore storage | 1 GB |
| Cloud Functions invocations | 2 million |
| Cloud Vision API | 1,000 units |
| Firebase Storage | 5 GB |
| BigQuery queries | 1 TB |

---

## Future Considerations

### If Publishing to App Store
- React Native or Capacitor wrapper for native app
- Full Firebase Auth with email/social login
- Firestore security rules per user
- Terms of service, privacy policy

### Potential Additions
- Vertex AI for custom model training (predict outcomes from photos)
- Cloud Scheduler for push notifications
- Cloud Pub/Sub if event architecture grows complex
