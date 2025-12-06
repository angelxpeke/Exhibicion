import { useState } from 'react';
import { register, login } from '../api.js';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password);
        const result = await login(username, password);
        localStorage.setItem('token', result.token);
        localStorage.setItem('dbName', result.dbName);
        localStorage.setItem('username', username);
        onLoginSuccess();
      } else {
        const result = await login(username, password);
        localStorage.setItem('token', result.token);
        localStorage.setItem('dbName', result.dbName);
        localStorage.setItem('username', username);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.pageContainer}>
      {/* Fondo decorativo con gradientes */}
      <div style={styles.gradientBg1}></div>
      <div style={styles.gradientBg2}></div>

      <div style={styles.container}>
        {/* Logo / Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🎮 Biblioteca de Juegos</h1>
          <p style={styles.subtitle}>Tu gestor de juegos personal</p>
        </div>

        <div style={styles.formWrapper}>
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>
              {isRegister ? '📝 Crear Cuenta' : '🔐 Iniciar Sesión'}
            </h2>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label htmlFor="username" style={styles.label}>Usuario:</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  disabled={loading}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>Contraseña:</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                  style={styles.input}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !username || !password}
                style={{
                  ...styles.submitButton,
                  opacity: loading || !username || !password ? 0.6 : 1,
                }}
              >
                {loading ? '⏳ Cargando...' : isRegister ? '📝 Registrarse' : '🔓 Iniciar Sesión'}
              </button>
            </form>

            <div style={styles.divider}></div>

            <p style={styles.toggleText}>
              {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            </p>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setUsername('');
                setPassword('');
              }}
              disabled={loading}
              style={{
                ...styles.toggleButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {isRegister ? '🔐 Inicia sesión aquí' : '📝 Regístrate aquí'}
            </button>
          </div>

          {/* Card informativo */}
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>✨ ¿Qué es esto?</h3>
            <ul style={styles.infoList}>
              <li>🎯 Gestiona tu biblioteca personal de juegos</li>
              <li>🕐 Registra horas jugadas en cada juego</li>
              <li>⭐ Escribe y lee reseñas de juegos</li>
              <li>🔒 Tu información está protegida y es privada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: 'var(--background)',
    overflow: 'hidden',
  },
  gradientBg1: {
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(91,134,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'float 8s ease-in-out infinite',
  },
  gradientBg2: {
    position: 'absolute',
    bottom: '-30%',
    left: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(126,162,255,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'float 10s ease-in-out infinite reverse',
  },
  container: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '900px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    margin: 0,
    marginBottom: '8px',
    background: 'linear-gradient(135deg, var(--accent) 0%, #7ea2ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    margin: 0,
    fontWeight: '500',
  },
  formWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    alignItems: 'start',
  },
  formCard: {
    padding: '40px',
    borderRadius: '20px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '30px',
    color: 'var(--text)',
    margin: 0,
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    fontSize: '0.95rem',
    color: 'var(--text)',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid var(--border)',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: 'var(--surface-2)',
    color: 'var(--text)',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  submitButton: {
    width: '100%',
    padding: '14px 20px',
    marginTop: '24px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    fontSize: '1.05rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(91,134,255,0.3)',
    letterSpacing: '0.5px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border)',
    margin: '24px 0',
  },
  toggleText: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    marginBottom: '12px',
    fontSize: '0.95rem',
    margin: '16px 0 12px 0',
  },
  toggleButton: {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '2px solid var(--accent)',
    backgroundColor: 'transparent',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    letterSpacing: '0.3px',
  },
  error: {
    padding: '14px 16px',
    marginBottom: '20px',
    borderRadius: '10px',
    backgroundColor: '#fee2e2',
    color: '#7f1d1d',
    border: '2px solid #fca5a5',
    fontWeight: '500',
  },
  infoCard: {
    padding: '30px',
    borderRadius: '20px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
  },
  infoTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '16px',
    color: 'var(--text)',
    margin: '0 0 16px 0',
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  '@media (max-width: 768px)': {
    formWrapper: {
      gridTemplateColumns: '1fr',
    },
  },
};

// Añadir estilos globales para animación
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(20px); }
    }
    
    input:focus {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 4px rgba(91,134,255,0.1) !important;
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(91,134,255,0.2) !important;
    }
    
    button:active:not(:disabled) {
      transform: translateY(0px);
    }
    
    @media (max-width: 768px) {
      .pageContainer { padding: 16px; }
      .formCard { padding: 30px 24px; }
    }
  `;
  document.head.appendChild(styleSheet);
}
