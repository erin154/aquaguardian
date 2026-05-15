import { useState } from 'react'
import { SPIRIT_STAGES, RECOVERY_CHALLENGES } from '../constants'

function getStage(health) {
  return SPIRIT_STAGES.find(s => health >= s.min)
}

export default function SpiritWidget({ health, streak, onChallengeComplete }) {
  const stage = getStage(health)
  const isSuffering = health < 30
  const [challengeIdx] = useState(() => Math.floor(Math.random() * RECOVERY_CHALLENGES.length))
  const [challengeDone, setChallengeDone] = useState(false)
  const challenge = RECOVERY_CHALLENGES[challengeIdx]

  return (
    <div style={{ textAlign: 'center', padding: '20px 16px', background: stage.bg, borderRadius: 16, marginBottom: 16, border: `2px solid ${isSuffering ? stage.border : 'transparent'}`, transition: 'all 0.5s ease' }}>
      <div style={{ fontSize: 60, marginBottom: 6, lineHeight: 1 }}>{stage.emoji}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Stage: {stage.name}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: stage.color }}>Your water spirit is {stage.label}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 2, marginBottom: 10 }}>
        Health: {health}% {streak > 0 ? `· 🔥 ${streak}-day streak` : ''}
      </div>
      <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.6)', overflow: 'hidden', marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${health}%`, background: stage.color, borderRadius: 5, transition: 'width 0.6s ease' }} />
      </div>
      {isSuffering && !challengeDone && (
        <div style={{ marginTop: 14, background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #F0997B', textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#D85A30', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recovery challenge</div>
          <div style={{ fontSize: 14, color: '#333', lineHeight: 1.5, marginBottom: 10 }}>{challenge.text}</div>
          <button onClick={() => { setChallengeDone(true); onChallengeComplete(challenge.reward) }}
            style={{ width: '100%', padding: 9, borderRadius: 8, border: 'none', background: '#D85A30', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
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