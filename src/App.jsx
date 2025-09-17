import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import WorldMap from './components/map/WorldMap.jsx'
import CountryFlags from './components/ui/CountryFlags.jsx'
import QuickFilter from './components/ui/QuickFilter.jsx'
import FeatureHub from './components/features/FeatureHub.jsx'
import AdsPage from './pages/AdsPage.jsx'
import CookiePolicy from './pages/CookiePolicy.jsx'
import TermsOfService from './pages/TermsOfService.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import HelpCenter from './pages/HelpCenter.jsx'
import ContactUs from './pages/ContactUs.jsx'
import DiscoverPlaces from './pages/DiscoverPlaces.jsx'

const AppContent = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [isCountriesVisible, setIsCountriesVisible] = useState(false);
  const [mapFilters, setMapFilters] = useState({ country: '', category: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleSearch = (query) => {
    setSearchQuery(query);
    setTimeout(() => setSearchQuery(''), 100);
  };

  const handleFilterChange = (filters) => {
    setMapFilters(filters);
    if (filters.country && mapInstance) {
      // Знаходимо країну та летимо до неї
      searchCountryAndFly(filters.country);
    }
  };

  const searchCountryAndFly = async (countryCode) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&country=${countryCode}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0 && mapInstance) {
        const { lat, lon } = data[0];
        mapInstance.flyTo([parseFloat(lat), parseFloat(lon)], 6, {
          duration: 1.5
        });
      }
    } catch (error) {
      console.error('Country search error:', error);
    }
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
      {isHomePage && <QuickFilter 
        onFilterChange={handleFilterChange}
        onLocationClick={() => {
          console.log('Location button clicked');
          if (window.findMyLocation) {
            console.log('Calling findMyLocation');
            window.findMyLocation();
          } else {
            console.log('findMyLocation not found in window');
          }
        }}
      />}
      <main style={{paddingTop: '64px', flex: 1, overflow: isHomePage ? 'hidden' : 'auto'}}>
        <Routes>
          <Route path="/" element={
            <>
              <WorldMap 
                searchQuery={searchQuery} 
                onMapReady={setMapInstance} 
                filters={mapFilters}
                onLocationUpdate={setUserLocation}
                onPlacesUpdate={setPlaces}
              />
              <FeatureHub 
                userLocation={userLocation}
                places={places}
              />
            </>
          } />
            <Route path="/ads" element={<AdsPage />} />
            <Route path="/about" element={
              <div style={{maxWidth: '1200px', margin: '0 auto', padding: '104px 20px 40px 20px'}}>
                <h1 style={{fontSize: '32px', fontWeight: 'bold', color: '#333'}}>{t(`aboutPage.${currentLang}.title`)}</h1>
                <p style={{marginTop: '16px', color: '#666', lineHeight: '1.6'}}>{t(`aboutPage.${currentLang}.description`)}</p>
              </div>
            } />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/discover-places" element={<DiscoverPlaces />} />
          </Routes>
        </main>
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
