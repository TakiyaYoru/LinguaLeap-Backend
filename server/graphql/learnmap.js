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

  type SetLessonOrderPayload {
    success: Boolean!
    message: String!
    lesson: Lesson
  }

  type SetUnitOrderPayload {
    success: Boolean!
    message: String!
    unit: Unit
  }

  # Learnmap with Content Data
  type LearnmapWithContent {
    course: Course!
    units: [UnitWithLessons!]!
    userProgress: UserLearnmapProgress
  }

  # Unit with Lessons for Learnmap
  type UnitWithLessons {
    id: ID!
    title: String!
    description: String!
    courseId: ID!
    theme: String!
    icon: String
    color: String!
    totalLessons: Int!
    totalExercises: Int!
    estimatedDuration: Int!
    prerequisites: UnitPrerequisites
    challenge_test: ChallengeTest
    isPremium: Boolean!
    isPublished: Boolean!
    xpReward: Int!
    sortOrder: Int!
    progressPercentage: Int!
    isUnlocked: Boolean!
    vocabulary: [UnitVocabulary!]!
    createdBy: User
    createdAt: String!
    updatedAt: String!
    lessons: [Lesson!]!
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
    learnmapWithContent(courseId: ID!): LearnmapWithContent
  }

  # Extend Mutation
  extend type Mutation {
    startCourseLearnmap(courseId: ID!): StartCourseLearnmapPayload!
    updateLearnmapProgress(courseId: ID!, progressInput: ProgressInput!): UpdateLearnmapProgressPayload!
    fastTrackLearnmap(courseId: ID!, fastTrackInput: FastTrackInput!): FastTrackLearnmapPayload!
    reviewCompletedLesson(courseId: ID!, reviewInput: ReviewInput!): ReviewCompletedLessonPayload!
    updateExerciseProgress(lessonId: ID!, exerciseProgressInput: ExerciseProgressInput!): UpdateExerciseProgressPayload!
    
    # Admin: Set lesson/unit order
    setLessonOrder(lessonId: ID!, newSortOrder: Int!): SetLessonOrderPayload!
    setUnitOrder(unitId: ID!, newSortOrder: Int!): SetUnitOrderPayload!
  }
