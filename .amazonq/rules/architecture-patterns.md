# MapMark Architecture Patterns

## 🏗️ Project Structure
```
src/
├── components/ui/          # Reusable UI components
├── features/              # Feature-based modules
│   └── auth/
│       ├── components/    # Feature-specific components
│       ├── hooks/         # Feature-specific hooks
│       ├── services/      # API services
│       └── types/         # TypeScript types
├── utils/                 # Utility functions
├── styles/               # Global styles
└── app/                  # App configuration
```

## 🔄 Data Flow Patterns
1. **Forms**: Component → Hook → Service → API
2. **State**: Zustand store for global state, useState for local
3. **Validation**: Frontend validation + Backend validation
4. **Error Handling**: Try-catch with user-friendly messages

## 🎯 Component Patterns
- **Container/Presentation**: Separate logic from UI
- **Custom Hooks**: Extract reusable logic (useAuth, useForm)
- **Compound Components**: For complex UI patterns
- **Render Props**: For flexible component composition

## 🔐 Security Patterns
- **CSRF Protection**: All state-changing requests
- **Input Sanitization**: Both client and server side
- **Rate Limiting**: Prevent abuse
- **JWT + Refresh Tokens**: Secure authentication
- **Environment Variables**: Sensitive configuration

## 📡 API Patterns
- **RESTful URLs**: `/api/v1/auth/register`
- **HTTP Status Codes**: 200, 201, 400, 401, 403, 404, 500
- **Consistent Response Format**: status, data, message
- **Error Codes**: Machine-readable error identification
- **Pagination**: For list endpoints
- **Versioning**: `/api/v1/` prefix