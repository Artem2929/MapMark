import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './store'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { Header, Footer } from '../components/ui'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import UserProfile from '../pages/UserProfilePage'
import AboutPage from '../pages/AboutPage'
import Friends from '../pages/FriendsPage'
import Messages from '../pages/MessagesPage'
import Photos from '../pages/PhotosPage'
import TermsOfService from '../pages/TermsOfService'
import PrivacyPolicy from '../pages/PrivacyPolicy'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
                <Route path="/friends/:userId" element={<Friends />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/messages/:userId" element={<Messages />} />
                <Route path="/photos/:userId" element={<Photos />} />
                <Route path="/photos" element={<Photos />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}>404 - Сторінка не знайдена</div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}