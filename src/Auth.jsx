import { useState } from 'react'
import { auth } from './firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const fn = isNew ? createUserWithEmailAndPassword : signInWithEmailAndPassword
      const result = await fn(auth, email, password)
      onAuth(result.user)
    } catch (e) {
      setError(e.message.replace('Firebase: ', ''))
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '40px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>💧 AquaGuardian</div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Family water tracker</div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eee', padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 16 }}>
          {isNew ? 'Create family account' : 'Sign in'}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 5 }}>Email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 5 }}>Password</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="min. 6 characters"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, boxSizing: 'border-box' }} />
        </div>

        {error && (
          <div style={{ background: '#FAECE7', color: '#993C1D', borderRadius: 8, padding: '10px 12px', fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || !email || !password}
          style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none',
            background: email && password ? '#1D9E75' : '#eee',
            color: email && password ? '#fff' : '#aaa',
            fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          {loading ? 'Please wait...' : isNew ? 'Create account' : 'Sign in'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888' }}>
          {isNew ? 'Already have an account? ' : "New here? "}
          <span onClick={() => setIsNew(n => !n)} style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: 500 }}>
            {isNew ? 'Sign in' : 'Create account'}
          </span>
        </div>
      </div>
    </div>
  )
}