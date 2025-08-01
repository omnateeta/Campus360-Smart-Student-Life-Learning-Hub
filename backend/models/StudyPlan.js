const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  totalHours: {
    type: Number,
    required: true
  },
  dailyHours: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  
  // AI-generated content
  aiGenerated: {
    type: Boolean,
    default: false
  },
  syllabus: [{
    topic: {
      type: String,
      required: true
    },
    subtopics: [String],
    estimatedHours: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    notes: String
  }],
  
  // Weekly breakdown
  weeklyGoals: [{
    weekNumber: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    topics: [{
      topic: String,
      hours: Number,
      completed: {
        type: Boolean,
        default: false
      }
    }],
    targetHours: {
      type: Number,
      required: true
    },
    actualHours: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Progress tracking
  progress: {
    totalTopicsCompleted: {
      type: Number,
      default: 0
    },
    totalTopics: {
      type: Number,
      default: 0
    },
    percentageComplete: {
      type: Number,
      default: 0
    },
    hoursStudied: {
      type: Number,
      default: 0
    },
    averageDailyHours: {
      type: Number,
      default: 0
    },
    daysRemaining: {
      type: Number,
      default: 0
    },
    onTrack: {
      type: Boolean,
      default: true
    }
  },
  
  // Milestones
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetDate: {
      type: Date,
      required: true
    },
    targetPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  
  // AI insights and recommendations
  aiInsights: [{
    type: {
      type: String,
      enum: ['recommendation', 'warning', 'tip', 'achievement'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    dismissed: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
studyPlanSchema.index({ user: 1, status: 1 });
studyPlanSchema.index({ examDate: 1 });
studyPlanSchema.index({ subject: 1 });

// Calculate progress before saving
studyPlanSchema.pre('save', function(next) {
  if (this.syllabus && this.syllabus.length > 0) {
    const completedTopics = this.syllabus.filter(topic => topic.completed).length;
    const totalTopics = this.syllabus.length;
    
    this.progress.totalTopicsCompleted = completedTopics;
    this.progress.totalTopics = totalTopics;
    this.progress.percentageComplete = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    
    // Calculate days remaining
    const today = new Date();
    const examDate = new Date(this.examDate);
    const timeDiff = examDate.getTime() - today.getTime();
    this.progress.daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    
    // Check if on track
    const expectedProgress = this.progress.daysRemaining > 0 ? 
      Math.max(0, 100 - (this.progress.daysRemaining / ((examDate.getTime() - this.createdAt.getTime()) / (1000 * 3600 * 24))) * 100) : 100;
    this.progress.onTrack = this.progress.percentageComplete >= (expectedProgress * 0.8); // 80% tolerance
  }
  
  next();
});

// Method to add AI insight
studyPlanSchema.methods.addInsight = function(insight) {
  this.aiInsights.push(insight);
  
  // Keep only last 20 insights
  if (this.aiInsights.length > 20) {
    this.aiInsights = this.aiInsights.slice(-20);
  }
};

// Method to update topic completion
studyPlanSchema.methods.completeTopicById = function(topicIndex) {
  if (this.syllabus[topicIndex] && !this.syllabus[topicIndex].completed) {
    this.syllabus[topicIndex].completed = true;
    this.syllabus[topicIndex].completedAt = new Date();
    return true;
  }
  return false;
};

// Method to calculate recommended daily hours
studyPlanSchema.methods.getRecommendedDailyHours = function() {
  const remainingTopics = this.syllabus.filter(topic => !topic.completed);
  const remainingHours = remainingTopics.reduce((total, topic) => total + topic.estimatedHours, 0);
  
  if (this.progress.daysRemaining <= 0) return remainingHours;
  
  return Math.ceil(remainingHours / this.progress.daysRemaining);
};

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
