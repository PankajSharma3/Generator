# 🚀 Component Generator Platform

An AI-driven React component generator platform where authenticated users can iteratively generate, preview, tweak, and export React components with full chat history and code persistence across logins.

## 📖 Overview

This is a full-stack micro-frontend playground that allows users to:
- Generate React components using AI (OpenAI/OpenRouter)
- Preview components in real-time
- Iterate and refine components through conversational UI
- Export components as downloadable ZIP files
- Manage multiple sessions with full persistence
- Resume work exactly where they left off

## 🧰 Tech Stack

### Backend
- **Node.js + Express** - RESTful API server
- **MongoDB** - Data persistence for users, sessions, and components
- **Redis** - Session state caching
- **Socket.io** - Real-time updates
- **JWT** - Authentication
- **OpenAI/OpenRouter** - AI component generation

### Frontend
- **React + Vite** - Modern frontend build tool
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time connection

## 🎯 Core Features

### ✅ Mandatory Requirements
- [x] **Authentication & Persistence** - Signup/Login with JWT
- [x] **Session Management** - Create, list, and resume sessions
- [x] **Conversational UI** - Side-panel chat with AI
- [x] **Component Generation** - AI-powered React component creation
- [x] **Live Preview** - Real-time component rendering
- [x] **Code Inspection** - Syntax-highlighted JSX/CSS tabs
- [x] **Export Functionality** - Download components as ZIP files
- [x] **State Persistence** - Auto-save and resume functionality

### 🚧 Optional Features (In Progress)
- [ ] **Iterative Refinement** - Chat-based component modifications
- [ ] **Interactive Property Editor** - Visual component editing
- [ ] **Chat-Driven Overrides** - Element-specific modifications
- [ ] **Image Input Support** - Generate from design mockups

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Redis (optional, for caching)
- AI API Key (OpenAI or OpenRouter)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd component-generator-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install:all
```

### 3. Environment Configuration

#### Backend Environment
Create `backend/.env` from `backend/.env.example`:
```bash
cd backend
cp .env.example .env
```

Configure your environment variables:
```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/component-generator

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379

# AI Service
OPENAI_API_KEY=your-openai-api-key-here
# OR
OPENROUTER_API_KEY=your-openrouter-api-key-here
AI_MODEL=gpt-4o-mini

# CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Start Services

#### Option 1: Start Everything (Recommended)
```bash
npm run dev
```

#### Option 2: Start Individually
```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm run client:dev
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
PUT  /api/auth/profile     # Update profile
POST /api/auth/logout      # Logout
```

### Session Management
```
GET  /api/sessions         # List user sessions
POST /api/sessions         # Create new session
GET  /api/sessions/:id     # Get session details
PUT  /api/sessions/:id     # Update session
DELETE /api/sessions/:id   # Delete session
```

### AI Component Generation
```
POST /api/ai/chat/:sessionId      # Generate component
POST /api/ai/refine/:sessionId    # Refine existing component
POST /api/ai/regenerate/:sessionId # Regenerate component
GET  /api/ai/models               # List available AI models
```

### Export Features
```
GET  /api/export/component/:sessionId  # Export as ZIP
GET  /api/export/code/:sessionId       # Get raw code
```

## 🏗️ Architecture

### State Management Strategy
- **Zustand** for client-side state management
- **MongoDB** for persistent data storage
- **Redis** for session caching (optional)
- **Socket.io** for real-time updates

### Component Generation Flow
1. User sends message via chat interface
2. Frontend calls AI API with context
3. AI generates JSX + CSS code
4. Backend saves to database
5. Frontend updates preview in real-time
6. Socket.io notifies connected clients

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-url>
JWT_SECRET=<strong-random-secret>
OPENAI_API_KEY=<your-api-key>
FRONTEND_URL=<your-frontend-domain>
```

### Build for Production
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Deployment Platforms
- **Vercel** (Frontend)
- **Railway/Render** (Backend)
- **MongoDB Atlas** (Database)
- **Redis Cloud** (Caching)

## 🧪 Testing

### Backend API Testing
```bash
cd backend
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Session creation and management
- [ ] Component generation via chat
- [ ] Component preview rendering
- [ ] Code export functionality
- [ ] Real-time updates via Socket.io

## 🔧 Development

### Project Structure
```
component-generator-platform/
├── backend/                 # Express.js API server
│   ├── config/             # Database and service configs
│   ├── middleware/         # Authentication, validation, etc.
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic (AI service)
│   └── server.js           # Main server file
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── stores/         # Zustand state management
│   │   ├── services/       # API and Socket.io clients
│   │   └── App.jsx         # Main app component
│   └── public/             # Static assets
└── package.json            # Root package.json
```

### Adding New Features
1. **Backend**: Add routes in `backend/routes/`
2. **Frontend**: Add components in `frontend/src/components/`
3. **State**: Update Zustand stores in `frontend/src/stores/`
4. **API**: Extend API service in `frontend/src/services/api.js`

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod --config /usr/local/etc/mongod.conf
```

#### Redis Connection Error
```bash
# Redis is optional, but if using:
redis-server
```

#### AI API Errors
- Verify your API key is correct
- Check your OpenAI/OpenRouter account balance
- Ensure the model specified exists

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📋 Evaluation Criteria

This project addresses the following requirements:

### Mandatory Features (95 points)
- ✅ **Auth & Backend** (10 pts) - JWT, bcrypt, REST endpoints
- ✅ **State Management** (15 pts) - Zustand + MongoDB persistence
- ✅ **AI Integration** (20 pts) - OpenAI/OpenRouter with error handling
- ✅ **Micro-Frontend Rendering** (10 pts) - Secure component preview
- ✅ **Code Editor & Export** (10 pts) - Syntax highlighting, ZIP export
- 🚧 **Iterative Workflow** (10 pts) - Chat refinement (in progress)
- ✅ **Persistence & Resume** (10 pts) - Auto-save and session loading
- ✅ **Polish & Accessibility** (10 pts) - Responsive, ARIA, loading states

### Bonus Features (+45 points)
- 🚧 **Interactive Property Editor** - Visual component editing
- 🚧 **Chat-Driven Overrides** - Element-specific modifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Demo

**Live Demo**: [Coming Soon]

**GitHub Repository**: [Your Repository URL]

---

*Built with ❤️ for the Component Generator Platform Assignment*
