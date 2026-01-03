import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../shared/api/queryClient'
import { AuthProvider } from './store'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Header, Footer } from '../components/ui'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'

const UserProfile = lazy(() => import('../pages/UserProfilePage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const Friends = lazy(() => import('../pages/FriendsPage'))
const Messages = lazy(() => import('../pages/MessagesPage'))
const Photos = lazy(() => import('../pages/PhotosPage'))
const TermsOfService = lazy(() => import('../pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'))

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    Завантаження...
  </div>
)

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/profile/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                  <Route path="/friends/:userId" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                  <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                  <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/photos/:userId" element={<ProtectedRoute><Photos /></ProtectedRoute>} />
                  <Route path="/photos" element={<ProtectedRoute><Photos /></ProtectedRoute>} />
                  <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}>404 - Сторінка не знайдена</div>} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}