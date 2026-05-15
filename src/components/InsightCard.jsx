import { useState } from 'react'
import { INSIGHT_CARDS } from '../constants'

export default function InsightCard({ logs, rate, streak }) {
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