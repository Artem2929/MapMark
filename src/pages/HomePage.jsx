import { Link } from 'react-router-dom'
import { useAuth } from '../authStore'

export function HomePage() {
  const { isAuthenticated, user, clearAuth } = useAuth()

  const handleLogout = () => {
    clearAuth()
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>MapMark</h1>
      <p>Чистий старт з правильною архітектурою</p>
      
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
            background: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px'
          }}>
            Увійти
          </Link>
        </div>
      )}
    </div>
  )
}