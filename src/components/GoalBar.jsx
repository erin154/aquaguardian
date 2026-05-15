export default function GoalBar({ used, goal, avg }) {
  const maxVal = Math.max(avg * 1.2, used)
  const usedPct = Math.min((used / maxVal) * 100, 100)
  const goalPct = Math.min((goal / maxVal) * 100, 100)
  const avgPct  = Math.min((avg  / maxVal) * 100, 100)
  const color = used <= goal ? '#1D9E75' : used <= avg ? '#BA7517' : '#D85A30'
  const label = used <= goal ? '✓ Below your goal' : used <= avg ? '↑ Above goal' : '⚠ Above average'
 
  return (
    <div style={{ margin: '10px 0' }}>
      <div style={{ position: 'relative', height: 12, borderRadius: 6, background: '#F1EFE8' }}>
        <div style={{ height: '100%', width: `${usedPct}%`, background: color, borderRadius: 6, transition: 'width 0.4s ease' }} />
        <div style={{ position: 'absolute', top: -3, left: `${goalPct}%`, width: 2, height: 18, background: '#1D9E75', borderRadius: 1 }} />
        <div style={{ position: 'absolute', top: -3, left: `${avgPct}%`,  width: 2, height: 18, background: '#888',    borderRadius: 1 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: '#888' }}>
        <span style={{ color, fontWeight: 500 }}>{label}</span>
        <span>goal: {goal}g · avg: {avg}g</span>
      </div>
    </div>
  )
}
