import { useState, useEffect } from 'react'
import { ACTIVITIES } from '../constants'

export default function Settings({ rate, onChange, user, activities, activityGoals, dailyGoal, onGoalsChange }) {

  // Local draft state — we only write to Firestore when the user hits Save
  const [draftGoals, setDraftGoals] = useState({})
  const [draftDaily, setDraftDaily] = useState(80)
  const [saved,      setSaved]      = useState(false)

  // When the parent loads saved goals from Firestore, sync them into our draft
  useEffect(() => {
    const defaults = {}
    ACTIVITIES.forEach(a => { defaults[a.id] = activityGoals[a.id] ?? a.goalGallons })
    setDraftGoals(defaults)
    setDraftDaily(dailyGoal)
  }, [activityGoals, dailyGoal])

  function handleActivityGoalChange(id, value) {
    setDraftGoals(prev => ({ ...prev, [id]: parseFloat(value) || 0 }))
    setSaved(false)
  }

  function handleDailyChange(value) {
    setDraftDaily(parseFloat(value) || 0)
    setSaved(false)
  }

  async function handleSave() {
    await onGoalsChange(draftGoals, draftDaily)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Water Rate ── */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#333' }}>💰 Water rate</div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Cost per gallon (from your water bill)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#555', fontWeight: 600 }}>$</span>
          <input
            type="number"
            step="0.001"
            value={rate}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, color: '#333', background: '#fff' }}          />
          <span style={{ fontSize: 13, color: '#888' }}>/ gal</span>
        </div>
        <div style={{ fontSize: 12, color: '#bbb', marginTop: 8 }}>Signed in as {user.email}</div>
      </div>

      {/* ── Daily Total Goal ── */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#333' }}>🏠 Daily household goal</div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
          The EPA average is 80–100 gal per person per day. Set your household's total daily target.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            value={draftDaily}
            onChange={e => handleDailyChange(e.target.value)}
            style={{ width: 90, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, textAlign: 'center', color: '#333', background: '#fff' }}          />
          <span style={{ fontSize: 13, color: '#888' }}>gal / day</span>
        </div>
      </div>

      {/* ── Per-Activity Goals ── */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#333' }}>🎯 Activity goals</div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>
          Set your personal target for each activity. The national average is shown for reference.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ACTIVITIES.map(a => {
            const currentGoal = draftGoals[a.id] ?? a.goalGallons
            const isCustom = activityGoals[a.id] !== undefined && activityGoals[a.id] !== a.goalGallons
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Icon + label */}
                <div style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{a.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#333' }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: '#bbb' }}>avg {a.avgGallons} gal</div>
                </div>
                {/* Goal input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    value={currentGoal}
                    onChange={e => handleActivityGoalChange(a.id, e.target.value)}
                    style={{
                      width: 64,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1.5px solid ${isCustom ? '#1D9E75' : '#ddd'}`,
                      fontSize: 14,
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#333',
                      background: '#fff',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#aaa' }}>gal</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reset to defaults link */}
        <button
          onClick={() => {
            const defaults = {}
            ACTIVITIES.forEach(a => { defaults[a.id] = a.goalGallons })
            setDraftGoals(defaults)
            setSaved(false)
          }}
          style={{
            marginTop: 16,
            background: 'none',
            border: 'none',
            color: '#bbb',
            fontSize: 12,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Reset to default
        </button>
      </div>

      {/* ── Save Button ── */}
      <button
        onClick={handleSave}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 12,
          border: 'none',
          background: saved ? '#5DCAA5' : '#1D9E75',
          color: '#fff',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          transition: 'background 0.3s ease',
        }}
      >
        {saved ? '✓ Goals saved!' : 'Save goals'}
      </button>

    </div>
  )
}