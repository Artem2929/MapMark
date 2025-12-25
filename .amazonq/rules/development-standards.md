# MapMark Development Rules

## 🎯 Core Principles
- Write MINIMAL code - only what's needed to solve the problem
- Ukrainian language for all user-facing text and error messages
- Security-first approach with CSRF protection, input validation, and proper error handling
- NO mock data - everything must work with real frontend-backend-database integration
- NO test data creation unless explicitly requested
- Everything must be logical, functional, and production-ready
- Only implement what is specifically requested - no additional features

## 🔒 Security Standards
- All POST/PUT/DELETE requests MUST have CSRF protection
- Passwords MUST be hashed with bcrypt (rounds=12)
- JWT tokens are signed, NOT hashed
- All user inputs MUST be validated on both frontend and backend
- Error messages in Ukrainian: "Користувач вже існує", "Недійсний CSRF токен"
- Use environment variables for sensitive config (API_BASE_URL, JWT_SECRET)

## 📝 Form Development
- Use useMemo/useCallback for performance optimization
- Consolidate validation logic to avoid duplication
- Add autofocus to first form field
- Implement smooth error animations without form jumping
- Clear errors on field changes
- Show password strength indicators for password fields
- Auto-retry requests with fresh CSRF tokens on 403 errors

## 🎨 Frontend Architecture
- Components in `/src/components/ui/` with index.js exports
- Forms in `/src/features/[feature]/components/`
- Services in `/src/features/[feature]/services/`
- Hooks in `/src/features/[feature]/hooks/`
- Use custom hooks for business logic (useAuth)
- Memoize expensive operations and event handlers

## 🔧 Backend Architecture
- Controllers handle HTTP logic only
- Services contain business logic
- Middleware for cross-cutting concerns (auth, CSRF, logging)
- Validators for input validation with express-validator
- Clean API responses - remove internal fields (__v, _id duplication)
- Rate limiting on auth endpoints
- Structured logging with winston

## 📊 API Response Format
```json
{
  "status": "success|fail|error",
  "data": { "user": { "id", "name", "email", "country", "role", "emailVerified", "createdAt" } },
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

## 🌐 Internationalization
- All user-facing text in Ukrainian
- Error messages translated: "User already exists" → "Користувач вже існує"
- Form labels and placeholders in Ukrainian
- Validation messages in Ukrainian

## 🚀 Performance
- Use React.memo for components that don't need frequent re-renders
- Implement useMemo for expensive calculations
- Use useCallback for event handlers
- Debounce validation where appropriate
- Minimize bundle size with tree shaking

## 🧪 Code Quality
- Enterprise-grade code structure and architecture
- Follow patterns used in large-scale production applications
- TypeScript preferred but not required
- Consistent naming conventions (camelCase for JS, kebab-case for CSS)
- Clean imports and exports
- Remove unused code and dependencies
- Follow single responsibility principle
- Proper error boundaries and error handling
- Comprehensive logging and monitoring
- Code should be maintainable by large teams

## 🎨 CSS/Styling Standards
- NEVER use !important in CSS - fix specificity issues properly
- Use CSS custom properties (variables) for theming
- Follow BEM methodology for class naming
- Modular CSS with proper scoping
- Mobile-first responsive design
- Consistent spacing and typography scales
- Proper CSS cascade and inheritance
- Use semantic HTML elements
- Accessibility-first styling approach

## 📊 Data Management
- NO mock data or hardcoded test data
- All data must come from real database through proper API calls
- Frontend must connect to backend, backend must connect to database
- No placeholder content unless specifically for UI demonstration
- Real data flow: User Input → Frontend → Backend → Database → Response
- Implement proper loading states while fetching real data
- Handle empty states when no real data exists
- Only create seed data if explicitly requested for development setup

## 🏢 Enterprise Architecture Principles
- Follow Domain-Driven Design (DDD) patterns
- Implement proper separation of concerns
- Use dependency injection where appropriate
- Apply SOLID principles consistently
- Implement proper abstraction layers
- Use design patterns (Factory, Observer, Strategy) when beneficial
- Maintain clean architecture boundaries
- Implement proper testing strategies (unit, integration, e2e)
- Use proper error handling and logging throughout the stack
- Follow 12-factor app methodology for deployment
- Implement proper monitoring and observability
- Use feature flags for gradual rollouts
- Maintain comprehensive documentation
- Code reviews and pair programming practices
- Continuous integration and deployment pipelines
## 📱 UX/UI Standards
- Responsive design with mobile-first approach
- Accessible forms with proper ARIA labels
- Loading states for async operations
- Clear error messaging
- Smooth animations and transitions
- Keyboard navigation support
- Follow Material Design or similar design system principles
- Consistent component library usage
- Proper focus management
- Screen reader compatibility