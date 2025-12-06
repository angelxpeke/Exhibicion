import { useEffect, useState } from 'react'
import './App.css'
import Juegos from './components/Juegos.jsx'
import Resenas from './components/Resenas.jsx'
import Login from './components/Login.jsx'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [tab, setTab] = useState('juegos')
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('username');
    if (token && user) {
      setIsAuthenticated(true);
      setUsername(user);
    }
  }, []);

  useEffect(() => {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    setTheme(prefersLight ? 'light' : 'dark')
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function handleLoginSuccess() {
    const user = localStorage.getItem('username');
    setUsername(user);
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('dbName');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    setTab('juegos');
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>🎮 Biblioteca de Juegos</h1>
          <span style={{ fontSize: '0.85rem', opacity: 0.7, backgroundColor: 'var(--surface-2)', padding: '4px 12px', borderRadius: '20px' }}>
            👤 {username}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ padding: '8px 14px', minWidth: 'auto' }}>
            {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
          </button>
          <button className="btn" onClick={handleLogout} style={{ padding: '8px 14px', minWidth: 'auto', backgroundColor: '#fee2e2', color: '#7f1d1d', border: '1px solid #fca5a5' }}>
            🚪 Salir
          </button>
        </div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === 'juegos' ? 'active' : ''}`} onClick={() => setTab('juegos')}>🎮 Juegos</button>
        <button className={`tab ${tab === 'resenas' ? 'active' : ''}`} onClick={() => setTab('resenas')}>⭐ Reseñas</button>
      </div>
      {tab === 'juegos' ? <Juegos /> : <Resenas />}
    </div>
  )
}

export default App
