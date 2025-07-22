import mongoose from 'mongoose';

const ExerciseProgressSchema = new mongoose.Schema({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
  score: { type: Number },
  attempts: { type: Number, default: 0 },
  lastAttemptedAt: { type: Date },
  wrongAnswers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }],
}, { _id: false });

const LessonProgressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  status: { type: String, enum: ['locked', 'unlocked', 'in_progress', 'completed'], default: 'locked' },
  completedAt: { type: Date },
  exerciseProgress: [ExerciseProgressSchema],
}, { _id: false });

const UnitProgressSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  status: { type: String, enum: ['locked', 'unlocked', 'in_progress', 'completed'], default: 'locked' },
  completedAt: { type: Date },
  lessonProgress: [LessonProgressSchema],
}, { _id: false });

const FastTrackHistorySchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  lessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  challengeAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserChallengeAttempt' },
  completedAt: { type: Date },
}, { _id: false });

const UserLearnmapProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  unitProgress: [UnitProgressSchema],
  hearts: { type: Number, default: 5 },
  lastHeartUpdate: { type: Date },
  fastTrackHistory: [FastTrackHistorySchema],
}, { timestamps: true });

UserLearnmapProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const UserLearnmapProgress = mongoose.model('UserLearnmapProgress', UserLearnmapProgressSchema); 