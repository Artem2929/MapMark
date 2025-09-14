import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header.jsx'

function App() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <BrowserRouter>
      <div style={{minHeight: '100vh', backgroundColor: '#f9f9f9'}}>
        <Header />
        <main style={{paddingTop: '60px'}}>
          <Routes>
            <Route path="/" element={
              <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px 20px'}}>
                <h1 style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>{t('pages.home.title')}</h1>
                <p style={{marginTop: '16px', color: '#666'}}>{t('pages.home.welcome')}</p>
              </div>
            } />
            <Route path="/ads" element={
              <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px 20px'}}>
                <h1 style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>{t('pages.listings.title')}</h1>
                <p style={{marginTop: '16px', color: '#666'}}>{t('pages.listings.description')}</p>
              </div>
            } />
            <Route path="/about" element={
              <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px 20px'}}>
                <h1 style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>{t(`about.${currentLang}.title`)}</h1>
                <p style={{marginTop: '16px', color: '#666', lineHeight: '1.6'}}>{t(`about.${currentLang}.description`)}</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
