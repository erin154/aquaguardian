import { useState } from 'react'

export default function Settings({ rate, onChange, user }) {
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