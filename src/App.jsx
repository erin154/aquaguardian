import { useState, useEffect } from 'react'

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
  (data) => ({
    type: 'reframe',
    icon: '🛁',
    text: `Today you've used the equivalent of ${(data.todayTotal / 50).toFixed(1)} bathtubs of water.`,
    color: '#185FA5', bg: '#E6F1FB'
  }),
  (data) => ({
    type: 'anchor',
    icon: '📊',
    text: `The average household uses 80–100 gallons per person per day. Your household logged ${data.todayTotal.toFixed(0)} gal today.`,
    color: '#0F6E56', bg: '#E1F5EE'
  }),
  (data) => ({
    type: 'projection',
    icon: '💰',
    text: `At your current pace, your estimated monthly water cost is $${(data.todayTotal * 30 * data.rate).toFixed(2)}.`,
    color: '#854F0B', bg: '#FAEEDA'
  }),
  (data) => ({
    type: 'nature',
    icon: '🌍',
    text: `Every 10 gallons you save is roughly the daily drinking water for one person. You've saved ${Math.max(0, data.goalTotal - data.todayTotal).toFixed(0)} gal below your goal today.`,
    color: '#3B6D11', bg: '#EAF3DE'
  }),
  (data) => ({
    type: 'streak',
    icon: '🔥',
    text: data.streak > 0
      ? `${data.streak}-day streak! Your spirit gains strength with every goal you meet.`
      : 'Start a streak today — meet your daily goal and your spirit begins to grow.',
    color: '#993C1D', bg: '#FAECE7'
  }),
]

