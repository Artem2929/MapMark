import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Header } from '../components/ui/Header/Header'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import UserProfile from '../pages/UserProfilePage'
import AboutPage from '../pages/AboutPage'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="*" element={<div>404 - Сторінка не знайдена</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}