import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './store'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { UserProfilePage } from '../pages/UserProfilePage'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="*" element={<div>404 - Сторінка не знайдена</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}