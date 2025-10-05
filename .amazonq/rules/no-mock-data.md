# No Mock Data Rule

## Rule: ALL data must come from API endpoints only

No hardcoded arrays, objects, or mock data anywhere in the codebase. All data must be fetched from backend API endpoints.

### ✅ Correct:
```javascript
import { useCountries } from '../hooks/useCountries';

const MyComponent = () => {
  const { countries, loading, error } = useCountries();
  // Use countries from API
};
```

### ❌ Incorrect:
```javascript
// NO hardcoded data anywhere
const countries = [{ id: 'ua', name: 'Ukraine' }];
const categories = [{ id: 'food', name: 'Food' }];
const mockUsers = [{ id: 1, name: 'John' }];
```

### Available API Services:
- `CountriesService.getCountries()` - Get countries from /api/countries
- `useCountries()` hook - React hook for countries
- `CountrySelect` component - Pre-built country selector

### Enforcement:
- Backend data files should only contain real data needed for API responses
- Frontend components must use API services and hooks
- No static arrays or objects for application data