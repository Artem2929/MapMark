import React from 'react';
import './CountryFlags.css';

const CountryFlags = ({ onCountryClick, isVisible }) => {
  console.log('CountryFlags rendered with isVisible:', isVisible);
  const countries = [
    { name: 'Afghanistan', flag: '🇦🇫', coords: [33.9391, 67.7100] },
    { name: 'Albania', flag: '🇦🇱', coords: [41.1533, 20.1683] },
    { name: 'Algeria', flag: '🇩🇿', coords: [28.0339, 1.6596] },
    { name: 'Argentina', flag: '🇦🇷', coords: [-38.4161, -63.6167] },
    { name: 'Armenia', flag: '🇦🇲', coords: [40.0691, 45.0382] },
    { name: 'Australia', flag: '🇦🇺', coords: [-25.2744, 133.7751] },
    { name: 'Austria', flag: '🇦🇹', coords: [47.5162, 14.5501] },
    { name: 'Azerbaijan', flag: '🇦🇿', coords: [40.1431, 47.5769] },
    { name: 'Bangladesh', flag: '🇧🇩', coords: [23.6850, 90.3563] },
    { name: 'Belarus', flag: '🇧🇾', coords: [53.7098, 27.9534] },
    { name: 'Belgium', flag: '🇧🇪', coords: [50.5039, 4.4699] },
    { name: 'Brazil', flag: '🇧🇷', coords: [-14.2350, -51.9253] },
    { name: 'Bulgaria', flag: '🇧🇬', coords: [42.7339, 25.4858] },
    { name: 'Canada', flag: '🇨🇦', coords: [56.1304, -106.3468] },
    { name: 'Chile', flag: '🇨🇱', coords: [-35.6751, -71.5430] },
    { name: 'China', flag: '🇨🇳', coords: [35.8617, 104.1954] },
    { name: 'Colombia', flag: '🇨🇴', coords: [4.5709, -74.2973] },
    { name: 'Croatia', flag: '🇭🇷', coords: [45.1000, 15.2000] },
    { name: 'Czech Republic', flag: '🇨🇿', coords: [49.8175, 15.4730] },
    { name: 'Denmark', flag: '🇩🇰', coords: [56.2639, 9.5018] },
    { name: 'Egypt', flag: '🇪🇬', coords: [26.8206, 30.8025] },
    { name: 'Estonia', flag: '🇪🇪', coords: [58.5953, 25.0136] },
    { name: 'Finland', flag: '🇫🇮', coords: [61.9241, 25.7482] },
    { name: 'France', flag: '🇫🇷', coords: [46.2276, 2.2137] },
    { name: 'Georgia', flag: '🇬🇪', coords: [42.3154, 43.3569] },
    { name: 'Germany', flag: '🇩🇪', coords: [51.1657, 10.4515] },
    { name: 'Greece', flag: '🇬🇷', coords: [39.0742, 21.8243] },
    { name: 'Hungary', flag: '🇭🇺', coords: [47.1625, 19.5033] },
    { name: 'Iceland', flag: '🇮🇸', coords: [64.9631, -19.0208] },
    { name: 'India', flag: '🇮🇳', coords: [20.5937, 78.9629] },
    { name: 'Indonesia', flag: '🇮🇩', coords: [-0.7893, 113.9213] },
    { name: 'Iran', flag: '🇮🇷', coords: [32.4279, 53.6880] },
    { name: 'Iraq', flag: '🇮🇶', coords: [33.2232, 43.6793] },
    { name: 'Ireland', flag: '🇮🇪', coords: [53.4129, -8.2439] },
    { name: 'Israel', flag: '🇮🇱', coords: [31.0461, 34.8516] },
    { name: 'Italy', flag: '🇮🇹', coords: [41.8719, 12.5674] },
    { name: 'Japan', flag: '🇯🇵', coords: [36.2048, 138.2529] },
    { name: 'Kazakhstan', flag: '🇰🇿', coords: [48.0196, 66.9237] },
    { name: 'Kenya', flag: '🇰🇪', coords: [-0.0236, 37.9062] },
    { name: 'Latvia', flag: '🇱🇻', coords: [56.8796, 24.6032] },
    { name: 'Lithuania', flag: '🇱🇹', coords: [55.1694, 23.8813] },
    { name: 'Malaysia', flag: '🇲🇾', coords: [4.2105, 101.9758] },
    { name: 'Mexico', flag: '🇲🇽', coords: [23.6345, -102.5528] },
    { name: 'Morocco', flag: '🇲🇦', coords: [31.7917, -7.0926] },
    { name: 'Netherlands', flag: '🇳🇱', coords: [52.1326, 5.2913] },
    { name: 'New Zealand', flag: '🇳🇿', coords: [-40.9006, 174.8860] },
    { name: 'Nigeria', flag: '🇳🇬', coords: [9.0820, 8.6753] },
    { name: 'Norway', flag: '🇳🇴', coords: [60.4720, 8.4689] },
    { name: 'Pakistan', flag: '🇵🇰', coords: [30.3753, 69.3451] },
    { name: 'Peru', flag: '🇵🇪', coords: [-9.1900, -75.0152] },
    { name: 'Philippines', flag: '🇵🇭', coords: [12.8797, 121.7740] },
    { name: 'Poland', flag: '🇵🇱', coords: [51.9194, 19.1451] },
    { name: 'Portugal', flag: '🇵🇹', coords: [39.3999, -8.2245] },
    { name: 'Romania', flag: '🇷🇴', coords: [45.9432, 24.9668] },
    { name: 'Russia', flag: '🇷🇺', coords: [61.5240, 105.3188] },
    { name: 'Saudi Arabia', flag: '🇸🇦', coords: [23.8859, 45.0792] },
    { name: 'Serbia', flag: '🇷🇸', coords: [44.0165, 21.0059] },
    { name: 'Singapore', flag: '🇸🇬', coords: [1.3521, 103.8198] },
    { name: 'Slovakia', flag: '🇸🇰', coords: [48.6690, 19.6990] },
    { name: 'Slovenia', flag: '🇸🇮', coords: [46.1512, 14.9955] },
    { name: 'South Africa', flag: '🇿🇦', coords: [-30.5595, 22.9375] },
    { name: 'South Korea', flag: '🇰🇷', coords: [35.9078, 127.7669] },
    { name: 'Spain', flag: '🇪🇸', coords: [40.4637, -3.7492] },
    { name: 'Sweden', flag: '🇸🇪', coords: [60.1282, 18.6435] },
    { name: 'Switzerland', flag: '🇨🇭', coords: [46.8182, 8.2275] },
    { name: 'Thailand', flag: '🇹🇭', coords: [15.8700, 100.9925] },
    { name: 'Turkey', flag: '🇹🇷', coords: [38.9637, 35.2433] },
    { name: 'Ukraine', flag: '🇺🇦', coords: [48.3794, 31.1656] },
    { name: 'United Arab Emirates', flag: '🇦🇪', coords: [23.4241, 53.8478] },
    { name: 'United Kingdom', flag: '🇬🇧', coords: [55.3781, -3.4360] },
    { name: 'United States', flag: '🇺🇸', coords: [39.8283, -98.5795] },
    { name: 'Venezuela', flag: '🇻🇪', coords: [6.4238, -66.5897] },
    { name: 'Vietnam', flag: '🇻🇳', coords: [14.0583, 108.2772] }
  ];

  return (
    <div className={`country-flags ${isVisible ? 'visible' : ''}`}>
      <div className="flags-container">
        {countries.map((country, index) => (
          <div
            key={index}
            className="flag-item"
            onClick={() => {
              console.log('Flag clicked:', country.name, country.coords);
              onCountryClick(country.coords);
            }}
            title={country.name}
          >
            <span className="flag-emoji">{country.flag}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountryFlags;