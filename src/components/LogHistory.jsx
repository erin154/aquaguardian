export default function LogHistory({ logs }) {
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