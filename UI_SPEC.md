# UI Specification

## Overview

This document defines the user interface design decisions, styling requirements, and accessibility considerations.

---

## Layout

### Card-Based Dashboard
- Current/active stage displayed prominently as expanded card
- Other stages shown as collapsed cards (tap to expand)
- Progress indicator showing which stages are complete
- Sticky header with bake session info (start time, elapsed time)

### Stage Card Structure (Expanded)
```
┌─────────────────────────────────────────┐
│ Stage 2: Mix Dough          [5-8+ hrs]  │
├─────────────────────────────────────────┤
│                                         │
│ In a bowl, ADD:                         │
│   350g water        [—] [350] [+]       │
│   Water temp:       ○ Room  ● Warmed    │
│                                         │
│   50g starter       [—] [50]  [+]       │
│   WHISK until foamy & no clumps         │
│                                         │
│   500g flour        [—] [500] [+]       │
│   MIX until no dry clumps               │
│                                         │
│   15g salt          [—] [15]  [+]       │
│   MIX again                             │
│                                         │
│ COVER & let rest                        │
│                                  30 min │
├─────────────────────────────────────────┤
│ 📷 Baseline Photo    [Upload] [Camera]  │
├─────────────────────────────────────────┤
│ Timer: Stretch & Fold    [Toggle: OFF]  │
├─────────────────────────────────────────┤
│           [Mark Stage Complete]         │
└─────────────────────────────────────────┘
```

### Stage Card Structure (Collapsed)
```
┌─────────────────────────────────────────┐
│ ✓ Stage 1: Starter Build    [Overnight] │
└─────────────────────────────────────────┘
```

---

## Typography

### Dyslexic-Friendly Requirements
- **Font:** OpenDyslexic, Lexie Readable, or system sans-serif fallback
- **Line height:** 1.5 minimum
- **Letter spacing:** Slightly increased (0.05em)
- **Word spacing:** Slightly increased
- **Paragraph width:** Max 70 characters per line
- **No justified text:** Left-align all text
- **No italics:** Use bold for emphasis instead

### Text Hierarchy
| Element | Style |
|---------|-------|
| Stage title | 20px, bold |
| Instructions | 16px, regular |
| Action words | 16px, bold, ALL CAPS |
| Times/durations | 16px, distinct color (see Colors) |
| Input labels | 14px, regular |
| Notes/hints | 14px, muted color |

### Action Words (ALL CAPS)
These words should always appear in bold uppercase:
- ADD
- STIR
- WHISK
- MIX
- COVER
- LEAVE
- COMPLETE
- REPEAT
- SHAPE
- PUT
- PREHEAT
- SCORE
- BAKE
- TAKE
- TURN
- WAIT

---

## Colors

### Base Palette (Light Theme)
| Role | Color | Hex |
|------|-------|-----|
| Background | Off-white | #FAFAFA |
| Card background | White | #FFFFFF |
| Primary text | Dark gray | #333333 |
| Secondary text | Medium gray | #666666 |
| Time/duration | Warm accent | #B8860B (dark goldenrod) |
| Action buttons | Primary blue | #2563EB |
| Success/complete | Green | #16A34A |
| Border | Light gray | #E5E5E5 |

### Time Display
- All time-related information uses the warm accent color (#B8860B)
- Includes: stage duration estimates, countdown timers, elapsed time, time markers

### Accessibility
- Contrast ratio minimum 4.5:1 for normal text
- Contrast ratio minimum 3:1 for large text
- No color-only indicators (always pair with icon or text)

---

## Components

### Measurement Input
```
[—] [350] [+]
```
- Minus button decreases by increment (5g for small amounts, 25g for large)
- Plus button increases by increment
- Center shows current value, tappable to type exact number
- Default values loaded from recipe

### Water Temperature Toggle
```
○ Room temp  ● Warmed
```
- Radio button style
- Mutually exclusive options
- Default: Room temp

### Photo Upload
```
[Upload from Library] [Take Photo]
```
- Two distinct buttons
- Upload opens file picker
- Camera opens device camera (if available)
- After upload, shows thumbnail with option to replace

### Timer Toggle
```
Timer: Stretch & Fold reminders    [====○]
                                    OFF
```
- Slide toggle, clearly labeled
- Shows ON/OFF state explicitly
- When ON, shows countdown or next reminder time

### Stage Complete Button
```
[Mark Stage Complete →]
```
- Primary action button
- Advances to next stage
- Logs completion timestamp

---

## Photo Capture Flow

### Baseline Photo
1. User taps "Upload" or "Camera"
2. Photo selected/taken
3. App extracts metadata (timestamp, GPS)
4. Cloud Function fetches weather
5. Card updates to show:
   - Thumbnail
   - Captured time
   - Location (city/region)
   - Outdoor temp/humidity

### Check Photo (Volume Comparison)
1. User taps "Add Check Photo"
2. Photo selected/taken
3. App shows side-by-side with baseline
4. Cloud Vision analyzes for volume change
5. User confirms or adjusts assessment:
   - Not ready
   - Almost there
   - Doubled (target reached)
   - Past peak

---

## Timer/Reminder Behavior

### When Timer is ON
- Countdown displays in stage card
- Browser notification when timer completes (if permissions granted)
- Audio chime option (toggle in settings)

### Stretch & Fold Reminders
- First reminder: 30 min after bulk start
- Subsequent: Every 30 min
- User can mark each fold as done or skip
- Stops after 2-3 hours or when user ends bulk phase

### Stage Duration Estimates
- Displayed at top right of each stage card
- Format: `[5-8+ hrs]` or `[30 min]`
- Not a countdown, just reference information

---

## Navigation

### Main Views
1. **Active Bake** - Current bake session workflow
2. **History** - Past bakes (placeholder for now)
3. **Settings** - Timer preferences, defaults, account

### Header
```
┌─────────────────────────────────────────┐
│ 🍞 SCORE                    [Settings]  │
├─────────────────────────────────────────┤
│ Bake started: Jan 31, 2:30 PM           │
│ Elapsed: 4h 22m                         │
└─────────────────────────────────────────┘
```

### Bottom Navigation (if needed)
```
[ Active Bake ]  [ History ]  [ Settings ]
```

---

## Responsive Behavior

### Mobile (Primary Target)
- Single column layout
- Cards full width with padding
- Touch-friendly tap targets (44px minimum)

### Tablet/Desktop
- Centered content, max-width 600px
- Same card layout, more whitespace

---

## Empty States

### No Active Bake
```
┌─────────────────────────────────────────┐
│                                         │
│         No active bake session          │
│                                         │
│         [Start New Bake]                │
│                                         │
└─────────────────────────────────────────┘
```

### No History
```
┌─────────────────────────────────────────┐
│                                         │
│      No bakes recorded yet              │
│      Start your first bake to begin     │
│      tracking!                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## Animations

- Keep minimal for accessibility
- Card expand/collapse: subtle height transition (200ms)
- Button press: slight scale feedback
- No auto-playing animations
- Respect `prefers-reduced-motion` setting
