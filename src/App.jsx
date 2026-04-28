import { useState, useEffect } from 'react'

const ACTIVITIES = [
  { id: 'shower',     label: 'Shower',      icon: '🚿', avgGallons: 17 },
  { id: 'dishes',     label: 'Dishes',      icon: '🍽️', avgGallons: 6  },
  { id: 'sprinklers', label: 'Sprinklers',  icon: '🌿', avgGallons: 60 },
  { id: 'laundry',    label: 'Laundry',     icon: '👕', avgGallons: 19 },
  { id: 'sink',       label: 'Sink',        icon: '🚰', avgGallons: 2  },
  { id: 'carwash',    label: 'Car Wash',    icon: '🚗', avgGallons: 40 },
]

const SPIRIT_STATES = [
  { min: 80, label: 'Thriving',  color: '#1D9E75', bg: '#E1F5EE', emoji: '✨' },
  { min: 50, label: 'Healthy',   color: '#378ADD', bg: '#E6F1FB', emoji: '💧' },
  { min: 25, label: 'Stressed',  color: '#BA7517', bg: '#FAEEDA', emoji: '😟' },
  { min: 0,  label: 'Suffering', color: '#D85A30', bg: '#FAECE7', emoji: '🥺' },
]

function getSpiritState(health) {
  return SPIRIT_STATES.find(s => health >= s.min)
}

function GoalBar({ used, goal, avg }) {
  const pct = Math.min((used / avg) * 100, 100)
  const goalPct = Math.min((goal / avg) * 100, 100)
  const color = used <= goal ? '#1D9E75' : used <= avg ? '#BA7517' : '#D85A30'
  const label = used <= goal ? 'Below your goal' : used <= avg ? 'Above goal, below average' : 'Above national average'

  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ position: 'relative', height: 14, borderRadius: 7, background: '#F1EFE8', overflow: 'visible' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 7, transition: 'width 0.4s ease' }} />
        <div style={{ position: 'absolute', top: -4, left: `${goalPct}%`, width: 2, height: 22, background: '#444', borderRadius: 1 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#888' }}>
        <span style={{ color }}>{label}</span>
        <span>avg: {avg} gal</span>
      </div>
    </div>
  )
}

const RECOVERY_CHALLENGES = [
  'Take a shower under 5 minutes today',
  'Skip one dishwasher cycle — wash by hand',
  'Turn off the tap while brushing teeth',
  'Water plants with leftover drinking water',
  'Run the washing machine only when fully loaded',
]

