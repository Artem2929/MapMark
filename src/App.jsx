import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import WorldMap from './components/WorldMap.jsx'

const AppContent = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleSearch = (query) => {
    setSearchQuery(query);
    setTimeout(() => setSearchQuery(''), 100);
  };

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column'}}>
      <Header onSearch={handleSearch} />
      <main style={{paddingTop: '64px', flex: 1}}>
        <Routes>
          <Route path="/" element={<WorldMap searchQuery={searchQuery} />} />
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
        <Footer />
      </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App
