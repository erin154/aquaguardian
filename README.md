## 💧 AquaGuardian — Household Water Conservation App

**Live App:** [aquaguardian-jet.vercel.app](https://aquaguardian-jet.vercel.app)

AquaGuardian is a family-focused **Progressive Web App** that turns household water conservation into an emotionally rewarding daily habit.

The app centers around a living **water spirit companion** whose health rises and falls based on your household's real water usage. Log a shower, run the sprinklers, do laundry — the spirit reacts. Let it suffer long enough and it triggers a recovery challenge. Keep your streak and it grows stronger.

### ✨ Features

- **Water Spirit with Health System** — A 5-stage companion that evolves over months of conservation. Health is delta-based and synced to Firestore as a single source of truth, so it stays consistent across every family device.
- **Activity Logger** — 6 appliance types (Shower, Dishes, Sprinklers, Laundry, Sink, Car Wash), each with national average benchmarks and personal goals. Entries are color-coded green/orange/red against the goal.
- **GoalBar** — Real-time daily progress bar that fills and changes color as usage climbs toward or past the household goal.
- **Recovery Challenges** — When spirit health drops below 30, a specific achievable challenge is offered immediately, with an instant health reward on acceptance.
- **Rotating Insight Cards** — 5 behavioral psychology card types (reframes, comparisons, streaks, projections, nature impact). Never repeats two sessions in a row.
- **Bill Estimator** — Calculates today's cost and month-end projection from your household's actual $/gallon rate, persisted in Firestore.
- **Usage Analytics** — Historical usage charts, appliance breakdown, and a 7-day × 24-hour usage heatmap.
- **Streak Tracking** — Day-boundary-aware consecutive goal streak, synced to Firestore and displayed on the dashboard.
- **Firebase Auth** — Email + password login. One shared account per household.
- **PWA** — Installable on iPhone via Safari "Add to Home Screen." Works offline gracefully.

### 🏗️ Architecture

The app follows a clean **frontend → Firestore → all devices** pattern. Firebase Auth gates every session; all usage data lives in two Firestore collections (`logs/{autoId}` and `households/{uid}`) so the entire family sees the same spirit health and streak in real time — no per-device drift.
User action (log activity)
↓
React state update (instant UI feedback)
↓
Firestore write (persisted, real-time synced)
↓
onSnapshot listener (all family devices update live)

The component tree is modular — `App.jsx` is a pure orchestrator, with all UI components split into `src/components/` and shared constants in `src/constants/`.

### 🗂️ Key File Structure
src/
├── App.jsx              # Route orchestrator only
├── Auth.jsx             # Login / signup screen
├── firebase.js          # Firebase init (db + auth exports)
├── main.jsx             # Entry point
├── components/
│   ├── DashboardPage.jsx
│   ├── AnalyticsPage.jsx
│   ├── BillPage.jsx
│   ├── SettingsPage.jsx
│   ├── SpiritWidget.jsx
│   ├── ActivityLogger.jsx
│   ├── GoalBar.jsx
│   ├── InsightCard.jsx
│   ├── LogHistory.jsx
│   ├── BillSummary.jsx
│   └── BottomNav.jsx
└── constants/           # Shared activity definitions, goals

### 🔭 Roadmap

- [ ] Live activity timer with real-time elapsed counter
- [ ] ESP32 + Firebase Realtime Database IoT integration (YF-S201 flow meters)
- [ ] FCM push notifications for family nudges
- [ ] Animated SVG water spirit (replacing emoji stages)
- [ ] Tiered billing rate support

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 (Vite) |
| **Routing** | React Router v6 |
| **Styling** | CSS Modules + inline styles |
| **Backend / Database** | Firebase Firestore (real-time sync) |
| **Authentication** | Firebase Auth (email + password) |
| **Hosting** | Vercel (auto-deploy on git push) |
| **PWA** | Web App Manifest + Apple meta tags |
| **Build Tool** | Vite |
| **Package Manager** | npm |
| **Version Control** | Git + GitHub |
| **IDE** | VS Code |
| **Dev Server** | localhost:5173 (Vite HMR) |
| **Platform** | macOS |
| **Target Device** | iOS (iPhone, installed as PWA) |
| **Planned: IoT** | ESP32 microcontroller + YF-S201 flow meters → Firebase Realtime Database |
| **Planned: Notifications** | Firebase Cloud Messaging (FCM) |
