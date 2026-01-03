# pinPointt Backend

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Update `.env` with your values:

- Generate secure JWT_SECRET: `openssl rand -base64 32`
- Set your MongoDB URI
- Configure other settings as needed

3. Install dependencies:

```bash
npm install
```

4. Start development server:

```bash
npm run dev
```

## Environment Variables

Required:

- `JWT_SECRET` - Secret key for JWT tokens (generate with `openssl rand -base64 32`)

Optional:

- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh-token` - Refresh access token

### Health Check

- `GET /health` - Server health status
