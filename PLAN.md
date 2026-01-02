# FoodMood - Development Plan

## Overview

FoodMood is a web application that helps kids track their diet, activities, and mood over time to understand relationships between food, activities, and emotional state.

## Core Features

### Interaction Model

All three categories (Food, Activities, Moods) work identically:

- **Tap emoji** → Adds one instance to the list
- **Tap same emoji multiple times** → Adds multiple instances (portions/intensity/frequency)
- **Tap item in list** → Removes one instance
- **Visual feedback**: List shows each item with count badge (e.g., "😊 x3" = really happy)

### 1. Daily Entry Form (Today Tab)

- **What You Ate** (emoji-based, tap to add)

  - 🍎 Fruits
  - 🥦 Vegetables
  - 🥩 Meat/Protein
  - 🍞 Carbs
  - 🍪 Sweet Snacks
  - 🥨 Salty Snacks

  - Tap emoji to add to list (can tap multiple times for portions)
  - Tap item in list to remove
  - Visual list showing selected items with counts

- **What You Did** (emoji-based, tap to add)

  - 📺 Screens/TV/iPad
  - 💃 Dance
  - 🏫 School
  - 🌳 Play Outside
  - 🧸 Play with Toys
  - 🎨 Arts and Crafts

  - Tap emoji to add to list (can tap multiple times for portions/frequency)
  - Multiple taps = multiple occurrences (e.g., 3 dance = 3 classes, 3 iPad = morning/afternoon/night sessions)
  - Tap item in list to remove

- **How You Felt** (emoji-based, tap to add, multiple taps = intensity)

  - 😴 Sleepy
  - 😊 Happy
  - 😢 Sad
  - 😠 Angry/Frustrated
  - 😰 Anxious/Worried
  - 😌 Calm/Peaceful
  - 🤩 Excited
  - 😑 Bored
  - Wide awake (could use 😊 or 🤩 for high energy)

  - Multiple moods allowed per day
  - Multiple taps on same mood = intensity (e.g., 3 happy emojis = really happy)
  - Tap item in list to remove

- **Form Behavior**
  - Editable throughout the day
  - Auto-saves as user interacts
  - Resets to blank at midnight (new day)
  - Shows current date

### 2. Charts Tab

Visualize relationships and patterns:

- **Time Series Charts**
  - Daily mood trends over time
  - Daily food intake trends (by category)
  - Daily activity trends
- **Correlation Charts**
  - Food vs Mood scatter plots
  - Activity vs Mood relationships
  - Food categories vs Mood heatmap
- **Aggregate Views**
  - Most common foods eaten
  - Most common activities
  - Mood distribution (pie chart or bar chart)
  - Weekly/monthly summaries
- **Pattern Detection**
  - "On days you ate more vegetables, you felt..."
  - "On days you played outside, you felt..."
  - "On days you had more screens, you felt..."

## Technical Architecture

### Data Storage

- **IndexedDB** (preferred over localStorage)
  - Better for structured data
  - Handles larger datasets
  - Supports queries and indexing
  - Works offline
  - More robust for historical data

### Data Model

```typescript
interface DailyEntry {
  id: string; // UUID or date-based
  date: string; // ISO date string (YYYY-MM-DD)
  timestamp: number; // Last modified timestamp

  foods: FoodEntry[];
  activities: ActivityEntry[];
  moods: MoodEntry[];
}

interface FoodEntry {
  category: "fruits" | "vegetables" | "meat" | "carbs" | "sweet" | "salty";
  count: number; // Number of portions (multiple taps = multiple portions)
  emoji: string;
}

interface ActivityEntry {
  type: "screens" | "dance" | "school" | "outside" | "toys" | "arts";
  count: number; // Number of occurrences (e.g., 3 dance = 3 classes, 3 iPad = multiple sessions)
  emoji: string;
}

interface MoodEntry {
  emotion:
    | "sleepy"
    | "happy"
    | "sad"
    | "angry"
    | "anxious"
    | "calm"
    | "excited"
    | "bored";
  count: number; // Number of times this mood was selected (represents intensity/frequency)
  emoji: string;
}
```

### Database Schema (IndexedDB)

- **Store: `entries`**
  - Key: date (YYYY-MM-DD)
  - Index: date, timestamp
- **Store: `foods`** (optional denormalization for faster queries)
- **Store: `activities`** (optional denormalization)
- **Store: `moods`** (optional denormalization)

### Export/Import

