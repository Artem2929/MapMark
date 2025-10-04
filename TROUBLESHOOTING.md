# MapMark Troubleshooting Guide

## Common Issues and Solutions

### 1. API Connection Errors

#### Problem: `process is not defined`
**Error:** `Uncaught ReferenceError: process is not defined`

**Solution:** 
- ✅ **Fixed:** Updated constants to use `import.meta.env` instead of `process.env`
- Use Vite environment variables: `VITE_API_URL` instead of `REACT_APP_API_URL`

#### Problem: JSON Parse Error
**Error:** `Unexpected token '<', "<!doctype "... is not valid JSON`

**Cause:** Backend API is not running or returning HTML instead of JSON

**Solutions:**
1. **Use Mock Data (Recommended for Development):**
   ```bash
   # Set in .env.local
   VITE_USE_REAL_API=false
   ```

2. **Start Backend Server:**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Check API Endpoint:**
   - Verify `VITE_API_URL` in `.env.local`
   - Default: `http://localhost:3001/api`

### 2. Environment Variables

#### Vite Environment Variables
- Prefix with `VITE_` for client-side access
- Use `import.meta.env.VITE_VARIABLE_NAME`
- Create `.env.local` for local development

#### Example `.env.local`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_USE_REAL_API=false
```

### 3. Development vs Production

#### Development Mode
- Mock data is used by default when backend is unavailable
- API status indicator shows current connection state
- Hot reload and debugging enabled

#### Production Mode
- Real API endpoints are required
- Mock data is disabled
- Optimized build with minification

### 4. CSS Issues

#### Problem: Styles not applying
**Solutions:**
- Check CSS import order in `App.css`
- Verify CSS variables are defined in `styles/variables.css`
- Use proper BEM class names
- Avoid `!important` (use CSS specificity instead)

#### Problem: Theme not switching
**Solutions:**
- Check `useTheme` hook implementation
- Verify CSS variables for both themes
- Ensure theme classes are applied to `<html>` element

### 5. Component Issues

#### Problem: Component not rendering
**Solutions:**
- Check console for JavaScript errors
- Verify all imports are correct
- Ensure component is exported properly
- Check React DevTools for component tree

#### Problem: Hooks not working
**Solutions:**
- Ensure hooks are called inside functional components
- Check hook dependencies array
- Verify custom hooks are imported correctly

### 6. Build Issues

#### Problem: Build fails
**Solutions:**
- Run linting: `npm run lint`
- Fix TypeScript errors if using TS
- Check for unused imports
- Verify all dependencies are installed

#### Problem: Bundle size too large
**Solutions:**
- Use dynamic imports for large components
- Optimize images and assets
- Remove unused dependencies
- Use tree shaking

### 7. Performance Issues

#### Problem: Slow rendering
**Solutions:**
- Use React.memo for expensive components
- Implement proper key props for lists
- Optimize re-renders with useMemo/useCallback
- Check for memory leaks in useEffect

#### Problem: Map performance
**Solutions:**
- Limit number of markers displayed
- Use marker clustering for large datasets
- Implement virtualization for large lists
- Optimize tile layer settings

## Development Tools

### Debugging
1. **React DevTools** - Component inspection
2. **Browser DevTools** - Network and console debugging
3. **API Status Component** - Real-time API connection status
4. **ESLint/Prettier** - Code quality and formatting

### Testing API Connection
```javascript
// Test API endpoint manually
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('API Status:', data))
  .catch(error => console.error('API Error:', error));
```

### Mock Data Toggle
```javascript
// Toggle between mock and real API
// In .env.local
VITE_USE_REAL_API=true  // Use real API
VITE_USE_REAL_API=false // Use mock data
```

## Getting Help

### Before Reporting Issues
1. Check this troubleshooting guide
2. Review console errors
3. Verify environment variables
4. Test with mock data enabled

### Reporting Bugs
Include:
- Error message and stack trace
- Environment variables (without sensitive data)
- Steps to reproduce
- Browser and OS information
- Whether using mock or real API

### Development Workflow
1. Start with mock data enabled
2. Develop and test frontend features
3. Connect to real API when backend is ready
4. Test with real data
5. Deploy to production

## Quick Fixes

### Reset Development Environment
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear browser cache and storage
# Open DevTools > Application > Storage > Clear storage
```

### Force Mock Data
```bash
# In .env.local
VITE_USE_REAL_API=false
```

### Check API Status
- Look for API status indicator in bottom-right corner (development only)
- Green: API connected
- Blue: Using mock data
- Red: API error, fallback to mock