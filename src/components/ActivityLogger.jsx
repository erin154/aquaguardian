import { useState } from 'react'
import { ACTIVITIES } from '../constants'
import GoalBar from './GoalBar'

export default function ActivityLogger({ onLog }) {
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