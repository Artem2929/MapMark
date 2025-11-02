# Security Guidelines

## 🔒 Implemented Security Measures

### Backend Security

1. **Authentication & Authorization**
   - JWT tokens with secure secrets
   - Password hashing with bcrypt (12 rounds)
   - Rate limiting on auth endpoints
   - Input validation with Joi

2. **Data Protection**
   - MongoDB injection prevention
   - XSS protection with xss-clean
   - CORS configuration
   - Helmet.js security headers

3. **File Upload Security**
   - File type validation
   - File size limits
   - Suspicious filename detection
   - Secure file storage

### Frontend Security

1. **Input Sanitization**
   - DOMPurify for HTML content
   - Form validation with Yup
   - Secure file upload component

2. **API Security**
   - Centralized API error handling
   - Credential management
   - Request validation

## 🚀 Setup Instructions

### Environment Variables

Create `.env` file:
```bash
# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
BCRYPT_ROUNDS=12

# Database
DB_URL=mongodb://127.0.0.1:27017/mapmark
NODE_ENV=development

# API
VITE_API_URL=http://localhost:3001/api
PORT=3001

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Development only
SEED_PASSWORD=TempPassword123!
```

### Install Dependencies

Backend:
```bash
cd backend/server
npm install helmet joi express-mongo-sanitize xss-clean
```

Frontend:
```bash
npm install dompurify react-hook-form @hookform/resolvers yup
```

## ⚠️ Security Checklist

### Production Deployment

- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Code Review

- [ ] No hardcoded credentials
- [ ] Input validation on all endpoints
- [ ] Proper error handling
- [ ] Sanitized HTML output
- [ ] Secure file uploads
- [ ] Authentication on protected routes

## 🛡️ Best Practices

1. **Never commit sensitive data**
2. **Always validate user input**
3. **Use HTTPS in production**
4. **Implement proper logging**
5. **Regular dependency updates**
6. **Security testing**

## 📞 Security Issues

Report security vulnerabilities to: security@mapmark.com