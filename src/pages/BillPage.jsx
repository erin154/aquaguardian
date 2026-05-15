import BillSummary from '../components/BillSummary'

export default function BillPage({ logs, rate }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 16 }}>💰 Bill Estimate</h2>
      <BillSummary logs={logs} rate={rate} />
    </div>
  )
}