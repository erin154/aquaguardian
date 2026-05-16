import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',          label: 'Home',      icon: '💧' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/bill',      label: 'Bill',      icon: '💰' },
  { to: '/settings',  label: 'Settings',  icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '10px 0 24px',
      zIndex: 100,
    }}>
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            gap: 2,
            color: isActive ? '#1D9E75' : '#aaa',
            fontSize: 11,
            fontWeight: isActive ? 600 : 400,
            minWidth: 50,
            transition: 'color 0.2s',
          })}
        >
          <span style={{ fontSize: 22 }}>{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}