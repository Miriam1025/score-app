# Data Model

## Overview

This document defines the Firestore database structure, document schemas, and relationships.

---

## Collections

```
/users
  /{userId}
    /bakes
      /{bakeId}
        /stages
          /{stageId}
        /photos
          /{photoId}
    /settings
      /preferences
```

---

## Document Schemas

### User Document
**Path:** `/users/{userId}`

```javascript
{
  id: string,                    // Firebase Auth UID
  email: string,                 // Optional, if using email auth
  displayName: string,           // Optional
  createdAt: timestamp,
  lastActiveAt: timestamp,
  
  // Default recipe values (can customize)
  defaults: {
    stage1: {
      starter: 50,               // grams
      water: 50,
      flour: 50
    },
    stage2: {
      water: 350,
      starter: 50,
      flour: 500,
      salt: 15
    }
  }
}
```

### Bake Session Document
**Path:** `/users/{userId}/bakes/{bakeId}`

```javascript
{
  id: string,                    // Auto-generated
  status: string,                // "active" | "completed" | "abandoned"
  currentStage: number,          // 1-5
  
  startedAt: timestamp,
  completedAt: timestamp | null,
  
  // Aggregated outcome data (filled in Stage 5)
  outcome: {
    ovenSpring: string,          // "poor" | "moderate" | "good" | "excellent"
    crustColor: string,          // "pale" | "golden" | "dark"
    crumbStructure: string,      // "tight" | "moderate" | "open"
    flavorNotes: string,         // Free text
    overallRating: number        // 1-5
  } | null,
  
  // Summary stats (computed)
  totalDuration: number,         // minutes from start to complete
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Stage Document
**Path:** `/users/{userId}/bakes/{bakeId}/stages/{stageId}`

```javascript
{
  id: string,                    // "stage1", "stage2", etc.
  stageNumber: number,           // 1-5
  name: string,                  // "Starter Build", "Mix Dough", etc.
  status: string,                // "pending" | "active" | "completed"
  
  startedAt: timestamp | null,
  completedAt: timestamp | null,
  duration: number | null,       // minutes
  
  // Measurements used (actual values for this bake)
  measurements: {
    // Stage 1
    starter: number | null,
    water: number | null,
    flour: number | null,
    salt: number | null,         // Stage 2 only
    
    waterTemp: string | null     // "room" | "warmed"
  },
  
  // Environment data (from photo metadata + weather API)
  environment: {
    indoorTemp: number | null,   // Fahrenheit, manual entry
    outdoorTemp: number | null,  // Fahrenheit, from weather API
    humidity: number | null,     // Percentage, from weather API
    pressure: number | null,     // hPa, from weather API
    location: {
      lat: number,
      lng: number,
      city: string | null,
      region: string | null
    } | null
  },
  
  // Volume tracking
  volume: {
    baselinePhotoId: string | null,
    checkPhotoId: string | null,
    estimatedRise: number | null,    // e.g., 2.0 for doubled
    userAssessment: string | null    // "not_ready" | "almost" | "target" | "past_peak"
  },
  
  // Timer usage
  timerEnabled: boolean,
  timerEvents: [
    {
      type: string,              // "started" | "paused" | "completed" | "skipped"
      label: string,             // "Stretch & Fold 1", etc.
      timestamp: timestamp
    }
  ],
  
  notes: string | null,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Photo Document
**Path:** `/users/{userId}/bakes/{bakeId}/photos/{photoId}`

```javascript
{
  id: string,                    // Auto-generated
  stageId: string,               // Reference to stage
  type: string,                  // "baseline" | "check" | "outcome"
  
  // Storage reference
  storagePath: string,           // Path in Firebase Storage
  downloadUrl: string,           // Public URL for display
  
  // Extracted metadata
  metadata: {
    takenAt: timestamp | null,   // From EXIF
    latitude: number | null,     // From EXIF GPS
    longitude: number | null,
    deviceModel: string | null,
    originalFilename: string | null
  },
  
  // Weather data (fetched based on location + time)
  weather: {
    temperature: number | null,  // Fahrenheit
    humidity: number | null,     // Percentage
    pressure: number | null,     // hPa
    conditions: string | null,   // "sunny", "cloudy", etc.
    fetchedAt: timestamp
  } | null,
  
  // Vision API analysis
  analysis: {
    fillLevel: number | null,    // 0-100 percentage
    bubbleActivity: string | null, // "low" | "moderate" | "high"
    confidence: number | null,   // 0-1
    rawResponse: object | null,  // Full Vision API response for debugging
    analyzedAt: timestamp
  } | null,
  
  uploadedAt: timestamp,
  createdAt: timestamp
}
```

### User Preferences Document
**Path:** `/users/{userId}/settings/preferences`

```javascript
{
  // Timer defaults
  timers: {
    stretchFoldReminders: boolean,   // Default: true
    bulkFermentationAlert: boolean,  // Default: true
    coldProofReminder: boolean,      // Default: false
    preheatReminder: boolean,        // Default: true
    bakeTimers: boolean              // Default: true
  },
  
  // Notification settings
  notifications: {
    browserEnabled: boolean,
    soundEnabled: boolean
  },
  
  // Display preferences
  display: {
    temperatureUnit: string,         // "fahrenheit" | "celsius"
    weightUnit: string               // "grams" | "ounces"
  },
  
  updatedAt: timestamp
}
```

---

## Indexes

### Required Composite Indexes

```
Collection: users/{userId}/bakes
Fields: status ASC, startedAt DESC
Purpose: Query active bakes, recent bakes

Collection: users/{userId}/bakes
Fields: completedAt DESC
Purpose: History view sorted by completion

Collection: users/{userId}/bakes/{bakeId}/photos
Fields: stageId ASC, type ASC
Purpose: Get baseline and check photos for a stage
```

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /bakes/{bakeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        match /stages/{stageId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        match /photos/{photoId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
      
      match /settings/{document} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## BigQuery Export Schema

When exported to BigQuery for SQL analysis, the flattened schema:

### bakes table
| Column | Type |
|--------|------|
| user_id | STRING |
| bake_id | STRING |
| status | STRING |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP |
| total_duration_minutes | INTEGER |
| outcome_oven_spring | STRING |
| outcome_crumb_structure | STRING |
| outcome_rating | INTEGER |

### stages table
| Column | Type |
|--------|------|
| user_id | STRING |
| bake_id | STRING |
| stage_id | STRING |
| stage_number | INTEGER |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP |
| duration_minutes | INTEGER |
| water_grams | INTEGER |
| flour_grams | INTEGER |
| starter_grams | INTEGER |
| water_temp | STRING |
| outdoor_temp_f | FLOAT |
| humidity_pct | FLOAT |
| estimated_rise | FLOAT |
| user_assessment | STRING |

### Example SQL Query
```sql
-- Correlate outdoor temperature to rise assessment
SELECT 
  outdoor_temp_f,
  user_assessment,
  COUNT(*) as count,
  AVG(duration_minutes) as avg_duration
FROM stages
WHERE stage_number = 1
  AND user_assessment IS NOT NULL
GROUP BY outdoor_temp_f, user_assessment
ORDER BY outdoor_temp_f;
```
