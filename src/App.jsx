import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, getDocs, doc, setDoc, getDoc
} from 'firebase/firestore'
import Auth          from './Auth'
import BottomNav     from './components/BottomNav'
import DashboardPage from './pages/DashboardPage'
import BillPage      from './pages/BillPage'
import SettingsPage  from './pages/SettingsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import { ACTIVITIES } from './constants'

// ─── Date helpers ────────────────────────────────────────────────────────────

function dateKey(d = new Date()) {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dy}`
}

function getTodayKey()       { return dateKey() }
function getYesterdayKey()   { const d = new Date(); d.setDate(d.getDate() - 1); return dateKey(d) }
function getNDaysAgoKey(n)   { const d = new Date(); d.setDate(d.getDate() - n); return dateKey(d) }

// ─── Streak logic ─────────────────────────────────────────────────────────────

async function checkAndUpdateStreak(uid, currentStreak, lastStreakDate) {
  const today     = getTodayKey()
  const yesterday = getYesterdayKey()

  if (lastStreakDate === today) return currentStreak

  if (lastStreakDate !== yesterday) {
    if (!lastStreakDate) {
      await setDoc(doc(db, 'households', uid), { streak: 0, lastStreakDate: today }, { merge: true })
      return 0
    }
    await setDoc(doc(db, 'households', uid), { streak: 0, lastStreakDate: today }, { merge: true })
    return 0
  }

  const q    = query(collection(db, 'logs'), where('uid', '==', uid), where('date', '==', yesterday))
  const snap = await getDocs(q)
  const yesterdayLogs = snap.docs.map(d => d.data())

  if (yesterdayLogs.length === 0) {
    await setDoc(doc(db, 'households', uid), { streak: 0, lastStreakDate: today }, { merge: true })
    return 0
  }

  const totalUsed = yesterdayLogs.reduce((s, l) => s + l.gallons, 0)
  const totalGoal = yesterdayLogs.reduce((s, l) => s + l.activityGoal, 0)
  const newStreak = totalUsed <= totalGoal ? currentStreak + 1 : 0

  await setDoc(doc(db, 'households', uid), { streak: newStreak, lastStreakDate: today }, { merge: true })
  return newStreak
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [user,          setUser]          = useState(null)
  const [authLoading,   setAuthLoading]   = useState(true)
  const [logs,          setLogs]          = useState([])
  const [allLogs,       setAllLogs]       = useState([])
  const [health,        setHealth]        = useState(75)
  const [streak,        setStreak]        = useState(0)
  const [rate,          setRate]          = useState(0.004)
  const [activityGoals, setActivityGoals] = useState({})   // { shower: 14, dishes: 4, ... }
  const [dailyGoal,     setDailyGoal]     = useState(80)   // gallons/day household target

  // Build the live activities array: ACTIVITIES defaults overridden by user's saved goals
  const activities = ACTIVITIES.map(a => ({
    ...a,
    goalGallons: activityGoals[a.id] ?? a.goalGallons,
  }))

  // Listen for login / logout
  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setAuthLoading(false)
    })
  }, [])

  // Load household settings and run streak check on login
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'households', user.uid)).then(async snap => {
      if (snap.exists()) {
        const d = snap.data()
        if (d.rate)                     setRate(d.rate)
        if (d.baseHealth !== undefined) setHealth(d.baseHealth)
        if (d.activityGoals)            setActivityGoals(d.activityGoals)
        if (d.dailyGoal !== undefined)  setDailyGoal(d.dailyGoal)
        const updatedStreak = await checkAndUpdateStreak(
          user.uid,
          d.streak ?? 0,
          d.lastStreakDate ?? null
        )
        setStreak(updatedStreak)
      } else {
        await setDoc(doc(db, 'households', user.uid), {
          rate: 0.004,
          streak: 0,
          baseHealth: 75,
          lastStreakDate: getTodayKey(),
          activityGoals: {},
          dailyGoal: 80,
        })
      }
    })
  }, [user])

  // Subscribe to today's logs in real time
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'logs'),
      where('uid', '==', user.uid),
      where('date', '==', getTodayKey())
    )
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user])

  // Subscribe to past 365 days of logs for Analytics
  useEffect(() => {
    if (!user) return
    const thirtyDaysAgo = getNDaysAgoKey(365)
    const q = query(
      collection(db, 'logs'),
      where('uid', '==', user.uid),
      where('date', '>=', thirtyDaysAgo),
      orderBy('date', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setAllLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user])

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleLog(entry) {
    if (!user) return
    const ratio = entry.gallons / entry.activity.goalGallons
    const delta = ratio <= 1
      ? Math.round((1 - ratio) * 20 + 5)
      : -Math.round((ratio - 1) * 25)
    const newHealth = Math.max(0, Math.min(100, health + delta))
    setHealth(newHealth)
    await Promise.all([
      addDoc(collection(db, 'logs'), {
        uid:           user.uid,
        date:          getTodayKey(),
        gallons:       entry.gallons,
        activityId:    entry.activity.id,
        activityLabel: entry.activity.label,
        activityIcon:  entry.activity.icon,
        activityGoal:  entry.activity.goalGallons,
        activityAvg:   entry.activity.avgGallons,
        timestamp:     Date.now(),
      }),
      setDoc(doc(db, 'households', user.uid), { baseHealth: newHealth }, { merge: true }),
    ])
  }

  async function handleRateChange(newRate) {
    setRate(newRate)
    if (user) await setDoc(doc(db, 'households', user.uid), { rate: newRate }, { merge: true })
  }

  async function handleGoalsChange(newActivityGoals, newDailyGoal) {
    setActivityGoals(newActivityGoals)
    setDailyGoal(newDailyGoal)
    if (user) {
      await setDoc(doc(db, 'households', user.uid), {
        activityGoals: newActivityGoals,
        dailyGoal: newDailyGoal,
      }, { merge: true })
    }
  }

  async function handleChallengeComplete(reward) {
    const newHealth = Math.min(100, health + reward)
    setHealth(newHealth)
    if (user) await setDoc(doc(db, 'households', user.uid), { baseHealth: newHealth }, { merge: true })
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: 32 }}>💧</div>
    </div>
  )

  if (!user) return <Auth onAuth={setUser} />

  return (
    <div style={{
      maxWidth: 420,
      margin: '0 auto',
      padding: '20px 16px 100px',
      fontFamily: 'system-ui, sans-serif',
      background: '#f9f9f9',
      minHeight: '100vh',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>💧 AquaGuardian</div>
        <button onClick={() => signOut(auth)} style={{
          background: 'none', border: '1px solid #ddd', borderRadius: 20,
          padding: '6px 14px', fontSize: 12, color: '#888', cursor: 'pointer'
        }}>Sign out</button>
      </div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Family water tracker</div>

      {/* ── Pages ── */}
      <Routes>
        <Route path="/" element={
          <DashboardPage
            health={health}
            streak={streak}
            logs={logs}
            rate={rate}
            activities={activities}
            dailyGoal={dailyGoal}
            onLog={handleLog}
            onChallengeComplete={handleChallengeComplete}
          />
        } />
        <Route path="/analytics" element={
          <AnalyticsPage allLogs={allLogs} rate={rate} />
        } />
        <Route path="/bill" element={
          <BillPage logs={logs} rate={rate} />
        } />
        <Route path="/settings" element={
          <SettingsPage
            rate={rate}
            onChange={handleRateChange}
            user={user}
            activities={activities}
            activityGoals={activityGoals}
            dailyGoal={dailyGoal}
            onGoalsChange={handleGoalsChange}
          />
        } />
      </Routes>

      {/* ── Bottom nav ── */}
      <BottomNav />
    </div>
  )
}