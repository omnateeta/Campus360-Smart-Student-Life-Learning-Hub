const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar, studyPreferences, settings } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (studyPreferences) user.studyPreferences = { ...user.studyPreferences, ...studyPreferences };
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        studyPreferences: user.studyPreferences,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/gamification
// @desc    Get user gamification data
// @access  Private
router.get('/gamification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('gamification');
    res.json({ gamification: user.gamification });
  } catch (error) {
    console.error('Get gamification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
