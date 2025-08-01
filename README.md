# 🧠 AI Study Planner + Tracker

A comprehensive MERN stack web application that helps students plan, manage, and track their study goals using AI assistance.

## 🚀 Features

### 🔐 Authentication
- JWT token-based authentication
- Google OAuth2 integration
- Password reset functionality

### 🧠 AI-Powered Study Planning
- Automatic study plan generation using OpenAI API
- Intelligent topic prioritization
- Dynamic plan recalculation

### 📅 Interactive Calendar
- Drag-and-drop task management
- Weekly and daily views
- Color-coded subjects

### ✅ Task Tracking
- Progress tracking with streak counters
- Completion feedback
- Motivation prompts

### 🧘 Focus Timer
- Built-in Pomodoro timer
- Session analytics
- Ambient music integration

### 📊 Smart Analytics
- Progress dashboards
- Time tracking
- AI-powered insights

### 💬 AI Study Assistant
- Chat-based study help
- Topic summaries
- Study tips and guides

### 📚 Notes Management
- Markdown support
- PDF summarization
- Tag-based organization

### 🎯 Gamification
- Achievement badges
- Point system
- Streak tracking

### 📱 PWA Support
- Mobile-friendly design
- Offline capabilities
- Push notifications

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Material UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, Google OAuth2
- **AI**: OpenAI API
- **State Management**: Context API
- **Real-time**: Socket.IO
- **PWA**: Service Workers

## 🏗️ Project Structure

```
AI_Study_Planner/
├── backend/                 # Node.js/Express backend
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   └── utils/              # Utility functions
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Context providers
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS/Tailwind styles
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- OpenAI API key
- Google OAuth credentials

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AI_Study_Planner
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
# Backend .env
MONGODB_URI=mongodb://localhost:27017/ai-study-planner
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend .env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

5. Start the development servers
```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm start
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Password reset

### Study Plan Endpoints
- `GET /api/study-plans` - Get user's study plans
- `POST /api/study-plans` - Create new study plan
- `PUT /api/study-plans/:id` - Update study plan
- `DELETE /api/study-plans/:id` - Delete study plan

### Task Endpoints
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### AI Endpoints
- `POST /api/ai/generate-plan` - Generate study plan
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/summarize` - Summarize content

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
