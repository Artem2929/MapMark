import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import WorldMap from './components/WorldMap.jsx'
import CountryFlags from './components/CountryFlags.jsx'

const AppContent = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [isCountriesVisible, setIsCountriesVisible] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleSearch = (query) => {
    setSearchQuery(query);
    setTimeout(() => setSearchQuery(''), 100);
  };

  return (
    <div style={{height: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
      <Header 
        onSearch={handleSearch} 
        isCountriesVisible={isCountriesVisible}
        setIsCountriesVisible={setIsCountriesVisible}
      />
      {isHomePage && <CountryFlags 
        isVisible={isCountriesVisible}
        onCountryClick={(coords) => {
          console.log('Country clicked:', coords, 'mapInstance:', mapInstance);
          if (mapInstance && coords && coords.length === 2) {
            console.log('Flying to:', coords);
            mapInstance.flyTo([coords[0], coords[1]], 6, {
              duration: 1.5
            });
          }
        }} 
      />}
      <main style={{paddingTop: '64px', flex: 1}}>
        <Routes>
          <Route path="/" element={<WorldMap searchQuery={searchQuery} onMapReady={setMapInstance} />} />
            <Route path="/ads" element={
              <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px 20px'}}>
                <h1 style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>{t('pages.listings.title')}</h1>
                <p style={{marginTop: '16px', color: '#666'}}>{t('pages.listings.description')}</p>
              </div>
            } />
            <Route path="/about" element={
              <div style={{maxWidth: '1200px', margin: '0 auto', padding: '104px 20px 40px 20px'}}>
                <h1 style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>{t(`aboutPage.${currentLang}.title`)}</h1>
                <p style={{marginTop: '16px', color: '#666', lineHeight: '1.6'}}>{t(`aboutPage.${currentLang}.description`)}</p>
              </div>
            } />
          </Routes>
        </main>
        {!isHomePage && <Footer />}
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
