import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, addDoc, query, where, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore'
import Auth from './Auth'

const ACTIVITIES = [
  { id: 'shower',     label: 'Shower',     icon: '🚿', avgGallons: 17,  goalGallons: 14 },
  { id: 'dishes',     label: 'Dishes',     icon: '🍽️', avgGallons: 6,   goalGallons: 4  },
  { id: 'sprinklers', label: 'Sprinklers', icon: '🌿', avgGallons: 60,  goalGallons: 40 },
  { id: 'laundry',    label: 'Laundry',    icon: '👕', avgGallons: 19,  goalGallons: 15 },
  { id: 'sink',       label: 'Sink',       icon: '🚰', avgGallons: 2,   goalGallons: 1  },
  { id: 'carwash',    label: 'Car Wash',   icon: '🚗', avgGallons: 40,  goalGallons: 25 },
]

const SPIRIT_STAGES = [
  { min: 85, name: 'Ocean',   emoji: '🌊', label: 'legendary',  color: '#0C447C', bg: '#E6F1FB', border: '#378ADD' },
  { min: 70, name: 'Lake',    emoji: '💫', label: 'majestic',   color: '#0F6E56', bg: '#E1F5EE', border: '#1D9E75' },
  { min: 50, name: 'River',   emoji: '✨', label: 'thriving',   color: '#1D9E75', bg: '#E1F5EE', border: '#5DCAA5' },
  { min: 30, name: 'Creek',   emoji: '💧', label: 'healthy',    color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB' },
  { min: 15, name: 'Droplet', emoji: '😟', label: 'stressed',   color: '#BA7517', bg: '#FAEEDA', border: '#EF9F27' },
  { min: 0,  name: 'Droplet', emoji: '🥺', label: 'suffering',  color: '#993C1D', bg: '#FAECE7', border: '#D85A30' },
]

const RECOVERY_CHALLENGES = [
  { text: 'Take a shower under 5 minutes', reward: 15 },
  { text: 'Skip one dishwasher cycle — hand wash instead', reward: 12 },
  { text: 'Turn off the tap while brushing teeth', reward: 10 },
  { text: 'Water plants with leftover drinking water', reward: 10 },
  { text: 'Run the washing machine only when fully loaded', reward: 12 },
  { text: 'Fix a dripping tap in your home today', reward: 20 },
]

const INSIGHT_CARDS = [
  (data) => ({ icon: '🛁', text: `Today you've used the equivalent of ${(data.todayTotal / 50).toFixed(1)} bathtubs of water.`, color: '#185FA5', bg: '#E6F1FB' }),
  (data) => ({ icon: '📊', text: `The average household uses 80–100 gallons per person per day. Your household logged ${data.todayTotal.toFixed(0)} gal today.`, color: '#0F6E56', bg: '#E1F5EE' }),
  (data) => ({ icon: '💰', text: `At your current pace, your estimated monthly water cost is $${(data.todayTotal * 30 * data.rate).toFixed(2)}.`, color: '#854F0B', bg: '#FAEEDA' }),
  (data) => ({ icon: '🌍', text: `Every 10 gallons saved is roughly one person's daily drinking water. You've logged ${data.todayTotal.toFixed(0)} gal today.`, color: '#3B6D11', bg: '#EAF3DE' }),
  (data) => ({ icon: '🔥', text: data.streak > 0 ? `${data.streak}-day streak! Your spirit gains strength every day you meet your goal.` : 'Start a streak today — meet your daily goal and your spirit begins to grow.', color: '#993C1D', bg: '#FAECE7' }),
]

function getStage(health) { return SPIRIT_STAGES.find(s => health >= s.min) }
function getTodayKey() { return new Date().toISOString().split('T')[0] }

function computeHealthDelta(logs) {
  let delta = 0
  logs.forEach(log => {
    const ratio = log.gallons / log.activityGoal
    if (ratio <= 1) delta += Math.round((1 - ratio) * 20 + 5)
    else delta -= Math.round((ratio - 1) * 25)
  })
  return delta
}

function GoalBar({ used, goal, avg }) {
  const maxVal = Math.max(avg * 1.2, used)
  const usedPct = Math.min((used / maxVal) * 100, 100)
  const goalPct = Math.min((goal / maxVal) * 100, 100)
  const avgPct = Math.min((avg / maxVal) * 100, 100)
  const color = used <= goal ? '#1D9E75' : used <= avg ? '#BA7517' : '#D85A30'
  const label = used <= goal ? '✓ Below your goal' : used <= avg ? '↑ Above goal' : '⚠ Above average'
  return (
    <div style={{ margin: '10px 0' }}>
      <div style={{ position: 'relative', height: 12, borderRadius: 6, background: '#F1EFE8' }}>
        <div style={{ height: '100%', width: `${usedPct}%`, background: color, borderRadius: 6, transition: 'width 0.4s ease' }} />
        <div style={{ position: 'absolute', top: -3, left: `${goalPct}%`, width: 2, height: 18, background: '#1D9E75', borderRadius: 1 }} />
        <div style={{ position: 'absolute', top: -3, left: `${avgPct}%`, width: 2, height: 18, background: '#888', borderRadius: 1 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: '#888' }}>
        <span style={{ color, fontWeight: 500 }}>{label}</span>
        <span>goal: {goal}g · avg: {avg}g</span>
      </div>
    </div>
  )
}

function SpiritWidget({ health, streak, onChallengeComplete }) {
  const stage = getStage(health)
  const isSuffering = health < 30
  const [challengeIdx] = useState(() => Math.floor(Math.random() * RECOVERY_CHALLENGES.length))
  const [challengeDone, setChallengeDone] = useState(false)
  const challenge = RECOVERY_CHALLENGES[challengeIdx]

  return (
    <div style={{ textAlign: 'center', padding: '20px 16px', background: stage.bg, borderRadius: 16, marginBottom: 16, border: `2px solid ${isSuffering ? stage.border : 'transparent'}`, transition: 'all 0.5s ease' }}>
      <div style={{ fontSize: 60, marginBottom: 6, lineHeight: 1 }}>{stage.emoji}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Stage: {stage.name}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: stage.color }}>Your water spirit is {stage.label}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 2, marginBottom: 10 }}>
        Health: {health}% {streak > 0 ? `· 🔥 ${streak}-day streak` : ''}
      </div>
      <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.6)', overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${health}%`, background: stage.color, borderRadius: 5, transition: 'width 0.6s ease' }} />
      </div>
      {isSuffering && !challengeDone && (
        <div style={{ marginTop: 14, background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #F0997B', textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#D85A30', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recovery challenge</div>
          <div style={{ fontSize: 14, color: '#333', lineHeight: 1.5, marginBottom: 10 }}>{challenge.text}</div>
          <button onClick={() => { setChallengeDone(true); onChallengeComplete(challenge.reward) }}
            style={{ width: '100%', padding: 9, borderRadius: 8, border: 'none', background: '#D85A30', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            I'll do this today (+{challenge.reward} health)
          </button>
        </div>
      )}
      {isSuffering && challengeDone && (
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#fff', borderRadius: 10, fontSize: 13, color: '#1D9E75', fontWeight: 500 }}>
          Challenge accepted! Log a water-efficient activity to keep restoring your spirit.
        </div>
      )}
    </div>
  )
}

function InsightCard({ logs, rate, streak }) {
  const todayTotal = logs.reduce((s, l) => s + l.gallons, 0)
  const [idx] = useState(() => Math.floor(Math.random() * INSIGHT_CARDS.length))
  const card = INSIGHT_CARDS[idx]({ todayTotal, rate, streak })
  return (
    <div style={{ background: card.bg, borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 22 }}>{card.icon}</span>
      <div style={{ fontSize: 13, color: card.color, lineHeight: 1.6 }}>{card.text}</div>
    </div>
  )
}

function ActivityLogger({ onLog }) {
  const [selected, setSelected] = useState(null)
  const [gallons, setGallons] = useState('')

  function handleLog() {
    if (!selected || !gallons) return
    onLog({ activity: selected, gallons: parseFloat(gallons) })
    setSelected(null)
    setGallons('')
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Log water activity</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {ACTIVITIES.map(a => (
          <button key={a.id} onClick={() => setSelected(a)} style={{
            padding: '10px 4px', borderRadius: 10, border: `2px solid ${selected?.id === a.id ? '#1D9E75' : '#eee'}`,
            background: selected?.id === a.id ? '#E1F5EE' : '#fafafa', cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'center'
          }}>
            <div style={{ fontSize: 22 }}>{a.icon}</div>{a.label}
          </button>
        ))}
      </div>
      {selected && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
            Gallons used? <span style={{ color: '#1D9E75' }}>goal: {selected.goalGallons}g</span> · <span style={{ color: '#888' }}>avg: {selected.avgGallons}g</span>
          </div>
          <input type="number" placeholder="e.g. 12" value={gallons} onChange={e => setGallons(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' }} />
          {gallons && <GoalBar used={parseFloat(gallons)} goal={selected.goalGallons} avg={selected.avgGallons} />}
        </div>
      )}
      <button onClick={handleLog} disabled={!selected || !gallons} style={{
        width: '100%', padding: 12, borderRadius: 10, border: 'none',
        background: selected && gallons ? '#1D9E75' : '#eee',
        color: selected && gallons ? '#fff' : '#aaa',
        fontWeight: 600, fontSize: 15, cursor: selected && gallons ? 'pointer' : 'default'
      }}>Log activity</button>
    </div>
  )
}

function LogHistory({ logs }) {
  if (logs.length === 0) return null
  const total = logs.reduce((s, l) => s + l.gallons, 0)
  const saved = Math.max(0, logs.reduce((s, l) => s + l.activityGoal, 0) - total)
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>Today's log</div>
      {logs.map((log, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 }}>
          <span>{log.activityIcon} {log.activityLabel}</span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 500, color: log.gallons > log.activityGoal ? '#D85A30' : '#1D9E75' }}>{log.gallons} gal</span>
            <span style={{ fontSize: 11, color: '#aaa', marginLeft: 6 }}>goal: {log.activityGoal}g</span>
          </div>
        </div>
      ))}
      <div style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span style={{ color: '#888' }}>Total</span>
        <span style={{ fontWeight: 600 }}>{total.toFixed(1)} gal</span>
      </div>
      {saved > 0 && (
        <div style={{ paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: '#1D9E75' }}>Saved vs goals</span>
          <span style={{ fontWeight: 600, color: '#1D9E75' }}>−{saved.toFixed(1)} gal</span>
        </div>
      )}
    </div>
  )
}

