import { Link } from 'react-router-dom'
import { useAuthStore } from '../app/store'

export function HomePage() {
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>MapMark</h1>
      <p>Професійна архітектура готова!</p>
      
      {isAuthenticated ? (
        <div>
          <p>Привіт, {user?.name || user?.email}!</p>
          <button onClick={handleLogout}>Вийти</button>
        </div>
      ) : (
        <div>
          <p>Ви не авторизовані</p>
          <Link to="/login" style={{ 
            display: 'inline-block',
            padding: '10px 20px',
            background: 'var(--color-primary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)'
          }}>
            Увійти
          </Link>
        </div>
      )}
    </div>
  )
}