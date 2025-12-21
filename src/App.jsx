import './App.css'
import './styles/global.css'
import './styles/micro-interactions.css'
import './styles/tagging.css'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useCallback, useMemo } from 'react'
import { useOptimizedState } from './hooks/useOptimizedState';
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import WorldMap from './components/map/WorldMap.jsx'
import CountryFlags from './components/ui/CountryFlags.jsx'
import QuickFilter from './components/ui/QuickFilter.jsx'
import FeatureHub from './components/features/FeatureHub.jsx'
import ProgressWidget from './components/ui/ProgressWidget.jsx'
import AdsPage from './pages/AdsPage'
import AdDetailPage from './pages/AdDetailPage'

import CookiePolicy from './pages/CookiePolicy.jsx'
import TermsOfService from './pages/TermsOfService.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import HelpCenter from './pages/HelpCenter.jsx'
import ContactUs from './pages/ContactUs.jsx'
import DiscoverPlaces from './pages/DiscoverPlaces.jsx'
import PostDetail from './pages/PostDetail.jsx'
import SavedPlaces from './pages/SavedPlaces.jsx'
import UserProfile from './pages/UserProfile.jsx'

import QuickReviewForm from './components/forms/QuickReviewForm.jsx'
import Messages from './pages/Messages.jsx'
import Chat from './pages/Chat.jsx'
import Followers from './pages/Followers.jsx'
import Following from './pages/Following.jsx'
import Friends from './pages/Friends.jsx'
import Login from './pages/Login/index.js'
import Register from './pages/Register/index.js'
import About from './pages/About/index.js'
import SellerProfile from './pages/SellerProfile.jsx'
import Photos from './pages/Photos.jsx'
import Services from './pages/Services.jsx'

const AppContent = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [searchQuery, setSearchQuery] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [isCountriesVisible, setIsCountriesVisible] = useState(false);
  const [mapFilters, setMapFilters] = useState({ country: '', category: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [userReviewCount, setUserReviewCount] = useState(0);
  const [showQuickReviewForm, setShowQuickReviewForm] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleAddReviewClick = () => {
    setShowQuickReviewForm(true);
    setIsReviewFormOpen(true);
  };

  const handleQuickReviewSubmit = (reviewData) => {
    console.log('Quick review submitted:', reviewData);
    setUserReviewCount(prev => prev + 1);
    setShowQuickReviewForm(false);
    setIsReviewFormOpen(false);
  };

  const handleQuickReviewClose = () => {
    setShowQuickReviewForm(false);
    setIsReviewFormOpen(false);
  };

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
    <div style={isHomePage ? {height: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', overflow: 'hidden'} : {minHeight: '100vh', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column'}}>
      <Header 
        onSearch={handleSearch} 
        isCountriesVisible={isCountriesVisible}
        setIsCountriesVisible={setIsCountriesVisible}
        isReviewFormOpen={isReviewFormOpen}
      />
      {isHomePage && !isReviewFormOpen && <CountryFlags 
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
      {isHomePage && !isReviewFormOpen && <QuickFilter 
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
      <main style={isHomePage ? {paddingTop: '64px', flex: 1, overflow: 'hidden'} : {paddingTop: '64px', flex: 1}}>
        <Routes>
          <Route path="/" element={
            <>
              <WorldMap 
                searchQuery={searchQuery} 
                onMapReady={setMapInstance} 
                filters={mapFilters}
                onLocationUpdate={setUserLocation}
                onPlacesUpdate={setPlaces}
                onReviewFormToggle={setIsReviewFormOpen}
                onReviewSubmit={() => setUserReviewCount(prev => prev + 1)}
              />
              {!isReviewFormOpen && <ProgressWidget onReviewAdded={userReviewCount} />}
              <FeatureHub 
                userLocation={userLocation}
                places={places}
                isReviewFormOpen={isReviewFormOpen}
              />

              {showQuickReviewForm && (
                <QuickReviewForm 
                  onClose={handleQuickReviewClose}
                  onSubmit={handleQuickReviewSubmit}
                />
              )}
            </>
          } />
            <Route path="/ads" element={<AdsPage />} />
            <Route path="/ads/:id" element={<AdDetailPage />} />

            <Route path="/about" element={<About />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/discover-places" element={<DiscoverPlaces />} />
            <Route path="/posts/:postId" element={<PostDetail />} />
            <Route path="/saved-places" element={<SavedPlaces />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/seller/:sellerId" element={<SellerProfile />} />
            <Route path="/messages/:userId" element={<Messages />} />
            <Route path="/chat/:userId" element={<Chat />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/friends/:userId" element={<Friends />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/photos/:userId" element={<Photos />} />
            <Route path="/user/:userId/followers" element={<Followers />} />
            <Route path="/user/:userId/following" element={<Following />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      {!isHomePage && !isAuthPage && <Footer />}
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
