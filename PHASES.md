# Build Phases

## Overview

This document outlines the build phases, what's included in each, and acceptance criteria for completion.

---

## Phase 1: Frontend UI with Local State
**Goal:** Validate the workflow and UI before adding backend complexity

### Deliverables
- [x] React + Vite project scaffolded
- [x] Tailwind CSS configured with accessible theme
- [x] Card-based layout for 5 stages
- [x] Stage expand/collapse behavior
- [x] Measurement inputs with +/- buttons
- [x] Water temperature toggle
- [x] Recipe defaults loaded
- [x] Photo upload UI (placeholder, no actual upload)
- [x] Timer toggle UI (visual only)
- [x] "Start New Bake" flow
- [x] "Mark Stage Complete" progression
- [x] Basic responsive layout (mobile-first)

### Tech Used
- React + Vite
- Tailwind CSS
- Local state (useState/useReducer)

### Acceptance Criteria
- Can walk through all 5 stages
- Measurements are adjustable
- UI matches spec (ALL CAPS actions, distinct time styling)
- Works on mobile viewport

### Estimated Effort
3-5 hours

---

## Phase 2: Firebase Integration
**Goal:** Persist data, enable photo uploads

### Deliverables
- [x] Firebase project created
- [x] Firestore database initialized
- [x] Firebase Auth (anonymous) implemented
- [x] Firebase Storage configured
- [ ] Firestore security rules deployed *(rules written, need `firebase deploy --only firestore:rules,storage`)*
- [x] Create bake session in Firestore
- [x] Save stage data on completion
- [x] Photo upload to Storage working
- [x] Photo URLs stored in Firestore
- [ ] Real-time listeners for data updates *(hydration on load works; live listeners not yet added)*

### Tech Used
- Firebase SDK (v9 modular)
- Firestore
- Firebase Auth
- Firebase Storage

### Acceptance Criteria
- New bake creates Firestore documents
- Stage completion persists data
- Photos upload and display
- Data survives page refresh
- Works with anonymous auth

### Estimated Effort
4-6 hours

---

## Phase 3: Cloud Functions (Python)
**Goal:** Automate data extraction from photos

### Deliverables
- [x] Cloud Functions project initialized (Python runtime)
- [x] `extract_metadata` function
  - Triggered on Storage upload
  - Reads EXIF data (timestamp, GPS)
  - Updates Firestore photo document
- [x] `fetch_weather` function
  - Triggered on Firestore write (when metadata available)
  - Calls Open-Meteo API
  - Updates Firestore with weather data
- [x] `analyze_volume` function
  - Triggered on Storage upload
  - Calls Cloud Vision API
  - Estimates fill level
  - Updates Firestore with analysis
- [x] Error handling and logging
- [ ] Local emulator testing *(not yet tested)*
- [ ] Deploy Cloud Functions *(need `firebase deploy --only functions`, requires Blaze plan)*

### Tech Used
- Cloud Functions (Python 3.11)
- Pillow (EXIF extraction)
- requests (API calls)
- google-cloud-vision
- google-cloud-firestore

### Acceptance Criteria
- Photo upload triggers metadata extraction
- Weather data appears in UI after upload
- Volume analysis returns fill level estimate
- Errors logged, don't crash function

### Estimated Effort
6-8 hours

---

## Phase 4: PWA Configuration
**Goal:** Make app installable and work offline

### Deliverables
- [x] Vite PWA plugin configured *(with workbox runtime caching for Firebase Storage)*
- [x] Web manifest with icons
- [x] Service worker for caching
- [ ] Offline indicator in UI
- [x] Firestore offline persistence enabled *(via enableIndexedDbPersistence in firebase.js)*
- [ ] Install prompt handling *(browser default prompt works; no custom UI)*
- [x] App icons (multiple sizes) *(SVG placeholders — replace with proper branded PNGs later)*

### Tech Used
- vite-plugin-pwa
- Workbox (via plugin)

### Acceptance Criteria
- App installable on phone home screen
- Basic functionality works offline
- Queued writes sync when online
- Looks native (no browser chrome when installed)

### Estimated Effort
2-3 hours

---

## Phase 5: Timers and Notifications
**Goal:** Working timer system with optional reminders

### Deliverables
- [ ] Timer state management
- [ ] Countdown display in stage card
- [ ] Browser Notification API integration
- [ ] Permission request flow
- [ ] Audio chime option
- [ ] Stretch & fold interval reminders
- [ ] Timer events logged to Firestore
- [ ] Global timer toggle (all on/off)
- [ ] Per-stage timer toggles

### Tech Used
- React state/effects
- Notification API
- Web Audio API (for chime)

### Acceptance Criteria
- Timers count down visibly
- Notifications fire when tab backgrounded
- User can enable/disable per stage
- Timer state survives page refresh

### Estimated Effort
3-4 hours

---

## Phase 6: Volume Comparison UI
**Goal:** Side-by-side photo comparison with assessment

### Deliverables
- [ ] Baseline photo display in stage card
- [ ] "Add Check Photo" button
- [ ] Side-by-side comparison view
- [ ] Vision API results displayed (if available)
- [ ] Manual assessment selector
  - Not ready
  - Almost there
  - Doubled (target)
  - Past peak
