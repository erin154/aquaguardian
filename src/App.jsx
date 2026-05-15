import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, addDoc, query, where, onSnapshot, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'
import Auth from './Auth'
import GoalBar        from './components/GoalBar'
import BillSummary    from './components/BillSummary'
import LogHistory     from './components/LogHistory'
import Settings       from './components/Settings'
import InsightCard    from './components/InsightCard'
import SpiritWidget   from './components/SpiritWidget'
import ActivityLogger from './components/ActivityLogger'

// Date helpers 

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// Streak logic
// Runs once on login. Compares yesterday's logs against goals and
// increments, holds, or resets the streak stored in Firestore.

async function checkAndUpdateStreak(uid, currentStreak, lastStreakDate) {
  const today     = getTodayKey()
  const yesterday = getYesterdayKey()

  // Already ran this check today — nothing to do
  if (lastStreakDate === today) return currentStreak

  // Missed at least one full day → reset
  if (lastStreakDate !== yesterday) {
    // Brand new account: don't punish, just stamp today
    if (!lastStreakDate) {
      await setDoc(doc(db, 'households', uid), { streak: 0, lastStreakDate: today }, { merge: true })
      return 0
    }
    await setDoc(doc(db, 'households', uid), { streak: 0, lastStreakDate: today }, { merge: true })
    return 0
  }

  // lastStreakDate was yesterday — evaluate yesterday's logs
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

// App

export default function App() {
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [logs,        setLogs]        = useState([])
  const [health,      setHealth]      = useState(75)
  const [streak,      setStreak]      = useState(0)
  const [rate,        setRate]        = useState(0.004)

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
        if (d.rate)                setRate(d.rate)
        if (d.baseHealth !== undefined) setHealth(d.baseHealth)
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

  // Handlers

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

  async function handleChallengeComplete(reward) {
    const newHealth = Math.min(100, health + reward)
    setHealth(newHealth)
    if (user) await setDoc(doc(db, 'households', user.uid), { baseHealth: newHealth }, { merge: true })
  }

  // Render

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: 32 }}>💧</div>
    </div>
  )

  if (!user) return <Auth onAuth={setUser} />

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '20px 16px', fontFamily: 'system-ui, sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>💧 AquaGuardian</div>
        <button onClick={() => signOut(auth)} style={{
          background: 'none', border: '1px solid #ddd', borderRadius: 20,
          padding: '6px 14px', fontSize: 12, color: '#888', cursor: 'pointer'
        }}>Sign out</button>
      </div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Family water tracker</div>

      <SpiritWidget   health={health} streak={streak} onChallengeComplete={handleChallengeComplete} />
      {logs.length > 0 && <InsightCard logs={logs} rate={rate} streak={streak} />}
      <ActivityLogger onLog={handleLog} />
      <LogHistory     logs={logs} />
      <BillSummary    logs={logs} rate={rate} />
      <Settings       rate={rate} onChange={handleRateChange} user={user} />
    </div>
  )
}