const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studyPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyPlan'
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
  topic: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['study', 'review', 'practice', 'exam', 'assignment', 'other'],
    default: 'study'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled', 'overdue'],
    default: 'pending'
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    start: {
      type: String, // HH:MM format
      required: true
    },
    end: {
      type: String, // HH:MM format
      required: true
    }
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  actualDuration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Completion tracking
  completion: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completedAt: Date,
    notes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Pomodoro tracking
  pomodoroSessions: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    duration: {
      type: Number, // in minutes
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['work', 'short-break', 'long-break'],
      default: 'work'
    }
  }],
  
  // Reminders
  reminders: [{
    time: {
      type: Date,
      required: true
    },
    message: String,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  
  // Recurring task settings
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date,
    daysOfWeek: [Number] // 0-6 (Sunday-Saturday)
  },
  
  // AI-generated content
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiSuggestions: [{
    type: {
      type: String,
      enum: ['time-adjustment', 'break-reminder', 'difficulty-adjustment', 'resource-suggestion'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    applied: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resources and notes
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'article', 'book', 'pdf', 'website', 'other'],
      default: 'other'
    }
  }],
  
  tags: [String],
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

// Indexes for better performance
taskSchema.index({ user: 1, scheduledDate: 1 });
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ studyPlan: 1 });
taskSchema.index({ subject: 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  
  const now = new Date();
  const scheduled = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.end.split(':');
  scheduled.setHours(parseInt(hours), parseInt(minutes));
  
  return now > scheduled;
});

// Update status to overdue if necessary
taskSchema.pre('save', function(next) {
  if (this.isOverdue && this.status === 'pending') {
    this.status = 'overdue';
  }
  next();
});

// Method to start a pomodoro session
taskSchema.methods.startPomodoroSession = function(duration = 25) {
  const session = {
    startTime: new Date(),
    duration: duration,
    type: 'work'
  };
  
  this.pomodoroSessions.push(session);
  this.status = 'in-progress';
  
  return session;
};

// Method to complete a pomodoro session
taskSchema.methods.completePomodoroSession = function(sessionIndex) {
  if (this.pomodoroSessions[sessionIndex]) {
    this.pomodoroSessions[sessionIndex].endTime = new Date();
    this.pomodoroSessions[sessionIndex].completed = true;
    
    // Update actual duration
    const sessionDuration = this.pomodoroSessions[sessionIndex].duration;
    this.actualDuration += sessionDuration;
    
    return true;
  }
  return false;
};

// Method to mark task as completed
taskSchema.methods.markCompleted = function(notes = '', rating = null) {
  this.status = 'completed';
  this.completion.percentage = 100;
  this.completion.completedAt = new Date();
  this.completion.notes = notes;
  if (rating) this.completion.rating = rating;
  
  return this;
};

// Method to calculate total study time
taskSchema.methods.getTotalStudyTime = function() {
  return this.pomodoroSessions
    .filter(session => session.completed && session.type === 'work')
    .reduce((total, session) => total + session.duration, 0);
};

// Method to get next reminder
taskSchema.methods.getNextReminder = function() {
  const now = new Date();
  return this.reminders
    .filter(reminder => !reminder.sent && reminder.time > now)
    .sort((a, b) => a.time - b.time)[0];
};

module.exports = mongoose.model('Task', taskSchema);
