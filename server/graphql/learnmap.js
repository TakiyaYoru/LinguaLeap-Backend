import { GraphQLError } from 'graphql';
import { UserLearnmapProgress } from '../data/models/userLearnmapProgress.js';
import { Course, Unit, Lesson } from '../data/models/index.js';
import { Exercise } from '../data/models/index.js';

export const learnmapTypeDefs = `
  # User Learnmap Progress Types
  type UserLearnmapProgress {
    _id: ID!
    userId: ID!
    courseId: ID!
    unitProgress: [UnitProgress!]!
    hearts: Int!
    lastHeartUpdate: String!
    fastTrackHistory: [FastTrackHistory!]!
  }

  type UnitProgress {
    unitId: ID!
    status: String!
    completedAt: String
    lessonProgress: [LessonProgress!]!
  }

  type LessonProgress {
    lessonId: ID!
    status: String!
    completedAt: String
    exerciseProgress: [ExerciseProgress!]!
    reviewHistory: [ReviewHistory!]
  }

  type ExerciseProgress {
    exerciseId: ID!
    status: String!
    score: Int!
    attempts: Int!
    lastAttemptedAt: String!
    wrongAnswers: [String!]!
  }

  type FastTrackHistory {
    unitId: ID
    lessonIds: [ID!]!
    challengeAttemptId: ID
    completedAt: String!
  }

  type ReviewHistory {
    score: Int
    xpEarned: Int
    coinEarned: Int
    reviewedAt: String!
  }

  # Exercise Types
  type Exercise {
    _id: ID!
    title: String
    instruction: String!
    type: String!
    question: ExerciseQuestion!
    content: String! # JSON string containing exercise-specific content
    maxScore: Int!
    difficulty: String!
    feedback: ExerciseFeedback!
    timeLimit: Int
    estimatedTime: Int!
    xpReward: Int!
    sortOrder: Int!
  }

  type ExerciseQuestion {
    text: String!
    audioUrl: String
    imageUrl: String
    videoUrl: String
  }

  type ExerciseFeedback {
    correct: String!
    incorrect: String!
    hint: String
  }

  # Payload Types
  type StartCourseLearnmapPayload {
    success: Boolean!
    message: String!
    userLearnmapProgress: UserLearnmapProgress
  }

  type UpdateLearnmapProgressPayload {
    success: Boolean!
    message: String!
    userLearnmapProgress: UserLearnmapProgress
  }

  type FastTrackLearnmapPayload {
    success: Boolean!
    message: String!
    userLearnmapProgress: UserLearnmapProgress
  }

  type ReviewCompletedLessonPayload {
    success: Boolean!
    message: String!
    userLearnmapProgress: UserLearnmapProgress
  }

  type GetExercisesByLessonPayload {
    success: Boolean!
    message: String!
    exercises: [Exercise!]
  }

  type UpdateExerciseProgressPayload {
    success: Boolean!
    message: String!
    exerciseProgress: ExerciseProgress
  }

  # Input Types
  input ProgressInput {
    unitId: ID
    lessonId: ID
    exerciseId: ID
    status: String
    score: Int
    attempts: Int
    completedAt: String
    wrongAnswers: [String!]
    hearts: Int
  }

  input FastTrackInput {
    unitId: ID
    lessonIds: [ID!]
    challengeAttemptId: ID
    completedAt: String
  }

  input ReviewInput {
    unitId: ID!
    lessonId: ID!
    score: Int
    xpEarned: Int
    coinEarned: Int
    reviewedAt: String
  }

  input ExerciseProgressInput {
    exerciseId: ID!
    status: String!
    score: Int
    attempts: Int
    wrongAnswers: [String!]
  }

  # Extend Query
  extend type Query {
    userLearnmapProgress(courseId: ID!): UserLearnmapProgress
    getExercisesByLesson(lessonId: ID!): GetExercisesByLessonPayload!
  }

  # Extend Mutation
  extend type Mutation {
    startCourseLearnmap(courseId: ID!): StartCourseLearnmapPayload!
    updateLearnmapProgress(courseId: ID!, progressInput: ProgressInput!): UpdateLearnmapProgressPayload!
    fastTrackLearnmap(courseId: ID!, fastTrackInput: FastTrackInput!): FastTrackLearnmapPayload!
    reviewCompletedLesson(courseId: ID!, reviewInput: ReviewInput!): ReviewCompletedLessonPayload!
    updateExerciseProgress(lessonId: ID!, exerciseProgressInput: ExerciseProgressInput!): UpdateExerciseProgressPayload!
  }
`;

