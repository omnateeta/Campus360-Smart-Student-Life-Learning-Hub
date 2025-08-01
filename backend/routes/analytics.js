const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    // Get user data
    const user = await User.findById(userId);

    // Get tasks analytics
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, status: 'completed' });
    const todayTasks = await Task.countDocuments({
      user: userId,
      scheduledDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // Get study plans analytics
    const activeStudyPlans = await StudyPlan.countDocuments({ user: userId, status: 'active' });
    const completedStudyPlans = await StudyPlan.countDocuments({ user: userId, status: 'completed' });

    // Calculate study time this week
    const weekTasks = await Task.find({
      user: userId,
      scheduledDate: { $gte: startOfWeek, $lt: endOfWeek },
      status: 'completed'
    });

    const weeklyStudyTime = weekTasks.reduce((total, task) => total + task.getTotalStudyTime(), 0);

    // Get subject-wise progress
    const subjectProgress = await Task.aggregate([
      { $match: { user: userId, status: 'completed' } },
      {
        $group: {
          _id: '$subject',
          totalTime: { $sum: '$actualDuration' },
          taskCount: { $sum: 1 }
        }
      },
      { $sort: { totalTime: -1 } }
    ]);

    // Get daily activity for the past week
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTasks = await Task.find({
        user: userId,
        scheduledDate: { $gte: date, $lt: nextDate },
        status: 'completed'
      });

      const dayStudyTime = dayTasks.reduce((total, task) => total + task.getTotalStudyTime(), 0);

      dailyActivity.push({
        date: date.toISOString().split('T')[0],
        studyTime: dayStudyTime,
        tasksCompleted: dayTasks.length
      });
    }

    const analytics = {
      overview: {
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        todayTasks,
        activeStudyPlans,
        completedStudyPlans,
        weeklyStudyTime,
        currentStreak: user.gamification.streaks.current,
        totalPoints: user.gamification.totalPoints,
        level: user.gamification.level
      },
      subjectProgress,
      dailyActivity,
      gamification: {
        badges: user.gamification.badges,
        streaks: user.gamification.streaks,
        level: user.gamification.level,
        totalPoints: user.gamification.totalPoints,
        pointsToNextLevel: (user.gamification.level * 1000) - user.gamification.totalPoints
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/study-time
// @desc    Get detailed study time analytics
// @access  Private
router.get('/study-time', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const userId = req.user.userId;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        endDate = new Date();
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        endDate = new Date();
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
    }

    const tasks = await Task.find({
      user: userId,
      scheduledDate: { $gte: startDate, $lte: endDate },
      status: 'completed'
    });

    const timeAnalytics = {
      totalStudyTime: tasks.reduce((total, task) => total + task.getTotalStudyTime(), 0),
      averageSessionTime: tasks.length > 0 ? tasks.reduce((total, task) => total + task.getTotalStudyTime(), 0) / tasks.length : 0,
      totalSessions: tasks.length,
      subjectBreakdown: {},
      dailyBreakdown: {}
    };

    // Subject breakdown
    tasks.forEach(task => {
      if (!timeAnalytics.subjectBreakdown[task.subject]) {
        timeAnalytics.subjectBreakdown[task.subject] = 0;
      }
      timeAnalytics.subjectBreakdown[task.subject] += task.getTotalStudyTime();
    });

    // Daily breakdown
    tasks.forEach(task => {
      const dateKey = task.scheduledDate.toISOString().split('T')[0];
      if (!timeAnalytics.dailyBreakdown[dateKey]) {
        timeAnalytics.dailyBreakdown[dateKey] = 0;
      }
      timeAnalytics.dailyBreakdown[dateKey] += task.getTotalStudyTime();
    });

    res.json({ timeAnalytics });
  } catch (error) {
    console.error('Get study time analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
