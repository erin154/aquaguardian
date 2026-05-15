import Settings from '../components/Settings'

export default function SettingsPage({ rate, onChange, user }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#333', marginBottom: 16 }}>⚙️ Settings</h2>
      <Settings rate={rate} onChange={onChange} user={user} />
    </div>
  )
}