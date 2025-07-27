# 🚀 Component Generator Platform

A stateful, AI-driven micro-frontend playground where authenticated users can iteratively generate, preview, tweak, and export React components with all chat history and code edits preserved across logins.

## 🎯 Features

### ✅ Implemented (Core Requirements)
- **Authentication & Persistence**: JWT-based signup/login with MongoDB storage
- **Session Management**: Create, load, and manage component generation sessions
- **User Dashboard**: Beautiful interface to manage sessions with search and filtering
- **State Management**: Robust Zustand stores with auto-save functionality
- **Modern UI**: Responsive design with Tailwind CSS and Framer Motion
- **API Integration**: RESTful API with Express.js and MongoDB
- **Error Handling**: Comprehensive error management and user feedback

### 🔄 In Progress
- **Conversational UI**: Chat interface for component generation
- **AI Integration**: OpenRouter API integration for component generation
- **Code Preview**: Live component rendering and code editor
- **Export Functionality**: Download generated components as ZIP files

### 🚧 Planned (Bonus Features)
- **Interactive Property Editor**: Visual component editing
- **Chat-Driven Overrides**: Target specific elements for refinement
- **Image Upload**: Support for image-based component generation
- **Real-time Collaboration**: Multi-user session support

## 🛠️ Tech Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS, Rate limiting
- **AI Integration**: OpenRouter API (GPT-4o-mini, Claude, Llama, Gemma)
- **Caching**: Redis (configured, not yet implemented)

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **UI Components**: Custom components with Lucide React icons
- **Code Editor**: Monaco Editor (planned)
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- Redis (optional, for caching)
- OpenRouter API key (for AI features)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd component-generator-platform

# Install dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup

**Backend (.env)**:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/component-generator
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
OPENROUTER_API_KEY=your-openrouter-api-key
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env)**:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend    # Backend on :5000
npm run dev:frontend   # Frontend on :5173
```

### 4. Open Your Browser

Navigate to `http://localhost:5173` and create your account!

## 📁 Project Structure

```
component-generator-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── services/       # API calls
│   │   ├── stores/         # Zustand state management
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── .env
├── package.json             # Root package.json
└── README.md
```

## 🏗️ Architecture Overview

### State Management Strategy

**Frontend (Zustand)**:
- `authStore`: User authentication and profile management
- `sessionStore`: Session CRUD, chat history, component code, UI state
- Auto-save functionality with 2-second debounce
- Persistent storage for auth state

**Backend (MongoDB)**:
- `User`: Authentication and profile data
- `Session`: Complete session state including chat history, code, UI state
- Automatic timestamps and session tracking

### API Design

**RESTful Endpoints**:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication  
- `GET /api/auth/me` - Get current user
- `GET /api/sessions` - List user sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Load specific session
- `PUT /api/sessions/:id/code` - Update session code
- `POST /api/ai/generate` - Generate component
- `POST /api/ai/refine` - Refine existing component

### Security Features

- JWT authentication with secure token handling
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation and sanitization
- Error handling without information disclosure

## 🔧 Development Guidelines

### Code Standards
- ES6+ JavaScript with modern React patterns
- Functional components with hooks
- Consistent naming conventions
- Comprehensive error handling
- Responsive design principles

### State Management Rules
- Use Zustand for client state
- Persist auth state only
- Auto-save session changes
- Clear separation of concerns

### API Guidelines
- RESTful design principles
- Consistent error responses
- Input validation on all endpoints
- Secure authentication middleware

## 🚀 Deployment

### Environment Variables for Production

**Backend**:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/component-generator
JWT_SECRET=secure-random-string-256-bits
OPENROUTER_API_KEY=your-production-api-key
CORS_ORIGIN=https://your-domain.com
```

**Frontend**:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Deployment Platforms

**Recommended Platforms**:
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, Heroku
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud, Upstash

### Build Commands

```bash
# Build for production
npm run build

# Backend build
cd backend && npm run build

# Frontend build  
cd frontend && npm run build
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#0ea5e9)
- **Gray Scale**: Custom gray palette
- **Status Colors**: Success, error, warning states

### Typography
- **Font**: Inter (sans-serif)
- **Code**: JetBrains Mono (monospace)

### Components
- Consistent button styles (`btn-primary`, `btn-secondary`, `btn-ghost`)
- Form inputs with focus states
- Card layouts with subtle shadows
- Loading states and animations

## 🔮 Roadmap

### Phase 1: Core Functionality (Current)
- ✅ Authentication system
- ✅ Session management
- ✅ User dashboard
- 🔄 Chat interface
- 🔄 AI component generation

### Phase 2: Advanced Features
- 🚧 Live component preview
- 🚧 Code editor integration
- 🚧 Export functionality
- 🚧 Image upload support

### Phase 3: Premium Features
- 🚧 Interactive property editor
- 🚧 Element targeting
- 🚧 Real-time collaboration
- 🚧 Advanced AI models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Key Decisions & Trade-offs

### Architecture Decisions

1. **Monorepo Structure**: Simplified development and deployment
2. **Zustand over Redux**: Lighter weight, better TypeScript support
3. **MongoDB over PostgreSQL**: Better flexibility for evolving schemas
4. **OpenRouter over Direct APIs**: Multiple model access, better pricing

### Trade-offs Made

1. **Auto-save vs Manual Save**: Chose auto-save for better UX
2. **Client-side vs Server-side Rendering**: SPA for better interactivity
3. **Real-time vs Request-response**: Starting with REST, WebSocket planned
4. **File Storage vs Database**: Using database for simplicity initially

## 🐛 Known Issues

- Workspace page is placeholder (UI implementation in progress)
- Redis caching not yet implemented  
- Image upload functionality planned
- Component preview sandbox needs implementation

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Review the documentation
- Check the development guidelines

---

**Built with ❤️ for the Component Generator Platform Assignment**