function getStage(health) {
  return SPIRIT_STAGES.find(s => health >= s.min)
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function computeHealth(logs) {
  if (logs.length === 0) return 75
  let score = 75
  logs.forEach(log => {
    const ratio = log.gallons / log.activity.goalGallons
    if (ratio <= 1) {
      score += Math.round((1 - ratio) * 20 + 5)
    } else {
      score -= Math.round((ratio - 1) * 25)
    }
  })
  return Math.max(0, Math.min(100, score))
}

function GoalBar({ used, goal, avg }) {
  const maxVal = Math.max(avg * 1.2, used)
  const usedPct = Math.min((used / maxVal) * 100, 100)
  const goalPct = Math.min((goal / maxVal) * 100, 100)
  const avgPct = Math.min((avg / maxVal) * 100, 100)
  const color = used <= goal ? '#1D9E75' : used <= avg ? '#BA7517' : '#D85A30'
  const label = used <= goal ? '✓ Below your goal' : used <= avg ? '↑ Above goal' : '⚠ Above national average'

  return (
    <div style={{ margin: '10px 0' }}>
      <div style={{ position: 'relative', height: 12, borderRadius: 6, background: '#F1EFE8' }}>
        <div style={{ height: '100%', width: `${usedPct}%`, background: color, borderRadius: 6, transition: 'width 0.4s ease' }} />
        <div style={{ position: 'absolute', top: -3, left: `${goalPct}%`, width: 2, height: 18, background: '#1D9E75', borderRadius: 1 }} title="Your goal" />
        <div style={{ position: 'absolute', top: -3, left: `${avgPct}%`, width: 2, height: 18, background: '#888', borderRadius: 1 }} title="National average" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: '#888' }}>
        <span style={{ color, fontWeight: 500 }}>{label}</span>
        <span>goal: {goal}g &nbsp;|&nbsp; avg: {avg}g</span>
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

  function handleChallengeAccept() {
    setChallengeDone(true)
    onChallengeComplete(challenge.reward)
  }

  return (
    <div style={{
      textAlign: 'center', padding: '20px 16px',
      background: stage.bg, borderRadius: 16, marginBottom: 16,
      border: `2px solid ${isSuffering ? stage.border : 'transparent'}`,
      transition: 'all 0.5s ease'
    }}>
      <div style={{ fontSize: 60, marginBottom: 6, lineHeight: 1 }}>{stage.emoji}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Stage: {stage.name}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: stage.color }}>
        Your water spirit is {stage.label}
      </div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 2, marginBottom: 10 }}>
        Health: {health}% {streak > 0 ? `· 🔥 ${streak}-day streak` : ''}
      </div>

      <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.6)', overflow: 'hidden', marginBottom: 6 }}>
        <div style={{
          height: '100%', width: `${health}%`,
          background: stage.color, borderRadius: 5,
          transition: 'width 0.6s ease'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: stage.color, opacity: 0.7, marginBottom: 4 }}>
        {SPIRIT_STAGES.slice().reverse().map(s => (
          <span key={s.name + s.min} style={{ fontWeight: health >= s.min ? 600 : 400 }}>{s.name}</span>
        ))}
      </div>

      {isSuffering && !challengeDone && (
        <div style={{ marginTop: 14, background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #F0997B', textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#D85A30', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recovery challenge
          </div>
          <div style={{ fontSize: 14, color: '#333', lineHeight: 1.5, marginBottom: 10 }}>{challenge.text}</div>
          <button onClick={handleChallengeAccept} style={{
            width: '100%', padding: 9, borderRadius: 8, border: 'none',
            background: '#D85A30', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer'
          }}>
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
  const goalTotal = logs.reduce((s, l) => s + l.activity.goalGallons, 0)
  const [idx] = useState(() => Math.floor(Math.random() * INSIGHT_CARDS.length))
  const card = INSIGHT_CARDS[idx]({ todayTotal, goalTotal, rate, streak })

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
    onLog({ activity: selected, gallons: parseFloat(gallons), time: Date.now() })
    setSelected(null)
    setGallons('')
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Log water activity</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {ACTIVITIES.map(a => (
          <button key={a.id} onClick={() => setSelected(a)} style={{
            padding: '10px 4px', borderRadius: 10,
            border: `2px solid ${selected?.id === a.id ? '#1D9E75' : '#eee'}`,
            background: selected?.id === a.id ? '#E1F5EE' : '#fafafa',
            cursor: 'pointer', fontSize: 12, fontWeight: 500, textAlign: 'center'
          }}>
            <div style={{ fontSize: 22 }}>{a.icon}</div>
            {a.label}
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
            Gallons used?&nbsp;
            <span style={{ color: '#1D9E75' }}>goal: {selected.goalGallons}g</span>
            <span style={{ color: '#888' }}> · avg: {selected.avgGallons}g</span>
          </div>
          <input
            type="number" placeholder="e.g. 12" value={gallons}
            onChange={e => setGallons(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' }}
          />
          {gallons && <GoalBar used={parseFloat(gallons)} goal={selected.goalGallons} avg={selected.avgGallons} />}
        </div>
      )}

      <button onClick={handleLog} disabled={!selected || !gallons} style={{
        width: '100%', padding: 12, borderRadius: 10, border: 'none',
        background: selected && gallons ? '#1D9E75' : '#eee',
        color: selected && gallons ? '#fff' : '#aaa',
        fontWeight: 600, fontSize: 15, cursor: selected && gallons ? 'pointer' : 'default'
      }}>
        Log activity
      </button>
    </div>
  )
}

function LogHistory({ logs, onClear }) {
  if (logs.length === 0) return null
  const total = logs.reduce((s, l) => s + l.gallons, 0)
  const goalTotal = logs.reduce((s, l) => s + l.activity.goalGallons, 0)
  const saved = Math.max(0, goalTotal - total)

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>Today's log</div>
        <button onClick={onClear} style={{ fontSize: 12, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}>clear</button>
      </div>
      {logs.map((log, i) => {
        const overGoal = log.gallons > log.activity.goalGallons
        return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 }}>
            <span>{log.activity.icon} {log.activity.label}</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: 500, color: overGoal ? '#D85A30' : '#1D9E75' }}>{log.gallons} gal</span>
              <span style={{ fontSize: 11, color: '#aaa', marginLeft: 6 }}>goal: {log.activity.goalGallons}g</span>
            </div>
          </div>
        )
      })}
      <div style={{ paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span style={{ color: '#888' }}>Total used</span>
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
  const monthly = cost * 30

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>💵 Bill estimator</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Today's cost</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A6B9A' }}>${cost.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{total.toFixed(1)} gal</div>
        </div>
        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Monthly projection</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A6B9A' }}>${monthly.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>at current pace</div>
        </div>
      </div>
    </div>
  )
}

function RateSettings({ rate, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 32 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>⚙️ Settings</div>
        <div style={{ fontSize: 13, color: '#888' }}>{open ? 'close' : 'edit'}</div>
      </div>
      {open && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>Water rate (cost per gallon)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>$</span>
            <input type="number" step="0.001" value={rate} onChange={e => onChange(parseFloat(e.target.value) || 0)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }} />
            <span style={{ fontSize: 13, color: '#888' }}>/ gal</span>
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>US average is ~$0.004–$0.008/gal. Divide your bill's per-1,000-gallon rate by 1,000.</div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [logs, setLogs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aq-logs') || '[]')
      const today = getTodayKey()
      return saved.filter(l => l.date === today)
    } catch { return [] }
  })

  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('aq-streak') || '0'))
  const [health, setHealth] = useState(() => parseInt(localStorage.getItem('aq-health') || '75'))
  const [rate, setRate] = useState(() => parseFloat(localStorage.getItem('aq-rate') || '0.004'))

  useEffect(() => {
    const today = getTodayKey()
    const allLogs = JSON.parse(localStorage.getItem('aq-all-logs') || '[]')
    const todayLogs = allLogs.filter(l => l.date === today)
    const merged = [...todayLogs.filter(l => !logs.find(ll => ll.time === l.time)), ...logs]
    localStorage.setItem('aq-all-logs', JSON.stringify([...allLogs.filter(l => l.date !== today), ...merged]))
    localStorage.setItem('aq-logs', JSON.stringify(logs))
    const newHealth = computeHealth(logs)
    setHealth(newHealth)
    localStorage.setItem('aq-health', newHealth)
  }, [logs])

  useEffect(() => { localStorage.setItem('aq-rate', rate) }, [rate])
  useEffect(() => { localStorage.setItem('aq-streak', streak) }, [streak])

  function handleLog(entry) {
    setLogs(prev => [...prev, { ...entry, date: getTodayKey() }])
  }

  function handleClear() {
    setLogs([])
    setHealth(75)
  }

  function handleChallengeComplete(reward) {
    setHealth(h => Math.min(100, h + reward))
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '20px 16px', fontFamily: 'system-ui, sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>💧 AquaGuardian</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Family water tracker</div>

      <SpiritWidget health={health} streak={streak} onChallengeComplete={handleChallengeComplete} />
      {logs.length > 0 && <InsightCard logs={logs} rate={rate} streak={streak} />}
      <ActivityLogger onLog={handleLog} />
      <LogHistory logs={logs} onClear={handleClear} />
      <BillSummary logs={logs} rate={rate} />
      <RateSettings rate={rate} onChange={setRate} />
    </div>
  )
}