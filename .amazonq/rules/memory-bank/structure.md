# MapMark - Project Structure

## Overall Architecture
MapMark follows a full-stack monorepo structure with separate frontend and backend applications, containerized with Docker for development and deployment.

```
MapMark/
├── frontend/           # React application (root level)
├── backend/           # Node.js API server
├── .amazonq/          # AI assistant rules and documentation
└── docker-compose.yml # Container orchestration
```

## Frontend Structure (React + Vite)
```
src/
├── app/               # Application configuration
│   ├── App.jsx       # Main app component
│   └── store.jsx     # State management setup
├── components/        # Reusable UI components
│   ├── ui/           # Basic UI elements
│   ├── forms/        # Form components
│   ├── layout/       # Layout components
│   └── ErrorBoundary/ # Error handling
├── features/          # Feature-based modules
│   ├── auth/         # Authentication feature
│   ├── contact/      # Contact management
│   ├── friends/      # Friend connections
│   ├── messages/     # Messaging system
│   └── profile/      # User profiles
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── services/         # API communication
├── utils/            # Utility functions
├── styles/           # Global styles and CSS
└── shared/           # Shared resources
    ├── api/          # API utilities
    ├── types/        # Type definitions
    └── utils/        # Shared utilities
```

## Backend Structure (Node.js + Express)
```
backend/src/
├── config/           # Configuration files
├── controllers/      # HTTP request handlers
├── middleware/       # Express middleware
├── models/           # Database models (Mongoose)
├── routes/           # API route definitions
├── services/         # Business logic layer
├── validators/       # Input validation
├── utils/            # Utility functions
├── types/            # Type definitions
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## Core Components & Relationships

### Frontend Architecture
- **App.jsx**: Main application component with routing
- **Features**: Modular feature organization (auth, friends, messages, profile)
- **Components**: Reusable UI components with consistent styling
- **Services**: API communication layer
- **Hooks**: Custom React hooks for business logic

### Backend Architecture
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data processing
- **Models**: Define database schemas and relationships
- **Middleware**: Handle cross-cutting concerns (auth, validation, logging)
- **Routes**: Define API endpoints and route handlers

### Database Layer
- **MongoDB**: Primary database for user data, messages, photos
- **Mongoose**: ODM for schema definition and data validation

## Architectural Patterns

### Frontend Patterns
- **Feature-based organization**: Code organized by business features
- **Container/Presentation**: Separation of logic and UI components
- **Custom Hooks**: Reusable business logic extraction
- **Context API**: State management for user authentication

### Backend Patterns
- **MVC Architecture**: Model-View-Controller separation
- **Service Layer**: Business logic abstraction
- **Middleware Pipeline**: Request processing chain
- **Repository Pattern**: Data access abstraction through Mongoose

### Security Architecture
- **JWT Authentication**: Stateless token-based auth
- **CSRF Protection**: Cross-site request forgery prevention
- **Input Validation**: Multi-layer validation (frontend + backend)
- **Rate Limiting**: API abuse prevention

## Development Environment
- **Docker Compose**: Multi-container development setup
- **Hot Reload**: Automatic code reloading for both frontend and backend
- **Logging**: Structured logging with Winston
- **Health Checks**: Built-in service monitoring