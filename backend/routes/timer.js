const express = require('express');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Timer session schema
const timerSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  type: {
    type: String,
    enum: ['pomodoro', 'custom', 'break'],
    default: 'pomodoro'
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  actualDuration: {
    type: Number, // in minutes
    default: 0
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  completed: {
    type: Boolean,
    default: false
  },
  paused: {
    type: Boolean,
    default: false
  },
  pausedTime: {
    type: Number, // total paused time in minutes
    default: 0
  }
}, {
  timestamps: true
});

const TimerSession = mongoose.model('TimerSession', timerSessionSchema);

// @route   POST /api/timer/start
// @desc    Start a timer session
// @access  Private
router.post('/start', auth, async (req, res) => {
  try {
    const { taskId, type = 'pomodoro', duration = 25 } = req.body;

    const session = new TimerSession({
      user: req.user.userId,
      task: taskId,
      type,
      duration,
      startTime: new Date()
    });

    await session.save();

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`user-${req.user.userId}`).emit('timer-started', {
      sessionId: session._id,
      duration,
      type,
      startTime: session.startTime
    });

    res.json({
      message: 'Timer started successfully',
      session
    });
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timer/:id/pause
// @desc    Pause timer session
// @access  Private
router.post('/:id/pause', auth, async (req, res) => {
  try {
    const session = await TimerSession.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Timer session not found' });
    }

    session.paused = true;
    await session.save();

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`user-${req.user.userId}`).emit('timer-paused', {
      sessionId: session._id
    });

    res.json({
      message: 'Timer paused successfully',
      session
    });
  } catch (error) {
    console.error('Pause timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timer/:id/resume
// @desc    Resume timer session
// @access  Private
router.post('/:id/resume', auth, async (req, res) => {
  try {
    const session = await TimerSession.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Timer session not found' });
    }

    session.paused = false;
    await session.save();

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`user-${req.user.userId}`).emit('timer-resumed', {
      sessionId: session._id
    });

    res.json({
      message: 'Timer resumed successfully',
      session
    });
  } catch (error) {
    console.error('Resume timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timer/:id/complete
// @desc    Complete timer session
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { actualDuration } = req.body;
    
    const session = await TimerSession.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Timer session not found' });
    }

    session.completed = true;
    session.endTime = new Date();
    session.actualDuration = actualDuration || session.duration;
    await session.save();

    // Emit real-time event
    const io = req.app.get('io');
    io.to(`user-${req.user.userId}`).emit('timer-completed', {
      sessionId: session._id,
      actualDuration: session.actualDuration
    });

    res.json({
      message: 'Timer completed successfully',
      session
    });
  } catch (error) {
    console.error('Complete timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/timer/sessions
// @desc    Get timer sessions for user
// @access  Private
router.get('/sessions', auth, async (req, res) => {
  try {
    const { date, page = 1, limit = 20 } = req.query;
    
    const query = { user: req.user.userId };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.startTime = { $gte: startDate, $lt: endDate };
    }

    const sessions = await TimerSession.find(query)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('task', 'title subject');

    const total = await TimerSession.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get timer sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