`;

// Helper function to update unlock status
const updateUnlockStatus = async (userProgress, unitsWithLessons) => {
  console.log('🔓 [updateUnlockStatus] Updating unlock status...');
  console.log('📊 [updateUnlockStatus] User progress units:', userProgress.unitProgress.length);
  console.log('📊 [updateUnlockStatus] Units with lessons:', unitsWithLessons.length);
  
  let hasChanges = false;
  
  // Update unit and lesson unlock status
  for (let unitIndex = 0; unitIndex < unitsWithLessons.length; unitIndex++) {
    const unit = unitsWithLessons[unitIndex];
    console.log(`🔍 [updateUnlockStatus] Processing unit ${unitIndex}: ${unit.title} (${unit.id})`);
    
    const unitProgress = userProgress.unitProgress.find(up => up.unitId === unit.id);
    
    if (!unitProgress) {
      console.log(`⚠️ [updateUnlockStatus] No progress found for unit ${unit.id}`);
      continue;
    }
    
    console.log(`🔍 [updateUnlockStatus] Unit progress status: ${unitProgress.status}`);
    
    // Check if unit should be unlocked
    let shouldUnlockUnit = false;
    if (unitIndex === 0) {
      shouldUnlockUnit = true; // First unit is always unlocked
      console.log(`🔓 [updateUnlockStatus] First unit should be unlocked`);
    } else {
      // Check if previous unit is completed
      const previousUnit = userProgress.unitProgress.find(up => up.unitId === unitsWithLessons[unitIndex - 1].id);
      shouldUnlockUnit = previousUnit && previousUnit.status === 'completed';
      console.log(`🔍 [updateUnlockStatus] Previous unit completed: ${shouldUnlockUnit}`);
    }
    
    // Update unit status
    if (shouldUnlockUnit && unitProgress.status === 'locked') {
      unitProgress.status = 'unlocked';
      hasChanges = true;
      console.log(`🔓 [updateUnlockStatus] Unlocked unit: ${unit.title}`);
    }
    
    // Update lesson unlock status within unit
    for (let lessonIndex = 0; lessonIndex < unit.lessons.length; lessonIndex++) {
      const lesson = unit.lessons[lessonIndex];
      console.log(`🔍 [updateUnlockStatus] Processing lesson ${lessonIndex}: ${lesson.title} (${lesson.id})`);
      
      const lessonProgress = unitProgress.lessonProgress.find(lp => lp.lessonId === lesson.id);
      
      if (!lessonProgress) {
        console.log(`⚠️ [updateUnlockStatus] No progress found for lesson ${lesson.id}`);
        continue;
      }
      
      console.log(`🔍 [updateUnlockStatus] Lesson progress status: ${lessonProgress.status}`);
      
      // Check if lesson should be unlocked
      let shouldUnlockLesson = false;
      if (lessonIndex === 0 && unitProgress.status === 'unlocked') {
        shouldUnlockLesson = true; // First lesson of unlocked unit
        console.log(`🔓 [updateUnlockStatus] First lesson of unlocked unit should be unlocked`);
      } else if (lessonIndex > 0) {
        // Check if previous lesson is completed
        const previousLesson = unitProgress.lessonProgress.find(lp => lp.lessonId === unit.lessons[lessonIndex - 1].id);
        shouldUnlockLesson = previousLesson && previousLesson.status === 'completed';
        console.log(`🔍 [updateUnlockStatus] Previous lesson completed: ${shouldUnlockLesson}`);
      }
      
      // Update lesson status
      if (shouldUnlockLesson && lessonProgress.status === 'locked') {
        lessonProgress.status = 'unlocked';
        hasChanges = true;
        console.log(`🔓 [updateUnlockStatus] Unlocked lesson: ${lesson.title}`);
      }
    }
  }
  
  // Save changes if any
  if (hasChanges) {
    await userProgress.save();
    console.log('✅ [updateUnlockStatus] Unlock status updated and saved');
  } else {
    console.log('ℹ️ [updateUnlockStatus] No unlock changes needed');
  }
  
  return userProgress;
};

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
        
        // Fix: Get userId from context.user (could be userId or _id)
        const userId = context.user.userId || context.user._id || context.user.id;
        console.log('🔍 [userLearnmapProgress] Using userId:', userId);
        console.log('🔍 [userLearnmapProgress] Full context.user:', JSON.stringify(context.user, null, 2));
        
        if (!userId) {
          console.log('❌ [userLearnmapProgress] No userId found in context.user');
          return null;
        }
        
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
    learnmapWithContent: async (parent, { courseId }, context) => {
      try {
        console.log('🔄 [learnmapWithContent] Getting learnmap with content for course:', courseId);
        
        if (!context.user) {
          throw new GraphQLError('Not authenticated', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const userId = context.user.userId || context.user._id || context.user.id;
        if (!userId) {
          throw new GraphQLError('User ID not found', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Get course with published check
        const course = await Course.findOne({ _id: courseId, isPublished: true });
        if (!course) {
          throw new GraphQLError('Course not found or not published', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        // Get published units for this course
        const units = await Unit.find({ 
          courseId: courseId, 
          isPublished: true 
        }).sort({ sortOrder: 1 });

        // Get published lessons for each unit
        const unitsWithLessons = await Promise.all(units.map(async (unit) => {
          const lessons = await Lesson.find({ 
            unitId: unit._id, 
            isPublished: true 
          }).sort({ sortOrder: 1 });

          console.log(`📊 [learnmapWithContent] Unit ${unit.title} has ${lessons.length} lessons`);
          lessons.forEach((lesson, idx) => {
            console.log(`📊 [learnmapWithContent] Lesson ${idx}: ${lesson.title} (sortOrder: ${lesson.sortOrder})`);
          });

          const unitObj = unit.toObject();
          const safeDate = (date) => {
            if (!date) return null;
            try {
              return new Date(date).toISOString();
            } catch (err) {
              console.warn('⚠️ Invalid date value:', date);
              return null;
            }
          };

          return {
            ...unitObj,
            id: unitObj._id.toString(),
            courseId: unitObj.courseId.toString(),
            createdAt: safeDate(unitObj.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(unitObj.updatedAt) || new Date().toISOString(),
            lessons: lessons.map(lesson => {
              const lessonObj = lesson.toObject();
              return {
                ...lessonObj,
                id: lessonObj._id.toString(),
                courseId: lessonObj.courseId.toString(),
                unitId: lessonObj.unitId.toString(),
                createdAt: safeDate(lessonObj.createdAt) || new Date().toISOString(),
                updatedAt: safeDate(lessonObj.updatedAt) || new Date().toISOString(),
              };
            })
          };
        }));

        // Get user progress
        let userProgress = await UserLearnmapProgress.findOne({ userId, courseId });
        if (!userProgress) {
          // Initialize progress if not exists
          console.log('🔄 [learnmapWithContent] Initializing user progress...');
          console.log('📊 [learnmapWithContent] Units count:', unitsWithLessons.length);
          
          const unitProgress = unitsWithLessons.map((unit, unitIndex) => {
            console.log(`📊 [learnmapWithContent] Unit ${unitIndex}: ${unit.title} (${unit.id})`);
            console.log(`📊 [learnmapWithContent] Unit ${unitIndex} lessons count:`, unit.lessons.length);
            
            return {
              unitId: unit.id,
              status: unitIndex === 0 ? 'unlocked' : 'locked',
              completedAt: null,
              lessonProgress: unit.lessons.map((lesson, lessonIndex) => {
                const isUnlocked = (unitIndex === 0 && lessonIndex === 0);
                console.log(`📊 [learnmapWithContent] Lesson ${lessonIndex}: ${lesson.title} (${lesson.id}) - Status: ${isUnlocked ? 'unlocked' : 'locked'}`);
                console.log(`🔍 [learnmapWithContent] Lesson ID type: ${typeof lesson.id}, value: ${lesson.id}`);
                
                return {
                  lessonId: lesson.id,
                  status: isUnlocked ? 'unlocked' : 'locked',
                  completedAt: null,
                  exerciseProgress: [],
                };
              }),
            };
          });

          console.log('📊 [learnmapWithContent] Created unitProgress structure:');
          unitProgress.forEach((unit, unitIdx) => {
            console.log(`📊 [learnmapWithContent] Unit ${unitIdx}: ${unit.unitId}`);
            unit.lessonProgress.forEach((lesson, lessonIdx) => {
              console.log(`📊 [learnmapWithContent] Lesson ${lessonIdx}: ${lesson.lessonId} - ${lesson.status}`);
            });
          });

          userProgress = await UserLearnmapProgress.create({
            userId,
            courseId,
            unitProgress,
            hearts: 5,
            lastHeartUpdate: new Date(),
            fastTrackHistory: [],
          });
          
          console.log('✅ [learnmapWithContent] User progress created successfully');
        } else {
          // Update unlock status based on completed lessons
          console.log('🔄 [learnmapWithContent] Updating unlock status...');
          userProgress = await updateUnlockStatus(userProgress, unitsWithLessons);
        }

        const courseObj = course.toObject();
        const safeDate = (date) => {
          if (!date) return null;
          try {
            return new Date(date).toISOString();
          } catch (err) {
            console.warn('⚠️ Invalid date value:', date);
            return null;
          }
        };

        return {
          course: {
            ...courseObj,
            id: courseObj._id.toString(),
            createdAt: safeDate(courseObj.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(courseObj.updatedAt) || new Date().toISOString(),
            publishedAt: safeDate(courseObj.publishedAt),
            createdBy: courseObj.createdBy && courseObj.createdBy.username ? courseObj.createdBy : null,
          },
          units: unitsWithLessons,
          userProgress: userProgress.toObject(),
        };
      } catch (error) {
        console.error('❌ [learnmapWithContent] Error:', error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to get learnmap with content');
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

        // Fix: Get userId from context.user (could be userId or _id)
        const userId = context.user.userId || context.user._id || context.user.id;
        
        if (!userId) {
          return { success: false, message: 'User ID not found', userLearnmapProgress: null };
        }
        
        // Kiểm tra xem đã có progress chưa
        let doc = await UserLearnmapProgress.findOne({ userId, courseId });
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
          userId,
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
        
        // Fix: Get userId from context.user
        const userId = context.user.userId || context.user._id || context.user.id;
        if (!userId) return { success: false, message: 'User ID not found', userLearnmapProgress: null };
        
        let doc = await UserLearnmapProgress.findOne({ userId, courseId });
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

        // Fix: Get userId from context.user
        const userId = context.user.userId || context.user._id || context.user.id;
        if (!userId) {
          return { success: false, message: 'User ID not found', exerciseProgress: null };
        }
        
        // Tìm learnmap progress chứa lesson này
        const learnmapDoc = await UserLearnmapProgress.findOne({
          userId,
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

    // Admin: Set lesson order
    setLessonOrder: async (parent, { lessonId, newSortOrder }, context) => {
      try {
        if (!context.user || context.user.role !== 'admin') {
          return { success: false, message: 'Admin access required', lesson: null };
        }

        console.log(`📝 [setLessonOrder] Setting lesson ${lessonId} to sort order ${newSortOrder}`);

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
          return { success: false, message: 'Lesson not found', lesson: null };
        }

        lesson.sortOrder = newSortOrder;
        await lesson.save();

        console.log(`✅ [setLessonOrder] Lesson order updated successfully`);

        return { 
          success: true, 
          message: 'Lesson order updated successfully', 
          lesson: lesson 
        };
      } catch (error) {
        console.error('[setLessonOrder] Error:', error);
        return { success: false, message: 'Internal server error', lesson: null };
      }
    },

    // Admin: Set unit order
    setUnitOrder: async (parent, { unitId, newSortOrder }, context) => {
      try {
        if (!context.user || context.user.role !== 'admin') {
          return { success: false, message: 'Admin access required', unit: null };
        }

        console.log(`📝 [setUnitOrder] Setting unit ${unitId} to sort order ${newSortOrder}`);

        const unit = await Unit.findById(unitId);
        if (!unit) {
          return { success: false, message: 'Unit not found', unit: null };
        }

        unit.sortOrder = newSortOrder;
        await unit.save();

        console.log(`✅ [setUnitOrder] Unit order updated successfully`);

        return { 
          success: true, 
          message: 'Unit order updated successfully', 
          unit: unit 
        };
      } catch (error) {
        console.error('[setUnitOrder] Error:', error);
        return { success: false, message: 'Internal server error', unit: null };
      }
    },
    fastTrackLearnmap: async (parent, { courseId, fastTrackInput }, context) => {
      try {
        if (!context.user) return { success: false, message: 'Not authenticated', userLearnmapProgress: null };
        
        // Fix: Get userId from context.user
        const userId = context.user.userId || context.user._id || context.user.id;
        if (!userId) return { success: false, message: 'User ID not found', userLearnmapProgress: null };
        
        let doc = await UserLearnmapProgress.findOne({ userId, courseId });
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
        
        // Fix: Get userId from context.user
        const userId = context.user.userId || context.user._id || context.user.id;
        if (!userId) return { success: false, message: 'User ID not found', userLearnmapProgress: null };
        
        let doc = await UserLearnmapProgress.findOne({ userId, courseId });
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