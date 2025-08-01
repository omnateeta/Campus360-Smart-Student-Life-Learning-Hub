const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google user
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Study preferences
  studyPreferences: {
    dailyStudyHours: {
      type: Number,
      default: 4
    },
    preferredStudyTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'evening'
    },
    breakDuration: {
      type: Number,
      default: 15 // minutes
    },
    studySessionDuration: {
      type: Number,
      default: 25 // minutes (Pomodoro)
    },
    subjects: [{
      name: String,
      color: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }]
  },

  // Gamification
  gamification: {
    totalPoints: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    badges: [{
      name: String,
      description: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    streaks: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastStudyDate: Date
    }
  },

  // Settings
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      studyReminders: {
        type: Boolean,
        default: true
      },
      breakReminders: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudy = this.gamification.streaks.lastStudyDate;
  
  if (!lastStudy) {
    // First time studying
    this.gamification.streaks.current = 1;
    this.gamification.streaks.lastStudyDate = today;
  } else {
    const lastStudyDate = new Date(lastStudy);
    lastStudyDate.setHours(0, 0, 0, 0);
    
    const daysDiff = (today - lastStudyDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 1) {
      // Consecutive day
      this.gamification.streaks.current += 1;
      this.gamification.streaks.lastStudyDate = today;
      
      // Update longest streak
      if (this.gamification.streaks.current > this.gamification.streaks.longest) {
        this.gamification.streaks.longest = this.gamification.streaks.current;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      this.gamification.streaks.current = 1;
      this.gamification.streaks.lastStudyDate = today;
    }
    // If daysDiff === 0, same day, don't update
  }
};

// Add points method
userSchema.methods.addPoints = function(points) {
  this.gamification.totalPoints += points;
  
  // Calculate level (every 1000 points = 1 level)
  const newLevel = Math.floor(this.gamification.totalPoints / 1000) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
    return { levelUp: true, newLevel };
  }
  
  return { levelUp: false };
};

// Add badge method
userSchema.methods.addBadge = function(badge) {
  const existingBadge = this.gamification.badges.find(b => b.name === badge.name);
  if (!existingBadge) {
    this.gamification.badges.push(badge);
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
