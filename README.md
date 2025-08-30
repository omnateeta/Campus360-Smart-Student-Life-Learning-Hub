# 🎓 Campus 360° - Smart Student Life & Learning Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A comprehensive MERN stack web application that revolutionizes student life management through AI-powered study planning, task management, and productivity tools.

## 🌟 Features

### 🔐 Authentication & Security
- 🔑 JWT token-based authentication
- 🌐 Google OAuth2 integration
- 🔄 Password reset functionality
- 🛡️ Secure session management

### 🧠 AI-Powered Study Planning
- 🤖 Automatic study plan generation using OpenAI API
- 🎯 Intelligent topic prioritization based on difficulty and deadlines
- 🔄 Dynamic plan recalculation based on progress
- 📊 Performance analytics and insights

### 📅 Interactive Study Calendar
- 🗓️ Visual study schedule management
- ⏰ Time blocking and reminders
- 🔄 Sync with Google Calendar
- 📱 Mobile-responsive design

### ✅ Task Management
- 📝 Create and organize study tasks
- 🏷️ Categorize by subjects and priority
- 📊 Progress tracking and analytics
- ⏱️ Time tracking and Pomodoro timer

### 📊 Analytics Dashboard
- 📈 Visual progress tracking
- 📊 Performance metrics and insights
- 🎯 Goal setting and achievement tracking
- 📊 Customizable reports

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB Atlas account or local MongoDB
- OpenAI API key
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/omnateeta/Campus360-Smart-Student-Life-Learning-Hub.git
   cd Campus360-Smart-Student-Life-Learning-Hub
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `backend` directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the application**
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # In a new terminal, start frontend
   cd frontend
   npm start
   ```

## 🛠️ Tech Stack

### Frontend
- React.js
- Material-UI
- Redux for state management
- Chart.js for visualizations

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- OpenAI API integration

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Your Name - [@your_twitter](https://twitter.com/your_handle) - your.email@example.com

Project Link: [https://github.com/omnateeta/Campus360-Smart-Student-Life-Learning-Hub](https://github.com/omnateeta/Campus360-Smart-Student-Life-Learning-Hub)
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
