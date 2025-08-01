const express = require('express');
const auth = require('../middleware/auth');
const StudyPlan = require('../models/StudyPlan');
const Task = require('../models/Task');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/study-plans
// @desc    Get all study plans for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, subject, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user.userId };
    if (status) query.status = status;
    if (subject) query.subject = new RegExp(subject, 'i');

    const studyPlans = await StudyPlan.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await StudyPlan.countDocuments(query);

    res.json({
      studyPlans,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get study plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study-plans/:id
// @desc    Get single study plan
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    res.json({ studyPlan });
  } catch (error) {
    console.error('Get study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/study-plans
// @desc    Create new study plan
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('examDate').isISO8601().withMessage('Valid exam date is required'),
  body('totalHours').isNumeric().withMessage('Total hours must be a number'),
  body('dailyHours').isNumeric().withMessage('Daily hours must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studyPlan = new StudyPlan({
      ...req.body,
      user: req.user.userId
    });

    await studyPlan.save();

    res.status(201).json({
      message: 'Study plan created successfully',
      studyPlan
    });
  } catch (error) {
    console.error('Create study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/study-plans/:id
// @desc    Update study plan
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    Object.assign(studyPlan, req.body);
    await studyPlan.save();

    res.json({
      message: 'Study plan updated successfully',
      studyPlan
    });
  } catch (error) {
    console.error('Update study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/study-plans/:id
// @desc    Delete study plan
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Delete associated tasks
    await Task.deleteMany({ studyPlan: studyPlan._id });

    await StudyPlan.findByIdAndDelete(req.params.id);

    res.json({ message: 'Study plan deleted successfully' });
  } catch (error) {
    console.error('Delete study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/study-plans/:id/complete-topic
// @desc    Mark topic as completed
// @access  Private
router.post('/:id/complete-topic', auth, async (req, res) => {
  try {
    const { topicIndex } = req.body;
    
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    const completed = studyPlan.completeTopicById(topicIndex);
    if (!completed) {
      return res.status(400).json({ message: 'Topic not found or already completed' });
    }

    await studyPlan.save();

    // Award points to user
    const user = req.userDoc;
    const pointsAwarded = user.addPoints(50);
    await user.save();

    res.json({
      message: 'Topic marked as completed',
      studyPlan,
      pointsAwarded
    });
  } catch (error) {
    console.error('Complete topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study-plans/:id/progress
// @desc    Get detailed progress for study plan
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Get related tasks
    const tasks = await Task.find({ studyPlan: studyPlan._id });
    
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const totalStudyTime = tasks.reduce((total, task) => total + task.getTotalStudyTime(), 0);

    const progressData = {
      studyPlan: studyPlan.progress,
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
        pending: tasks.filter(task => task.status === 'pending').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        overdue: tasks.filter(task => task.status === 'overdue').length
      },
      timeTracking: {
        totalStudyTime,
        averageSessionTime: completedTasks.length > 0 ? totalStudyTime / completedTasks.length : 0,
        recommendedDailyHours: studyPlan.getRecommendedDailyHours()
      },
      weeklyProgress: studyPlan.weeklyGoals.map(week => ({
        weekNumber: week.weekNumber,
        targetHours: week.targetHours,
        actualHours: week.actualHours,
        completion: week.completed,
        efficiency: week.targetHours > 0 ? (week.actualHours / week.targetHours) * 100 : 0
      }))
    };

    res.json({ progress: progressData });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/study-plans/:id/insights
// @desc    Add AI insight to study plan
// @access  Private
router.post('/:id/insights', auth, async (req, res) => {
  try {
    const { type, message, priority } = req.body;
    
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    studyPlan.addInsight({ type, message, priority });
    await studyPlan.save();

    res.json({
      message: 'Insight added successfully',
      studyPlan
    });
  } catch (error) {
    console.error('Add insight error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