- [ ] Assessment saved to Firestore

### Tech Used
- React components
- CSS grid/flexbox for comparison layout

### Acceptance Criteria
- Can add multiple check photos per stage
- Side-by-side clearly shows difference
- Assessment stored with stage data

### Estimated Effort
2-3 hours

---

## Phase 7: History View (Placeholder)
**Goal:** Basic list of past bakes

### Deliverables
- [ ] History page/view
- [ ] List of completed bakes
- [ ] Basic info per bake (date, duration, rating)
- [ ] Tap to view details (read-only)
- [ ] Placeholder for analytics

### Tech Used
- Firestore queries
- React Router (if not already added)

### Acceptance Criteria
- Past bakes listed in reverse chronological order
- Can view details of any past bake
- No edit capability (read-only)

### Estimated Effort
2-3 hours

---

## Phase 8: BigQuery Integration
**Goal:** Enable SQL analytics on bake history

### Deliverables
- [ ] Firestore to BigQuery export configured
- [ ] Export schedule (daily)
- [ ] BigQuery dataset and tables created
- [ ] Sample queries documented
- [ ] (Optional) Simple dashboard or query interface

### Tech Used
- Firestore BigQuery extension
- BigQuery SQL

### Acceptance Criteria
- Data exports to BigQuery automatically
- Can run SQL queries on bake history
- Documentation includes useful query examples

### Estimated Effort
2-4 hours

---

## Phase 5.5: Beta Deploy
**Goal:** Get Score in front of real testers via a shareable URL

### Deliverables
- [ ] Deploy to Netlify (score-app.netlify.app or custom domain) *(netlify.toml ready, need to connect repo + set env vars)*
- [ ] Full auth upgrade (email/Google sign-in so testers have accounts) *(deferred — anonymous auth used for beta)*
- [ ] Basic onboarding screen (brief intro for new users) *(deferred — explain verbally to testers)*
- [x] Feedback mechanism (in-app link to form or email) *(link in Header.jsx — need to replace placeholder URL with real Google Form)*
- [ ] Bug reporting instructions for testers
- [ ] Privacy policy (basic, covers data collection) *(deferred for private beta)*
- [ ] Recruit 5-10 sourdough bakers to test

### Tech Used
- Netlify
- Firebase Auth (email + Google provider)
- Google Forms or Typeform for feedback

### Acceptance Criteria
- Testers can sign up, bake, and provide feedback
- Data persists across sessions per user
- App is installable as PWA from shared link
- Feedback channel is active and monitored

### Estimated Effort
3-4 hours

---

## Future Phases (Not Scheduled)

### Phase 9: Enhanced Analytics
- Correlation analysis (weather vs outcomes)
- Trend charts over time
- Predictive suggestions

### Phase 10: Multi-User / App Store
- Full authentication (email, Google) — if not done in 5.5
- User onboarding flow
- Data migration from anonymous
- iOS/Android wrapper (Capacitor)
- TestFlight (iOS) and Google Play closed testing
- App Store submission

### Phase 11: Advanced Vision Features
- Custom trained model for your specific jars
- Thermometer OCR
- Crumb structure analysis from outcome photos

---

## Summary Timeline

| Phase | Description | Effort | Cumulative |
|-------|-------------|--------|------------|
| 1 | Frontend UI | 3-5 hrs | 3-5 hrs |
| 2 | Firebase Integration | 4-6 hrs | 7-11 hrs |
| 3 | Cloud Functions | 6-8 hrs | 13-19 hrs |
| 4 | PWA Configuration | 2-3 hrs | 15-22 hrs |
| 5 | Timers & Notifications | 3-4 hrs | 18-26 hrs |
| 5.5 | Beta Deploy | 3-4 hrs | 21-30 hrs |
| 6 | Volume Comparison UI | 2-3 hrs | 23-33 hrs |
| 7 | History View | 2-3 hrs | 25-36 hrs |
| 8 | BigQuery Integration | 2-4 hrs | 27-40 hrs |

**Total estimated: 27-40 hours** (spread across multiple sessions)

---

## Phase Completion Checklist

Use this to track progress:

```
[x] Phase 1: Frontend UI
[~] Phase 2: Firebase Integration (code complete, rules need deploying, real-time listeners pending)
[~] Phase 3: Cloud Functions (code written, not deployed or tested)
[~] Phase 4: PWA Configuration (mostly done, no offline indicator or install prompt UI)
[ ] Phase 5: Timers & Notifications
[ ] Phase 5.5: Beta Deploy (config ready, need to deploy + create feedback form)
[ ] Phase 6: Volume Comparison UI
[ ] Phase 7: History View
[ ] Phase 8: BigQuery Integration
```

### Next Steps to Launch Beta
1. `firebase deploy --only firestore:rules,storage` — deploy security rules
2. Create Google Form for feedback, update URL in `src/components/Header.jsx`
3. Deploy to Netlify — connect repo, set `VITE_FIREBASE_*` env vars in dashboard
4. Test end-to-end: `npm run dev` → auth → start bake → refresh → data persists → photo upload
5. (Optional) `firebase deploy --only functions` — deploy Cloud Functions (requires Blaze plan)
