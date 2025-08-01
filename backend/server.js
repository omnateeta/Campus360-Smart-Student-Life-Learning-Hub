const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studyPlanRoutes = require('./routes/studyPlans');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const notesRoutes = require('./routes/notes');
const analyticsRoutes = require('./routes/analytics');
const timerRoutes = require('./routes/timer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room for personalized notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle timer events
  socket.on('timer-start', (data) => {
    socket.to(`user-${data.userId}`).emit('timer-started', data);
  });

  socket.on('timer-pause', (data) => {
    socket.to(`user-${data.userId}`).emit('timer-paused', data);
  });

  socket.on('timer-complete', (data) => {
    socket.to(`user-${data.userId}`).emit('timer-completed', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
console.log('🔄 Registering routes...');
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered at /api/auth');
}
if (userRoutes) {
  app.use('/api/users', userRoutes);
  console.log('✅ User routes registered at /api/users');
}
if (studyPlanRoutes) {
  app.use('/api/study-plans', studyPlanRoutes);
  console.log('✅ StudyPlan routes registered at /api/study-plans');
}
if (taskRoutes) {
  app.use('/api/tasks', taskRoutes);
  console.log('✅ Task routes registered at /api/tasks');
}
if (aiRoutes) {
  app.use('/api/ai', aiRoutes);
  console.log('✅ AI routes registered at /api/ai');
}
if (notesRoutes) {
  app.use('/api/notes', notesRoutes);
  console.log('✅ Notes routes registered at /api/notes');
}
if (analyticsRoutes) {
  app.use('/api/analytics', analyticsRoutes);
  console.log('✅ Analytics routes registered at /api/analytics');
}
if (timerRoutes) {
  app.use('/api/timer', timerRoutes);
  console.log('✅ Timer routes registered at /api/timer');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
