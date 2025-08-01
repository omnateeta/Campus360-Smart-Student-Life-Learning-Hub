const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      status, 
      subject, 
      date, 
      priority,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = { user: req.user.userId };
    
    if (status) query.status = status;
    if (subject) query.subject = new RegExp(subject, 'i');
    if (priority) query.priority = priority;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.scheduledDate = { $gte: startDate, $lt: endDate };
    }

    const tasks = await Task.find(query)
      .sort({ scheduledDate: 1, 'scheduledTime.start': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('studyPlan', 'title subject');

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId
    }).populate('studyPlan', 'title subject');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('topic').trim().isLength({ min: 1 }).withMessage('Topic is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('estimatedDuration').isNumeric().withMessage('Estimated duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = new Task({
      ...req.body,
      user: req.user.userId
    });

    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.assign(task, req.body);
    await task.save();

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { notes, rating } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.markCompleted(notes, rating);
    await task.save();

    // Update user streak and points
    const user = req.userDoc;
    user.updateStreak();
    const pointsResult = user.addPoints(25);
    
    // Check for badges
    const badges = [];
    if (user.gamification.streaks.current === 7) {
      const weekWarriorBadge = {
        name: 'Week Warrior',
        description: '7-day study streak',
        icon: '🔥'
      };
      if (user.addBadge(weekWarriorBadge)) {
        badges.push(weekWarriorBadge);
      }
    }

    await user.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${user._id}`).emit('task-completed', {
      task,
      pointsAwarded: 25,
      levelUp: pointsResult.levelUp,
      newLevel: pointsResult.newLevel,
      badges,
      streak: user.gamification.streaks.current
    });

    res.json({
      message: 'Task completed successfully',
      task,
      pointsAwarded: 25,
      levelUp: pointsResult.levelUp,
      newLevel: pointsResult.newLevel,
      badges,
      streak: user.gamification.streaks.current
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/start-pomodoro
// @desc    Start pomodoro session for task
// @access  Private
router.post('/:id/start-pomodoro', auth, async (req, res) => {
  try {
    const { duration = 25 } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const session = task.startPomodoroSession(duration);
    await task.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.userId}`).emit('pomodoro-started', {
      taskId: task._id,
      session
    });

    res.json({
      message: 'Pomodoro session started',
      session,
      task
    });
  } catch (error) {
    console.error('Start pomodoro error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/complete-pomodoro
// @desc    Complete pomodoro session
// @access  Private
router.post('/:id/complete-pomodoro', auth, async (req, res) => {
  try {
    const { sessionIndex } = req.body;
    
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const completed = task.completePomodoroSession(sessionIndex);
    if (!completed) {
      return res.status(400).json({ message: 'Session not found' });
    }

    await task.save();

    // Award points for completed pomodoro
    const user = req.userDoc;
    const pointsResult = user.addPoints(10);
    await user.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.userId}`).emit('pomodoro-completed', {
      taskId: task._id,
      sessionIndex,
      pointsAwarded: 10
    });

    res.json({
      message: 'Pomodoro session completed',
      task,
      pointsAwarded: 10,
      levelUp: pointsResult.levelUp
    });
  } catch (error) {
    console.error('Complete pomodoro error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/calendar/:date
// @desc    Get tasks for specific date (calendar view)
// @access  Private
router.get('/calendar/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user.userId,
      scheduledDate: { $gte: startDate, $lte: endDate }
    })
    .sort({ 'scheduledTime.start': 1 })
    .populate('studyPlan', 'title subject color');

    res.json({ tasks });
  } catch (error) {
    console.error('Get calendar tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/week/:startDate
// @desc    Get tasks for a week
// @access  Private
router.get('/week/:startDate', auth, async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const tasks = await Task.find({
      user: req.user.userId,
      scheduledDate: { $gte: startDate, $lt: endDate }
    })
    .sort({ scheduledDate: 1, 'scheduledTime.start': 1 })
    .populate('studyPlan', 'title subject color');

    // Group tasks by date
    const tasksByDate = {};
    tasks.forEach(task => {
      const dateKey = task.scheduledDate.toISOString().split('T')[0];
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });

    res.json({ tasksByDate });
  } catch (error) {
    console.error('Get week tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