function BillSummary({ logs, rate }) {
  if (logs.length === 0) return null
  const total = logs.reduce((s, l) => s + l.gallons, 0)
  const cost = total * rate
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>💵 Bill estimator</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Today's cost</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A6B9A' }}>${cost.toFixed(2)}</div>
        </div>
        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Monthly projection</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A6B9A' }}>${(cost * 30).toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

function Settings({ rate, onChange, user }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>⚙️ Settings</div>
        <div style={{ fontSize: 13, color: '#888' }}>{open ? 'close' : 'edit'}</div>
      </div>
      {open && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>Water rate (cost per gallon)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span>$</span>
            <input type="number" step="0.001" value={rate} onChange={e => onChange(parseFloat(e.target.value) || 0)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }} />
            <span style={{ fontSize: 13, color: '#888' }}>/ gal</span>
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>Signed in as {user.email}</div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [health, setHealth] = useState(75)
  const [baseHealth, setBaseHealth] = useState(75)
  const [streak, setStreak] = useState(0)
  const [rate, setRate] = useState(0.004)

  // Listen for auth state changes
  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setAuthLoading(false)
    })
  }, [])

  // Load household settings (rate, streak, saved health) from Firestore
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'households', user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        if (d.rate) setRate(d.rate)
        if (d.streak) setStreak(d.streak)
        if (d.baseHealth !== undefined) {
          setBaseHealth(d.baseHealth)
          setHealth(d.baseHealth)
        }
      }
    })
  }, [user])

  // Subscribe to today's logs in real time
  useEffect(() => {
    if (!user) return
    const today = getTodayKey()
    const q = query(
      collection(db, 'logs'),
      where('uid', '==', user.uid),
      where('date', '==', today)
    )
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setLogs(data)
      // Apply today's delta on top of the persisted base health
      setBaseHealth(prev => {
        const delta = computeHealthDelta(data)
        const newHealth = Math.max(0, Math.min(100, Math.max(40, prev) + delta))
        setHealth(newHealth)
        return prev
      })
    })
    return unsub
  }, [user])

  // Save health to Firestore 1 second after it changes
  useEffect(() => {
    if (!user) return
    const timeout = setTimeout(() => {
      setDoc(doc(db, 'households', user.uid), { baseHealth: health }, { merge: true })
    }, 1000)
    return () => clearTimeout(timeout)
  }, [health, user])

  async function handleLog(entry) {
    if (!user) return
    await addDoc(collection(db, 'logs'), {
      uid: user.uid,
      date: getTodayKey(),
      gallons: entry.gallons,
      activityId: entry.activity.id,
      activityLabel: entry.activity.label,
      activityIcon: entry.activity.icon,
      activityGoal: entry.activity.goalGallons,
      activityAvg: entry.activity.avgGallons,
      timestamp: Date.now(),
    })
  }

  async function handleRateChange(newRate) {
    setRate(newRate)
    if (user) await setDoc(doc(db, 'households', user.uid), { rate: newRate }, { merge: true })
  }

  function handleChallengeComplete(reward) {
    setHealth(h => Math.min(100, h + reward))
  }

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

      <SpiritWidget health={health} streak={streak} onChallengeComplete={handleChallengeComplete} />
      {logs.length > 0 && <InsightCard logs={logs} rate={rate} streak={streak} />}
      <ActivityLogger onLog={handleLog} />
      <LogHistory logs={logs} />
      <BillSummary logs={logs} rate={rate} />
      <Settings rate={rate} onChange={handleRateChange} user={user} />
    </div>
  )
}