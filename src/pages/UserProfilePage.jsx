import { useParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '../app/store'
import { Header } from '../components/ui/Header'

export function UserProfilePage() {
  const { userId } = useParams()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) {
    return <div>Завантаження...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="page-container">
      <Header />
      <div className="content-container">
        <h1>Профіль користувача: {userId}</h1>
        <p>Поточний користувач: {user?.name}</p>
      </div>
    </div>
  )
}