function SpiritWidget({ health }) {
  const state = getSpiritState(health)
  const isSuffering = health < 25
  const isStressed = health < 50
  const challenge = RECOVERY_CHALLENGES[Math.floor(Math.random() * RECOVERY_CHALLENGES.length)]
  const [pulse, setPulse] = useState(false)
  const [challengeDismissed, setChallengeDismissed] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), isSuffering ? 600 : isStressed ? 1200 : 2000)
    return () => clearInterval(interval)
  }, [isSuffering, isStressed])

  useEffect(() => {
    setChallengeDismissed(false)
  }, [health])

  const emojiScale = pulse ? 1.15 : 1.0
  const glowColor = isSuffering ? '#D85A30' : isStressed ? '#BA7517' : state.color

  return (
    <div style={{
      textAlign: 'center', padding: '20px 16px',
      background: state.bg, borderRadius: 16, marginBottom: 16,
      border: `2px solid ${isSuffering ? '#D85A30' : 'transparent'}`,
      transition: 'border-color 0.4s ease'
    }}>
      <div style={{
        fontSize: 56, marginBottom: 8,
        display: 'inline-block',
        transform: `scale(${emojiScale})`,
        transition: 'transform 0.4s ease',
        filter: `drop-shadow(0 0 ${pulse ? 10 : 4}px ${glowColor})`
      }}>
        {state.emoji}
      </div>

      <div style={{ fontSize: 18, fontWeight: 600, color: state.color, marginBottom: 4 }}>
        Your water spirit is {state.label.toLowerCase()}
      </div>
      <div style={{ fontSize: 13, color: '#888' }}>Spirit health: {health}%</div>

      <div style={{ marginTop: 10, height: 10, borderRadius: 5, background: '#fff', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${health}%`,
          background: state.color, borderRadius: 5,
          transition: 'width 0.6s ease, background 0.6s ease'
        }} />
      </div>

      {isSuffering && !challengeDismissed && (
        <div style={{
          marginTop: 16, background: '#fff',
          borderRadius: 12, padding: '12px 14px',
          border: '1px solid #F0997B', textAlign: 'left'
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#D85A30', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recovery challenge
          </div>
          <div style={{ fontSize: 14, color: '#333', lineHeight: 1.5, marginBottom: 10 }}>
            {challenge}
          </div>
          <button
            onClick={() => setChallengeDismissed(true)}
            style={{
              width: '100%', padding: '8px', borderRadius: 8, border: 'none',
              background: '#D85A30', color: '#fff', fontWeight: 600,
              fontSize: 13, cursor: 'pointer'
            }}>
            I'll do this today
          </button>
        </div>
      )}

      {isSuffering && challengeDismissed && (
        <div style={{ marginTop: 12, fontSize: 13, color: state.color, fontWeight: 500 }}>
          Great commitment. Log your next activity to restore the spirit.
        </div>
      )}
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
          <button key={a.id} onClick={() => setSelected(a)}
            style={{
              padding: '10px 4px', borderRadius: 10, border: `2px solid ${selected?.id === a.id ? '#1D9E75' : '#eee'}`,
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
            How many gallons did you use? <span style={{ color: '#1D9E75' }}>(national avg: {selected.avgGallons} gal)</span>
          </div>
          <input
            type="number" placeholder="e.g. 15" value={gallons}
            onChange={e => setGallons(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' }}
          />
          <GoalBar used={parseFloat(gallons) || 0} goal={selected.avgGallons * 0.8} avg={selected.avgGallons} />
        </div>
      )}

      <button onClick={handleLog} disabled={!selected || !gallons}
        style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: selected && gallons ? '#1D9E75' : '#eee',
          color: selected && gallons ? '#fff' : '#aaa',
          fontWeight: 600, fontSize: 15, cursor: selected && gallons ? 'pointer' : 'default'
        }}>
        Log activity
      </button>
    </div>
  )
}

function LogHistory({ logs }) {
  if (logs.length === 0) return null
  const total = logs.reduce((sum, l) => sum + l.gallons, 0)

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>Today's log</div>
      {logs.map((log, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: 14 }}>
          <span>{log.activity.icon} {log.activity.label}</span>
          <span style={{ fontWeight: 500 }}>{log.gallons} gal</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, fontWeight: 600, fontSize: 15 }}>
        <span>Total</span>
        <span>{total.toFixed(1)} gal</span>
      </div>
    </div>
  )
}

function BillSummary({ logs, rate }) {
  if (logs.length === 0) return null
  const total = logs.reduce((sum, l) => sum + l.gallons, 0)
  const cost = total * rate
  const monthlyProjection = (cost / Math.max(total, 1)) * 3000

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginBottom: 16, marginTop: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>💵 Bill estimator</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Today's cost</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A6B9A' }}>${cost.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{total.toFixed(1)} gal used</div>
        </div>
        <div style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Monthly projection</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A6B9A' }}>${monthlyProjection.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>at current pace</div>
        </div>
      </div>
    </div>
  )
}

function RateSettings({ rate, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16, marginTop: 16 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>⚙️ Settings</div>
        <div style={{ fontSize: 13, color: '#888' }}>{open ? 'close' : 'edit'}</div>
      </div>

      {open && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
            Water rate (cost per gallon) — check your water bill for this number
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15 }}>$</span>
            <input
              type="number" step="0.001" value={rate}
              onChange={e => onChange(parseFloat(e.target.value) || 0)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15 }}
            />
            <span style={{ fontSize: 13, color: '#888' }}>/ gallon</span>
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
            US average is ~$0.004–$0.008 per gallon. Your bill usually lists cost per 1,000 gallons — divide that by 1,000.
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [logs, setLogs] = useState(() => {
  const saved = localStorage.getItem('aquaguardian-logs')
  return saved ? JSON.parse(saved) : []
})
  const [rate, setRate] = useState(() => {
  const saved = localStorage.getItem('aquaguardian-rate')
  return saved ? parseFloat(saved) : 0.004
})
  useEffect(() => {
  localStorage.setItem('aquaguardian-logs', JSON.stringify(logs))
}, [logs])

useEffect(() => {
  localStorage.setItem('aquaguardian-rate', rate)
}, [rate])


  function handleLog(entry) {
    setLogs(prev => [...prev, entry])
  }

  const totalUsed = logs.reduce((sum, l) => sum + l.gallons, 0)
  const dailyGoal = 80
  const health = Math.max(0, Math.round(100 - ((totalUsed / dailyGoal) * 60)))

  return (
  <div style={{ maxWidth: 420, margin: '0 auto', padding: '20px 16px', fontFamily: 'system-ui, sans-serif', background: '#f9f9f9', minHeight: '100vh' }}>
    <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>💧 AquaGuardian</div>
    <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Family water tracker · Day 1 MVP</div>

    <SpiritWidget health={health} />
    <ActivityLogger onLog={handleLog} />
    <LogHistory logs={logs} />
    <BillSummary logs={logs} rate={rate} />
    <RateSettings rate={rate} onChange={setRate} />
  </div>
)}