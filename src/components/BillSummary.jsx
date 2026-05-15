export default function BillSummary({ logs, rate }) {
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