- **Export Format**: JSON
  ```json
  {
    "version": "1.0",
    "exportDate": "2024-01-15T10:30:00Z",
    "entries": [...]
  }
  ```
- **Export Button**: Downloads JSON file
- **Import Button**: File picker, validates format, merges or replaces data
- **Backup/Restore**: Full database export/import

## UI/UX Design

### Layout

- **Tab Navigation**: Today | Charts
- **Mobile-first**: Touch-friendly, large tap targets
- **Kid-friendly**: Large emojis, simple interactions
- **Colorful**: Engaging but not overwhelming

### Today Tab

- Date display at top
- Three sections: What You Ate | What You Did | How You Felt
- Each section has emoji buttons (large, touch-friendly)
- Tap emoji to add (multiple taps = multiple portions/intensity)
- Selected items shown as list below with counts
- Tap item in list to remove one instance
- Save indicator (auto-save)

### Charts Tab

- Multiple chart types
- Date range selector (last week, last month, all time)
- Interactive charts (hover for details)
- Summary statistics

## Technology Stack

### Frontend

- **React** + **TypeScript** (already set up)
- **Chakra UI** (already set up)
- **IndexedDB wrapper**: `idb` or `dexie.js` (recommended: Dexie.js for easier API)
- **Charts**: `recharts` (React-friendly) or `chart.js` with `react-chartjs-2`
- **Date handling**: `date-fns` or native `Intl.DateTimeFormat`
- **UUID generation**: `uuid` or `crypto.randomUUID()`

### Build Tools

- **Vite** (already set up)
- **TypeScript** (already set up)

## Implementation Phases

### Phase 1: Core Data Layer

1. Set up IndexedDB with Dexie.js
2. Define data models and types
3. Create database service layer
4. Implement CRUD operations
5. Test data persistence

### Phase 2: Today Form

1. Create Today tab component
2. Build emoji selection UI for foods
3. Build emoji selection UI for activities
4. Build mood selection UI
5. Implement add/remove functionality
6. Implement auto-save
7. Implement midnight reset logic

### Phase 3: Charts & Analytics

1. Install charting library
2. Create Charts tab component
3. Build time series charts
4. Build correlation charts
5. Build aggregate views
6. Add date range filtering
7. Add pattern detection insights

### Phase 4: Export/Import

1. Implement export functionality
2. Implement import functionality
3. Add validation and error handling
4. Add backup/restore UI

### Phase 5: Polish & Testing

1. Responsive design refinement
2. Offline functionality testing
3. Performance optimization
4. Accessibility improvements
5. User testing with target audience

## Key Libraries to Add

```json
{
  "dependencies": {
    "dexie": "^3.2.4", // IndexedDB wrapper
    "recharts": "^2.10.3", // Charting library
    "date-fns": "^3.0.0", // Date utilities
    "uuid": "^9.0.1" // UUID generation (or use crypto.randomUUID)
  }
}
```

## Data Persistence Strategy

### Daily Entry Lifecycle

1. User opens app → Check if entry exists for today
2. If exists → Load and display
3. If not → Create new entry
4. User makes changes → Auto-save to IndexedDB
5. At midnight → Next day creates new entry

### Midnight Reset Logic

- Use `setInterval` to check if date changed
- Or use `Date` comparison on app focus/visibility change
- Clear form state, create new entry for new day

## Offline Functionality

- Service Worker (optional, for true offline-first)
- IndexedDB works offline by default
- All data stored locally
- Export/Import works offline

## Future Enhancements (Post-MVP)

- Multiple user profiles
- Parent dashboard/view
- Notifications/reminders
- Photo attachments
- Custom food/activity categories
- Sharing reports with family/doctors
- Data insights and recommendations

## Design Decisions (Resolved)

1. **Mood selection**: Multiple moods allowed per day
2. **Mood intensity**: Multiple taps on same mood = intensity (e.g., 3 happy emojis = really happy)
3. **Activity tracking**: No duration tracking - just count/portions (e.g., 3 dance = 3 classes, 3 iPad = multiple sessions)
4. **Food portions**: Simple count system - multiple taps = multiple portions
5. **Unified approach**: All three categories (food, activities, moods) work the same way - tap to add, multiple taps = more portions/intensity/frequency

## Success Metrics

- App loads and works offline
- Data persists across browser sessions
- Export/Import works correctly
- Charts render meaningful insights
- Kid-friendly and engaging UI
- Fast and responsive interactions
