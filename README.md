## 💧 AquaGuardian — Household Water Conservation App
<img width="146.25" height="316.5" alt="Screenshot 2026-05-27 at 7 00 25 AM" src="https://github.com/user-attachments/assets/ee649195-4e1e-434c-876a-734db32afd75" />
<img width="146.25" height="316.5" alt="IMG_0823" src="https://github.com/user-attachments/assets/f508b7cb-a6b9-4dc5-81d7-d2b57f96a699" />
<img width="146.25" height="316.5" alt="IMG_0825" src="https://github.com/user-attachments/assets/e5490406-11a1-4b75-9d57-ec8742b87435" />
<img width="146.25" height="316.5" alt="IMG_0826" src="https://github.com/user-attachments/assets/d4d7a249-97a5-44cb-ae05-985b4bbf0605" />
<img width="146.25" height="316.5" alt="IMG_0827" src="https://github.com/user-attachments/assets/4d7b7945-e2fe-4e98-b64f-700c8e745e2e" />


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
<img width="457" height="364" alt="Screenshot 2026-05-27 at 3 52 03 AM" src="https://github.com/user-attachments/assets/0bcfb910-8f1d-4aaa-b42a-4022ee016f20" />


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
| **Styling** | CSS Modules |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth |
| **Hosting** | Vercel |
| **PWA** | Web App Manifest + Apple meta tags |
| **Planned: IoT** | ESP32 microcontroller + YF-S201 flow meters → Firebase Realtime Database |
| **Planned: Notifications** | Firebase Cloud Messaging (FCM) |
