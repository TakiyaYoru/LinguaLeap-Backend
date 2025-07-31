// ===============================================
// USER PROGRESS MODEL - LINGUALEAP
// ===============================================

import mongoose from "mongoose";

const { Schema } = mongoose;

export const UserProgressSchema = new Schema(
  {
    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // Course progress
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    
    // Current progress
    currentUnitId: {
      type: Schema.Types.ObjectId,
      ref: 'Unit',
      default: null
    },
    currentLessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null
    },
    
    // Completed items
    completedUnits: [{
      unitId: {
        type: Schema.Types.ObjectId,
        ref: 'Unit'
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: {
        type: Number,
        default: 0
      },
      xpEarned: {
        type: Number,
        default: 0
      },
      diamondsEarned: {
        type: Number,
        default: 0
      }
    }],
    
    completedLessons: [{
      lessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: {
        type: Number,
        default: 0
      },
      xpEarned: {
        type: Number,
        default: 0
      },
      diamondsEarned: {
        type: Number,
        default: 0
      }
    }],
    
    // Exercise progress
    exerciseProgress: [{
      exerciseId: {
        type: Schema.Types.ObjectId,
        ref: 'Exercise'
      },
      attempts: {
        type: Number,
        default: 0
      },
      correctAnswers: {
        type: Number,
        default: 0
      },
      lastAttemptAt: {
        type: Date,
        default: Date.now
      },
      bestScore: {
        type: Number,
        default: 0
      }
    }],
    
    // Daily progress
    dailyProgress: {
      date: {
        type: Date,
        default: Date.now
      },
      xpEarned: {
        type: Number,
        default: 0
      },
      lessonsCompleted: {
        type: Number,
        default: 0
      },
      exercisesCompleted: {
        type: Number,
        default: 0
      },
      streakMaintained: {
        type: Boolean,
        default: false
      }
    },
    
    // Statistics
    totalLessonsCompleted: {
      type: Number,
      default: 0
    },
    totalUnitsCompleted: {
      type: Number,
      default: 0
    },
    totalExercisesCompleted: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    
    // Last activity
    lastActivityAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'user_progress'
  }
);

// Compound indexes
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, lastActivityAt: -1 });
UserProgressSchema.index({ courseId: 1, totalLessonsCompleted: -1 });

// Virtual for completion percentage
UserProgressSchema.virtual('completionPercentage').get(function() {
  // This will be calculated based on course total lessons
  return this._completionPercentage || 0;
});

// Virtual for course status
UserProgressSchema.virtual('courseStatus').get(function() {
  return this._courseStatus || 'in_progress'; // not_started, in_progress, completed
});

// Ensure virtual fields are serialized
UserProgressSchema.set('toJSON', { virtuals: true });
UserProgressSchema.set('toObject', { virtuals: true });

export const UserProgress = mongoose.model('UserProgress', UserProgressSchema); 