export const learnmapResolvers = {
  Query: {
    userLearnmapProgress: async (parent, { courseId }, context) => {
      try {
        console.log('🔍 [userLearnmapProgress] Query for courseId:', courseId);
        console.log('🔍 [userLearnmapProgress] Context user:', context.user);
        
        if (!context.user) {
          console.log('❌ [userLearnmapProgress] No user in context');
          return null;
        }
        
        // Fix: context.user already contains userId from auth middleware
        const userId = context.user.userId;
        console.log('🔍 [userLearnmapProgress] Using userId:', userId);
        console.log('🔍 [userLearnmapProgress] Full context.user:', JSON.stringify(context.user, null, 2));
        
        const doc = await UserLearnmapProgress.findOne({ userId, courseId });
        console.log('🔍 [userLearnmapProgress] Found doc:', doc ? `ID: ${doc._id}, Units: ${doc.unitProgress.length}` : 'null');
        
        return doc;
      } catch (error) {
        console.error('[userLearnmapProgress] Error:', error);
        return null;
      }
    },
    getExercisesByLesson: async (parent, { lessonId }, context) => {
      try {
        console.log('🔄 [getExercisesByLesson] Getting exercises for lesson:', lessonId);
        
        if (!context.user) {
          return { success: false, message: 'Not authenticated', exercises: [] };
        }

        const exercises = await Exercise.find({ lessonId }).sort({ sortOrder: 1 });
        console.log(`✅ [getExercisesByLesson] Found ${exercises.length} exercises`);

        // Serialize exercises và convert content field thành JSON string
        const serializedExercises = exercises.map(ex => {
          const exerciseObj = ex.toObject();
          // Convert content object to JSON string if it's an object
          if (exerciseObj.content && typeof exerciseObj.content === 'object') {
            exerciseObj.content = JSON.stringify(exerciseObj.content);
          }
          return exerciseObj;
        });

        return { 
          success: true, 
          message: `Found ${exercises.length} exercises`, 
          exercises: serializedExercises 
        };
      } catch (error) {
        console.error('[getExercisesByLesson] Error:', error);
        return { success: false, message: 'Internal server error', exercises: [] };
      }
    },
  },
  Mutation: {
    startCourseLearnmap: async (parent, { courseId }, context) => {
      try {
        console.log('🔄 [startCourseLearnmap] Starting for course:', courseId);
        
        if (!context.user) {
          return { success: false, message: 'Not authenticated', userLearnmapProgress: null };
        }

        // Kiểm tra xem đã có progress chưa
        let doc = await UserLearnmapProgress.findOne({ userId: context.user._id, courseId });
        if (doc) {
          console.log('✅ [startCourseLearnmap] Progress already exists');
          return { success: true, message: 'Progress already exists', userLearnmapProgress: doc.toObject() };
        }

        // Lấy course và units
        const course = await Course.findById(courseId);
        if (!course) {
          return { success: false, message: 'Course not found', userLearnmapProgress: null };
        }

        const units = await Unit.find({ courseId }).sort({ sortOrder: 1 });
        if (!units.length) {
          return { success: false, message: 'No units found for this course', userLearnmapProgress: null };
        }

        // Tạo progress cho từng unit và lesson
        const unitProgress = [];
        for (let i = 0; i < units.length; i++) {
          const unit = units[i];
          const lessons = await Lesson.find({ unitId: unit._id }).sort({ sortOrder: 1 });
          if (!lessons.length) {
            console.log(`⚠️ Unit ${unit.title} has no lessons, skipping...`);
            continue; // Skip unit if no lessons
          }
          const lessonProgress = lessons.map((lesson, idx) => ({
            lessonId: lesson._id,
            status: idx === 0 && unitProgress.length === 0 ? 'unlocked' : 'locked', // Unlock first lesson of first valid unit
            completedAt: null,
            exerciseProgress: [],
          }));
          unitProgress.push({
            unitId: unit._id,
            status: unitProgress.length === 0 ? 'unlocked' : 'locked', // Unlock first valid unit
            completedAt: null,
            lessonProgress,
          });
        }
        
        // Kiểm tra xem có unit nào có lessons không
        if (unitProgress.length === 0) {
          return { success: false, message: 'No units with lessons found for this course', userLearnmapProgress: null };
        }
        
        doc = await UserLearnmapProgress.create({
          userId: context.user._id,
          courseId,
          unitProgress,
          hearts: 5,
          lastHeartUpdate: new Date(),
          fastTrackHistory: [],
        });
        return { success: true, message: 'Progress initialized', userLearnmapProgress: doc.toObject() };
      } catch (error) {
        console.error('[startCourseLearnmap] Unexpected error:', error);
        return { success: false, message: 'Internal server error', userLearnmapProgress: null };
      }
    },
    updateLearnmapProgress: async (parent, { courseId, progressInput }, context) => {
      try {
        console.log('🔄 [updateLearnmapProgress] Starting with:', { courseId, progressInput });
        
        if (!context.user) return { success: false, message: 'Not authenticated', userLearnmapProgress: null };
        let doc = await UserLearnmapProgress.findOne({ userId: context.user._id, courseId });
        if (!doc) return { success: false, message: 'No progress found for this course', userLearnmapProgress: null };
        
        console.log('📊 [updateLearnmapProgress] Found doc:', doc._id);
        console.log('📊 [updateLearnmapProgress] Current unitProgress:', doc.unitProgress.length);
        
        let updated = false;
        
        // Cập nhật hearts nếu có
        if (typeof progressInput.hearts === 'number') {
          console.log('💓 [updateLearnmapProgress] Updating hearts:', progressInput.hearts);
          doc.hearts = progressInput.hearts;
          doc.lastHeartUpdate = new Date();
          updated = true;
        }
        
        // Cập nhật lesson
        if (progressInput.unitId && progressInput.lessonId && !progressInput.exerciseId) {
          console.log('📚 [updateLearnmapProgress] Updating lesson:', { 
            unitId: progressInput.unitId, 
            lessonId: progressInput.lessonId, 
            status: progressInput.status 
          });
          
          const unit = doc.unitProgress.find(u => u.unitId.toString() === progressInput.unitId);
          if (!unit) {
            console.log('❌ [updateLearnmapProgress] Unit not found:', progressInput.unitId);
            console.log('📊 [updateLearnmapProgress] Available units:', doc.unitProgress.map(u => u.unitId.toString()));
            return { success: false, message: 'Unit not found', userLearnmapProgress: null };
          }
          
          const lesson = unit.lessonProgress.find(l => l.lessonId.toString() === progressInput.lessonId);
          if (!lesson) {
            console.log('❌ [updateLearnmapProgress] Lesson not found:', progressInput.lessonId);
            console.log('📊 [updateLearnmapProgress] Available lessons:', unit.lessonProgress.map(l => l.lessonId.toString()));
            return { success: false, message: 'Lesson not found', userLearnmapProgress: null };
          }
          
          console.log('✅ [updateLearnmapProgress] Found lesson, updating status:', progressInput.status);
          if (progressInput.status) lesson.status = progressInput.status;
          if (progressInput.completedAt) lesson.completedAt = new Date(progressInput.completedAt);
          updated = true;
          
          // Nếu lesson completed, unlock lesson tiếp theo
          if (progressInput.status === 'completed' || progressInput.status === 'COMPLETED') {
            const idx = unit.lessonProgress.findIndex(l => l.lessonId.toString() === progressInput.lessonId);
            if (idx !== -1 && idx + 1 < unit.lessonProgress.length) {
              const nextLesson = unit.lessonProgress[idx + 1];
              if (nextLesson.status === 'locked') {
                nextLesson.status = 'unlocked';
                console.log('🔓 [updateLearnmapProgress] Unlocked next lesson:', nextLesson.lessonId);
              }
            }
            
            // Kiểm tra xem tất cả lessons trong unit đã completed chưa
            const allLessonsCompleted = unit.lessonProgress.every(l => l.status === 'completed');
            if (allLessonsCompleted) {
              console.log('🎉 [updateLearnmapProgress] All lessons in unit completed, unlocking next unit');
              unit.status = 'completed';
              unit.completedAt = new Date();
              
              // Unlock unit tiếp theo
              const unitIdx = doc.unitProgress.findIndex(u => u.unitId.toString() === progressInput.unitId);
              if (unitIdx !== -1 && unitIdx + 1 < doc.unitProgress.length) {
                const nextUnit = doc.unitProgress[unitIdx + 1];
                if (nextUnit.status === 'locked') {
                  nextUnit.status = 'unlocked';
                  console.log('🔓 [updateLearnmapProgress] Unlocked next unit:', nextUnit.unitId);
                  
                  // Unlock lesson đầu tiên của unit tiếp theo
                  if (nextUnit.lessonProgress.length > 0 && nextUnit.lessonProgress[0].status === 'locked') {
                    nextUnit.lessonProgress[0].status = 'unlocked';
                    console.log('🔓 [updateLearnmapProgress] Unlocked first lesson of next unit:', nextUnit.lessonProgress[0].lessonId);
                  }
                }
              }
            }
          }
        }
        
        // Cập nhật exercise (giữ nguyên logic cũ)
        if (progressInput.unitId && progressInput.lessonId && progressInput.exerciseId) {
          const unit = doc.unitProgress.find(u => u.unitId.toString() === progressInput.unitId);
          if (!unit) return { success: false, message: 'Unit not found', userLearnmapProgress: null };
          const lesson = unit.lessonProgress.find(l => l.lessonId.toString() === progressInput.lessonId);
          if (!lesson) return { success: false, message: 'Lesson not found', userLearnmapProgress: null };
          let exercise = lesson.exerciseProgress.find(e => e.exerciseId.toString() === progressInput.exerciseId);
          if (!exercise) {
            exercise = {
              exerciseId: progressInput.exerciseId,
              status: progressInput.status || 'COMPLETED',
              score: progressInput.score || 0,
              attempts: progressInput.attempts || 1,
              lastAttemptedAt: progressInput.completedAt ? new Date(progressInput.completedAt) : new Date(),
              wrongAnswers: progressInput.wrongAnswers || [],
            };
            lesson.exerciseProgress.push(exercise);
          } else {
            if (progressInput.status) exercise.status = progressInput.status;
            if (typeof progressInput.score === 'number') exercise.score = progressInput.score;
            if (typeof progressInput.attempts === 'number') exercise.attempts = progressInput.attempts;
            if (progressInput.completedAt) exercise.lastAttemptedAt = new Date(progressInput.completedAt);
            if (progressInput.wrongAnswers) exercise.wrongAnswers = progressInput.wrongAnswers;
          }
          updated = true;
        }
        
        // Cập nhật unit (giữ nguyên logic cũ)
        if (progressInput.unitId && !progressInput.lessonId && !progressInput.exerciseId) {
          const unit = doc.unitProgress.find(u => u.unitId.toString() === progressInput.unitId);
          if (!unit) return { success: false, message: 'Unit not found', userLearnmapProgress: null };
          if (progressInput.status) unit.status = progressInput.status;
          if (progressInput.completedAt) unit.completedAt = new Date(progressInput.completedAt);
          updated = true;
          // Nếu unit completed, unlock unit tiếp theo
          if (progressInput.status === 'completed' || progressInput.status === 'COMPLETED') {
            const idx = doc.unitProgress.findIndex(u => u.unitId.toString() === progressInput.unitId);
            if (idx !== -1 && idx + 1 < doc.unitProgress.length) {
              const nextUnit = doc.unitProgress[idx + 1];
              if (nextUnit.status === 'locked') nextUnit.status = 'unlocked';
              // Unlock lesson đầu tiên của unit tiếp theo
              if (nextUnit.lessonProgress && nextUnit.lessonProgress.length > 0 && nextUnit.lessonProgress[0].status === 'locked') {
                nextUnit.lessonProgress[0].status = 'unlocked';
              }
            }
          }
        }
        
        if (updated) {
          console.log('💾 [updateLearnmapProgress] Saving document...');
          await doc.save();
          console.log('✅ [updateLearnmapProgress] Document saved successfully');
          return { success: true, message: 'Progress updated', userLearnmapProgress: doc.toObject() };
        } else {
          console.log('⚠️ [updateLearnmapProgress] No update performed');
          return { success: false, message: 'No update performed', userLearnmapProgress: doc.toObject() };
        }
      } catch (error) {
        console.error('[updateLearnmapProgress] Unexpected error:', error);
        console.error('[updateLearnmapProgress] Error stack:', error.stack);
        return { success: false, message: 'Internal server error', userLearnmapProgress: null };
      }
    },
    updateExerciseProgress: async (parent, { lessonId, exerciseProgressInput }, context) => {
      try {
        console.log('🔄 [updateExerciseProgress] Starting with:', { lessonId, exerciseProgressInput });
        
        if (!context.user) {
          return { success: false, message: 'Not authenticated', exerciseProgress: null };
        }

        // Tìm learnmap progress chứa lesson này
        const learnmapDoc = await UserLearnmapProgress.findOne({
          userId: context.user._id,
          'unitProgress.lessonProgress.lessonId': lessonId
        });

        if (!learnmapDoc) {
          return { success: false, message: 'No learnmap progress found for this lesson', exerciseProgress: null };
        }

        // Tìm lesson trong unit progress
        let targetLesson = null;
        let targetUnit = null;

        for (const unit of learnmapDoc.unitProgress) {
          const lesson = unit.lessonProgress.find(l => l.lessonId.toString() === lessonId);
          if (lesson) {
            targetLesson = lesson;
            targetUnit = unit;
            break;
          }
        }

        if (!targetLesson) {
          return { success: false, message: 'Lesson not found in progress', exerciseProgress: null };
        }

        // Cập nhật hoặc tạo exercise progress
        let exerciseProgress = targetLesson.exerciseProgress.find(
          e => e.exerciseId.toString() === exerciseProgressInput.exerciseId
        );

        if (!exerciseProgress) {
          exerciseProgress = {
            exerciseId: exerciseProgressInput.exerciseId,
            status: exerciseProgressInput.status,
            score: exerciseProgressInput.score || 0,
            attempts: exerciseProgressInput.attempts || 1,
            lastAttemptedAt: new Date(),
            wrongAnswers: exerciseProgressInput.wrongAnswers || [],
          };
          targetLesson.exerciseProgress.push(exerciseProgress);
        } else {
          exerciseProgress.status = exerciseProgressInput.status;
          if (typeof exerciseProgressInput.score === 'number') {
            exerciseProgress.score = exerciseProgressInput.score;
          }
          if (typeof exerciseProgressInput.attempts === 'number') {
            exerciseProgress.attempts = exerciseProgressInput.attempts;
          }
          exerciseProgress.lastAttemptedAt = new Date();
          if (exerciseProgressInput.wrongAnswers) {
            exerciseProgress.wrongAnswers = exerciseProgressInput.wrongAnswers;
          }
        }

        // Kiểm tra xem tất cả exercises trong lesson đã completed chưa
        const totalExercises = await Exercise.countDocuments({ lessonId });
        const completedExercises = targetLesson.exerciseProgress.filter(e => e.status === 'COMPLETED').length;

        console.log(`📊 [updateExerciseProgress] Progress: ${completedExercises}/${totalExercises} exercises completed`);
        console.log(`🔍 [updateExerciseProgress] Lesson ID: ${lessonId}`);
        console.log(`🔍 [updateExerciseProgress] Unit ID: ${targetUnit.unitId}`);
        console.log(`🔍 [updateExerciseProgress] Unit status: ${targetUnit.status}`);

        if (completedExercises === totalExercises && totalExercises > 0) {
          console.log('🎉 [updateExerciseProgress] All exercises completed, marking lesson as completed');
          targetLesson.status = 'completed';
          targetLesson.completedAt = new Date();

          // Gọi logic unlock lesson tiếp theo
          const lessonIdx = targetUnit.lessonProgress.findIndex(l => l.lessonId.toString() === lessonId);
          if (lessonIdx !== -1 && lessonIdx + 1 < targetUnit.lessonProgress.length) {
            const nextLesson = targetUnit.lessonProgress[lessonIdx + 1];
            if (nextLesson.status === 'locked') {
              nextLesson.status = 'unlocked';
              console.log('🔓 [updateExerciseProgress] Unlocked next lesson:', nextLesson.lessonId);
            }
          }

          // Kiểm tra xem tất cả lessons trong unit đã completed chưa
          const allLessonsCompleted = targetUnit.lessonProgress.every(l => l.status === 'completed');
          console.log(`🔍 [updateExerciseProgress] Checking unit completion: ${allLessonsCompleted ? 'YES' : 'NO'}`);
          console.log(`🔍 [updateExerciseProgress] Unit lessons status:`, targetUnit.lessonProgress.map(l => l.status));
          
          if (allLessonsCompleted) {
            console.log('🎉 [updateExerciseProgress] All lessons in unit completed, unlocking next unit');
            targetUnit.status = 'completed';
            targetUnit.completedAt = new Date();

            // Unlock unit tiếp theo
            const unitIdx = learnmapDoc.unitProgress.findIndex(u => u.unitId.toString() === targetUnit.unitId.toString());
            if (unitIdx !== -1 && unitIdx + 1 < learnmapDoc.unitProgress.length) {
              const nextUnit = learnmapDoc.unitProgress[unitIdx + 1];
              if (nextUnit.status === 'locked') {
                nextUnit.status = 'unlocked';
                console.log('🔓 [updateExerciseProgress] Unlocked next unit:', nextUnit.unitId);

                // Unlock lesson đầu tiên của unit tiếp theo
                if (nextUnit.lessonProgress.length > 0 && nextUnit.lessonProgress[0].status === 'locked') {
                  nextUnit.lessonProgress[0].status = 'unlocked';
                  console.log('🔓 [updateExerciseProgress] Unlocked first lesson of next unit:', nextUnit.lessonProgress[0].lessonId);
                }
              }
            }
          }
        }

        await learnmapDoc.save();
        console.log('✅ [updateExerciseProgress] Exercise progress updated successfully');
        
        // Debug: Log current state after save
        console.log('🔍 [updateExerciseProgress] Current state after save:');
        for (let i = 0; i < learnmapDoc.unitProgress.length; i++) {
          const unit = learnmapDoc.unitProgress[i];
          console.log(`  Unit ${i + 1}: ${unit.status}`);
          for (let j = 0; j < unit.lessonProgress.length; j++) {
            const lesson = unit.lessonProgress[j];
            console.log(`    Lesson ${j + 1}: ${lesson.status}`);
          }
        }

        return { 
          success: true, 
          message: 'Exercise progress updated', 
          exerciseProgress: exerciseProgress 
        };
      } catch (error) {
        console.error('[updateExerciseProgress] Error:', error);
        return { success: false, message: 'Internal server error', exerciseProgress: null };
      }
    },
    fastTrackLearnmap: async (parent, { courseId, fastTrackInput }, context) => {
      try {
        if (!context.user) return { success: false, message: 'Not authenticated', userLearnmapProgress: null };
        let doc = await UserLearnmapProgress.findOne({ userId: context.user._id, courseId });
        if (!doc) return { success: false, message: 'No progress found for this course', userLearnmapProgress: null };
        const { unitId, lessonIds, challengeAttemptId, completedAt } = fastTrackInput;
        let updated = false;
        // Học vượt unit: đánh dấu completed toàn bộ lesson trong unit
        if (unitId) {
          const unit = doc.unitProgress.find(u => u.unitId.toString() === unitId);
          if (!unit) return { success: false, message: 'Unit not found', userLearnmapProgress: null };
          unit.status = 'completed';
          unit.completedAt = completedAt ? new Date(completedAt) : new Date();
          unit.lessonProgress.forEach(lesson => {
            lesson.status = 'completed';
            lesson.completedAt = completedAt ? new Date(completedAt) : new Date();
          });
          updated = true;
          // Unlock unit tiếp theo
          const idx = doc.unitProgress.findIndex(u => u.unitId.toString() === unitId);
          if (idx !== -1 && idx + 1 < doc.unitProgress.length) {
            const nextUnit = doc.unitProgress[idx + 1];
            if (nextUnit.status === 'locked') nextUnit.status = 'unlocked';
            if (nextUnit.lessonProgress && nextUnit.lessonProgress.length > 0 && nextUnit.lessonProgress[0].status === 'locked') {
              nextUnit.lessonProgress[0].status = 'unlocked';
            }
          }
        }
        // Học vượt nhiều lesson
        if (lessonIds && lessonIds.length > 0) {
          doc.unitProgress.forEach(unit => {
            unit.lessonProgress.forEach(lesson => {
              if (lessonIds.includes(lesson.lessonId.toString())) {
                lesson.status = 'completed';
                lesson.completedAt = completedAt ? new Date(completedAt) : new Date();
                updated = true;
              }
            });
          });
        }
        // Lưu lịch sử học vượt
        doc.fastTrackHistory.push({
          unitId: unitId || null,
          lessonIds: lessonIds || [],
          challengeAttemptId,
          completedAt: completedAt ? new Date(completedAt) : new Date(),
        });
        if (updated) {
          await doc.save();
          return { success: true, message: 'Fast track completed', userLearnmapProgress: doc.toObject() };
        } else {
          return { success: false, message: 'No update performed', userLearnmapProgress: doc.toObject() };
        }
      } catch (error) {
        console.error('[fastTrackLearnmap] Unexpected error:', error);
        return { success: false, message: 'Internal server error', userLearnmapProgress: null };
      }
    },
    reviewCompletedLesson: async (parent, { courseId, reviewInput }, context) => {
      try {
        if (!context.user) return { success: false, message: 'Not authenticated', userLearnmapProgress: null };
        let doc = await UserLearnmapProgress.findOne({ userId: context.user._id, courseId });
        if (!doc) return { success: false, message: 'No progress found for this course', userLearnmapProgress: null };
        const { unitId, lessonId, score, xpEarned, coinEarned, reviewedAt } = reviewInput;
        const unit = doc.unitProgress.find(u => u.unitId.toString() === unitId);
        if (!unit) return { success: false, message: 'Unit not found', userLearnmapProgress: null };
        const lesson = unit.lessonProgress.find(l => l.lessonId.toString() === lessonId);
        if (!lesson) return { success: false, message: 'Lesson not found', userLearnmapProgress: null };
        if (lesson.status !== 'completed') return { success: false, message: 'Lesson is not completed, cannot review', userLearnmapProgress: null };
        // Lưu lịch sử review vào lesson (tạo trường reviewHistory nếu chưa có)
        if (!lesson.reviewHistory) lesson.reviewHistory = [];
        lesson.reviewHistory.push({
          score: typeof score === 'number' ? score : null,
          xpEarned: typeof xpEarned === 'number' ? xpEarned : null,
          coinEarned: typeof coinEarned === 'number' ? coinEarned : null,
          reviewedAt: reviewedAt ? new Date(reviewedAt) : new Date(),
        });
        await doc.save();
        return { success: true, message: 'Lesson reviewed', userLearnmapProgress: doc.toObject() };
      } catch (error) {
        console.error('[reviewCompletedLesson] Unexpected error:', error);
        return { success: false, message: 'Internal server error', userLearnmapProgress: null };
      }
    },
  },
}; 