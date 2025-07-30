// ===============================================
// COURSE GRAPHQL RESOLVERS - LINGUALEAP
// ===============================================

import { GraphQLError } from 'graphql';
import { Course, Unit, Lesson, Exercise } from '../data/models/index.js';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const courseTypeDefs = `
  type Course {
    id: ID!
    title: String!
    description: String!
    level: String!
    category: String!
    skill_focus: [String!]!
    thumbnail: String
    color: String!
    estimatedDuration: Int!
    totalUnits: Int!
    totalLessons: Int!
    totalExercises: Int!
    prerequisites: [Course!]!
    challenge_test: ChallengeTest
    isPremium: Boolean!
    isPublished: Boolean!
    publishedAt: String
    learningObjectives: [String!]!
    difficulty: String!
    totalXP: Int!
    enrollmentCount: Int!
    completionCount: Int!
    averageRating: Float!
    completionRate: Int!
    slug: String!
    createdBy: User
    createdAt: String!
    updatedAt: String!
  }

  type ChallengeTest {
    total_questions: Int!
    pass_percentage: Int!
    must_correct_questions: [Int!]!
    time_limit: Int!
  }

  type Unit {
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
    publishedAt: String
    xpReward: Int!
    sortOrder: Int!
    progressPercentage: Int!
    isUnlocked: Boolean!
    vocabulary: [UnitVocabulary!]!
    createdBy: User
    createdAt: String!
    updatedAt: String!
  }

  type UnitPrerequisites {
    previous_unit_id: String
    minimum_score: Int!
    required_hearts: Int!
  }

  type UnitVocabulary {
    word: String!
    meaning: String!
    pronunciation: String
    audioUrl: String
    example: VocabularyExample
  }

  type VocabularyExample {
    sentence: String!
    translation: String!
  }

  type UserProgress {
    currentUnitId: String
    currentLessonId: String
    completedLessons: [String!]!
    streak: Int!
    dailyXPGoal: Int!
    currentDayXP: Int!
    hearts: Int!
    totalXP: Int!
  }

  type Lesson {
    id: ID!
    title: String!
    description: String
    courseId: String!
    unitId: String!
    type: String!
    lesson_type: String!
    objective: String
    vocabulary_pool: [VocabularyPoolItem!]!
    lesson_context: LessonContext
    grammar_point: GrammarPoint
    exercise_generation: ExerciseGeneration
    icon: String
    thumbnail: String
    totalExercises: Int!
    estimatedDuration: Int!
    difficulty: String!
    isPremium: Boolean!
    isPublished: Boolean!
    publishedAt: String
    xpReward: Int!
    perfectScoreBonus: Int!
    targetAccuracy: Int!
    passThreshold: Int!
    sortOrder: Int!
    status: String!
    isCompleted: Boolean!
    isUnlocked: Boolean!
    userScore: Int
    createdBy: User
    createdAt: String!
    updatedAt: String!
  }

  type VocabularyPoolItem {
    vocabulary_id: String
    context_in_lesson: String!
    is_main_focus: Boolean!
    introduction_order: Int!
    difficulty_weight: Int!
  }

  type LessonContext {
    situation: String
    cultural_context: String
    use_cases: [String!]!
    avoid_topics: [String!]!
  }

  type GrammarPoint {
    title: String
    explanation: String
    pattern: String
    examples: [String!]!
  }

  type ExerciseGeneration {
    total_exercises: Int!
    exercise_distribution: ExerciseDistribution!
    difficulty_progression: Boolean!
    vocabulary_coverage: String!
  }

  type ExerciseDistribution {
    multiple_choice: Int!
    fill_blank: Int!
    listening: Int!
    translation: Int!
    word_matching: Int!
    listen_choose: Int!
    speak_repeat: Int!
  }

  type Exercise {
    id: ID!
    title: String
    instruction: String!
    type_display_name: String!
    courseId: String!
    unitId: String!
    lessonId: String!
    type: String!
    prompt_template: PromptTemplate
    generation_rules: GenerationRules
    skill_focus: [String!]!
    question: ExerciseQuestion!
    content: String! # JSON string containing exercise-specific content
    maxScore: Int!
    difficulty: String!
    xpReward: Int!
    timeLimit: Int
    estimatedTime: Int!
    requires_audio: Boolean!
    requires_microphone: Boolean!
    isPremium: Boolean!
    isActive: Boolean!
    sortOrder: Int!
    successRate: Int!
    createdAt: String!
    updatedAt: String!
    tags: [String!]!
    createdBy: User
  }

  type PromptTemplate {
    system_context: String
    main_prompt: String
    variables: [String!]!
    expected_output_format: String # JSON string (nullable)
    fallback_template: String # JSON string (nullable)
  }

  type GenerationRules {
    max_attempts: Int!
    validation_rules: [String!]!
    difficulty_adaptation: Boolean!
    content_filters: [String!]!
  }

  type ExerciseQuestion {
    text: String!
    audioUrl: String
    imageUrl: String
    videoUrl: String
  }

  input CourseFilters {
    level: String
    category: String
    difficulty: String
    isPremium: Boolean
    isPublished: Boolean
    skill_focus: [String!]
  }

  extend type Query {
    # Get all courses
    courses(filters: CourseFilters): [Course!]!
    
    # Get all courses for admin (including unpublished)
    adminCourses: [Course!]!
    
    # Get single course by ID
    course(id: ID!): Course
    
    # Get all units for admin (including unpublished)
    adminUnits: [Unit!]!
    
    # Get all lessons for admin (including unpublished)
    adminLessons: [Lesson!]!
    
    # Get all exercises for admin (including unpublished)
    adminExercises: [Exercise!]!
    
    # Get units by course ID
    courseUnits(courseId: ID!): [Unit!]!
    
    # Get lessons by unit ID
    unitLessons(unitId: ID!): [Lesson!]!
    
    # Get lessons by unit ID
    unitLessons(unitId: ID!): [Lesson!]!
    
    # Get exercises by lesson ID
    lessonExercises(lessonId: ID!): [Exercise!]!
    
    # Get single exercise by ID
    exercise(id: ID!): Exercise
    
    # Get single lesson with exercises
    lesson(id: ID!): Lesson

    # Get user progress
    userProgress: UserProgress!
  }

  extend type Mutation {
    generateSampleLessons(unitId: ID!, count: Int): GenerateLessonsResponse!
  }

  type GenerateLessonsResponse {
    success: Boolean!
    message: String!
    lessons: [Lesson!]!
  }
`;

// ===============================================
// RESOLVERS
// ===============================================

export const courseResolvers = {
  Query: {
    // Get all courses for admin (including unpublished)
    adminCourses: async (parent, args, { db, user }) => {
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can access admin courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📚 Getting admin courses...');
        
        // Get all courses without any filters (including unpublished)
        const courses = await Course.find({})
          .populate('createdBy', 'username displayName')
          .populate('prerequisites', 'title level category')
          .sort({ sortOrder: 1, createdAt: -1 });
        
        // Transform courses to match GraphQL schema
        return courses.map(course => {
          // First convert to plain object if it's a Mongoose document
          const courseObj = course.toObject ? course.toObject() : { ...course };
          
          // Safely convert dates to ISO strings
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
            ...courseObj,
            id: courseObj._id.toString(),
            createdBy: courseObj.createdBy && courseObj.createdBy.username ? courseObj.createdBy : null,
            createdAt: safeDate(courseObj.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(courseObj.updatedAt) || new Date().toISOString(),
            publishedAt: safeDate(courseObj.publishedAt),
            // Ensure other required fields have default values
            totalUnits: courseObj.totalUnits || 0,
            totalLessons: courseObj.totalLessons || 0,
            totalExercises: courseObj.totalExercises || 0,
            estimatedDuration: courseObj.estimatedDuration || 0,
            enrollmentCount: courseObj.enrollmentCount || 0,
            completionCount: courseObj.completionCount || 0,
            averageRating: courseObj.averageRating || 0,
            skill_focus: courseObj.skill_focus || [],
            learningObjectives: courseObj.learningObjectives || []
          };
        });
      } catch (error) {
        console.error('❌ Error in adminCourses query:', error);
        console.error('Stack trace:', error.stack);
        throw new GraphQLError('Failed to fetch admin courses');
      }
    },

    // Get all courses
    courses: async (parent, { filters = {} }, { db }) => {
      try {
        console.log('📚 Getting courses with filters:', filters);
        
        const courses = await db.courses.getAll(filters);
        
        // Transform courses to match GraphQL schema
        return courses.map(course => {
          // First convert to plain object if it's a Mongoose document
          const courseObj = course.toObject ? course.toObject() : { ...course };
          
          // Safely convert dates to ISO strings
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
            ...courseObj,
            id: courseObj._id.toString(),
            createdBy: courseObj.createdBy && courseObj.createdBy.username ? courseObj.createdBy : null,
            createdAt: safeDate(courseObj.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(courseObj.updatedAt) || new Date().toISOString(),
            publishedAt: safeDate(courseObj.publishedAt),
            // Ensure other required fields have default values
            totalUnits: courseObj.totalUnits || 0,
            totalLessons: courseObj.totalLessons || 0,
            totalExercises: courseObj.totalExercises || 0,
            estimatedDuration: courseObj.estimatedDuration || 0,
            enrollmentCount: courseObj.enrollmentCount || 0,
            completionCount: courseObj.completionCount || 0,
            averageRating: courseObj.averageRating || 0,
            skill_focus: courseObj.skill_focus || [],
            learningObjectives: courseObj.learningObjectives || []
          };
        });
      } catch (error) {
        console.error('❌ Error in courses query:', error);
        console.error('Stack trace:', error.stack);
        throw new GraphQLError('Failed to fetch courses');
      }
    },

    // Get single course
    course: async (parent, { id }, { db }) => {
      try {
        console.log('📚 Getting course:', id);
        
        const course = await db.courses.findById(id);
        
        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }
        
        return {
          ...course.toObject(),
          id: course._id.toString(),
          createdBy: course.createdBy && course.createdBy.username ? course.createdBy : null
        };
      } catch (error) {
        console.error('❌ Error in course query:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch course');
      }
    },

    // Get all units for admin (including unpublished)
    adminUnits: async (parent, args, { db, user }) => {
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can access admin units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📖 Getting admin units...');
        
        // Get all units without any filters (including unpublished)
        const units = await Unit.find({})
          .populate('courseId', 'title level category')
          .populate('createdBy', 'username displayName')
          .sort({ sortOrder: 1, createdAt: -1 });
        
        // Transform units to match GraphQL schema
        return units.map(unit => {
          const unitObj = unit.toObject ? unit.toObject() : { ...unit };
          
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
            courseId: unitObj.courseId ? unitObj.courseId._id.toString() : null,
            createdAt: safeDate(unitObj.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(unitObj.updatedAt) || new Date().toISOString(),
            publishedAt: safeDate(unitObj.publishedAt),
            createdBy: unitObj.createdBy && unitObj.createdBy.username ? unitObj.createdBy : null,
            // Ensure other required fields have default values
            totalLessons: unitObj.totalLessons || 0,
            totalExercises: unitObj.totalExercises || 0,
            estimatedDuration: unitObj.estimatedDuration || 0,
            xpReward: unitObj.xpReward || 0,
            sortOrder: unitObj.sortOrder || 0,
            progressPercentage: unitObj.progressPercentage || 0,
            isUnlocked: unitObj.isUnlocked ?? true,
          };
        });
      } catch (error) {
        console.error('❌ Error in adminUnits query:', error);
        console.error('Stack trace:', error.stack);
        throw new GraphQLError('Failed to fetch admin units');
      }
    },

    // Get all lessons for admin (including unpublished)
    adminLessons: async (parent, args, { db, user }) => {
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can access admin lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📝 Getting admin lessons...');
        
        // Get all lessons without any filters (including unpublished)
        const lessons = await Lesson.find({})
          .populate('courseId', 'title level category')
          .populate('unitId', 'title theme')
          .populate('createdBy', 'username displayName')
          .sort({ sortOrder: 1, createdAt: -1 });
        
        // Transform lessons to match GraphQL schema
        return lessons.map(lesson => {
          const lessonObj = lesson.toObject ? lesson.toObject() : { ...lesson };
          
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
            ...lessonObj,
            id: lessonObj._id.toString(),
            courseId: lessonObj.courseId ? lessonObj.courseId._id.toString() : null,
            unitId: lessonObj.unitId ? lessonObj.unitId._id.toString() : null,
            createdAt: safeDate(lessonObj.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(lessonObj.updatedAt) || new Date().toISOString(),
            publishedAt: safeDate(lessonObj.publishedAt),
            createdBy: lessonObj.createdBy && lessonObj.createdBy.username ? lessonObj.createdBy : null,
            // Ensure other required fields have default values
            totalExercises: lessonObj.totalExercises || 0,
            estimatedDuration: lessonObj.estimatedDuration || 0,
            xpReward: lessonObj.xpReward || 0,
            perfectScoreBonus: lessonObj.perfectScoreBonus || 0,
            targetAccuracy: lessonObj.targetAccuracy || 80,
            passThreshold: lessonObj.passThreshold || 70,
            sortOrder: lessonObj.sortOrder || 0,
            status: lessonObj.status || 'locked',
            isCompleted: lessonObj.isCompleted || false,
            isUnlocked: lessonObj.isUnlocked ?? true,
            userScore: lessonObj.userScore || null,
            vocabulary_pool: lessonObj.vocabulary_pool || [],
            lesson_context: lessonObj.lesson_context || null,
            grammar_point: lessonObj.grammar_point || null,
            exercise_generation: lessonObj.exercise_generation || null,
          };
        });
      } catch (error) {
        console.error('❌ Error in adminLessons query:', error);
        console.error('Stack trace:', error.stack);
        throw new GraphQLError('Failed to fetch admin lessons');
      }
    },

    // Get course units
    courseUnits: async (parent, { courseId }, { db, user }) => {
      try {
        console.log('📖 Getting units for course:', courseId);
        
        // Check if course exists
        const course = await db.courses.findById(courseId);
        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        // Get units with filters
        const filters = {};
        if (!user || user.subscriptionType !== 'premium') {
          filters.isPremium = false;
        }

        // Get all units for this course
        const units = await db.units.getByCourseId(courseId, filters);
        
        // Get user progress if logged in
        let userProgress = null;
        if (user) {
          userProgress = await db.userExerciseProgress.getByUser(user.userId);
        }

        // Transform and calculate unit status
        return units.map((unit, index) => {
          const unitObj = unit.toObject();
          
          // Calculate unlock status
          let isUnlocked = index === 0; // First unit always unlocked
          
          if (!isUnlocked && user && unitObj.prerequisites) {
            const { previous_unit_id, minimum_score, required_hearts } = unitObj.prerequisites;
            
            // Check previous unit completion
            if (previous_unit_id) {
              const previousUnitProgress = userProgress?.find(p => 
                p.unitId === previous_unit_id.toString()
              );
              
              isUnlocked = previousUnitProgress?.score >= minimum_score;
            }
            
            // Check hearts requirement
            if (isUnlocked && user.hearts < required_hearts) {
              isUnlocked = false;
            }
          }

          // Calculate progress percentage
          let progressPercentage = 0;
          if (user && userProgress) {
            const unitExercises = userProgress.filter(p => 
              p.unitId === unit._id.toString()
            );
            
            if (unitExercises.length > 0) {
              const completedExercises = unitExercises.filter(e => 
                e.status === 'completed'
              ).length;
              
              progressPercentage = (completedExercises / unitObj.totalExercises) * 100;
            }
          }

          // Transform dates to ISO strings
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
            id: unit._id.toString(),
            createdAt: safeDate(unit.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(unit.updatedAt) || new Date().toISOString(),
            isUnlocked,
            progressPercentage,
            // Ensure required fields have default values
            totalLessons: unitObj.totalLessons || 0,
            totalExercises: unitObj.totalExercises || 0,
            estimatedDuration: unitObj.estimatedDuration || 0,
            xpReward: unitObj.xpReward || 0,
            sortOrder: unitObj.sortOrder || 0,
            vocabulary: unitObj.vocabulary || []
          };
        });
      } catch (error) {
        console.error('❌ Error in courseUnits query:', error.message);
        console.error('Stack trace:', error.stack);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch course units');
      }
    },

    // Get user progress
    userProgress: async (parent, args, { db, user }) => {
      if (!user) {
        throw new GraphQLError('You must be logged in to access progress', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        console.log('📊 Getting progress for user:', user.userId);
        
        // Get user data
        const userData = await db.users.findById(user.userId);
        if (!userData) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND' }
          });
        }

        // Get user's current progress
        const progress = {
          currentUnitId: '', // TODO: Implement unit tracking
          currentLessonId: '', // TODO: Implement lesson tracking
          completedLessons: [], // TODO: Implement lesson completion tracking
          streak: userData.currentStreak || 0,
          dailyXPGoal: userData.dailyGoal || 50,
          currentDayXP: 0, // TODO: Calculate daily XP
          hearts: userData.hearts || 5,
          totalXP: userData.totalXP || 0
        };

        return progress;
      } catch (error) {
        console.error('❌ Error in userProgress query:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch user progress');
      }
    },

    // Get unit lessons
    unitLessons: async (parent, { unitId }, { db, user }) => {
      try {
        console.log('📚 Getting lessons for unit:', unitId);
        
        // Check if unit exists
        const unit = await db.units.findById(unitId);
        if (!unit) {
          console.log('⚠️ Unit not found, returning empty array');
          return [];
        }

        // Get lessons with filters
        const filters = {};
        if (!user || user.subscriptionType !== 'premium') {
          filters.isPremium = false;
        }

        // Get all lessons for this unit
        const lessons = await db.lessons.getByUnitId(unitId, filters) || [];
        
        // Transform lessons
        return lessons.map(lesson => {
          const lessonObj = lesson.toObject();
          
          // Calculate completion status
          let isCompleted = false;
          let userScore = 0;
          
          if (user) {
            // TODO: Get actual completion status and score from progress
            isCompleted = false;
            userScore = 0;
          }

          return {
            ...lessonObj,
            id: lesson._id.toString(),
            isCompleted,
            userScore,
            // Ensure required fields have default values
            totalExercises: lessonObj.totalExercises || 0,
            estimatedDuration: lessonObj.estimatedDuration || 0,
            xpReward: lessonObj.xpReward || 0,
            perfectScoreBonus: lessonObj.perfectScoreBonus || 0,
            targetAccuracy: lessonObj.targetAccuracy || 80,
            passThreshold: lessonObj.passThreshold || 60,
            sortOrder: lessonObj.sortOrder || 0,
            isUnlocked: true // TODO: Implement proper unlock logic
          };
        });
      } catch (error) {
        console.error('❌ Error in unitLessons query:', error.message);
        console.error('Stack trace:', error.stack);
        // Return empty array instead of throwing error
        return [];
      }
    },

    // Get all exercises for admin (including unpublished)
    adminExercises: async (parent, args, { db, user }) => {
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can access admin exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🎮 Getting admin exercises...');
        
        // Get all exercises without any filters (including unpublished)
        const exercises = await Exercise.find({})
          .populate('createdBy', 'username displayName')
          .populate('lessonId', 'title type')
          .populate('unitId', 'title')
          .populate('courseId', 'title')
          .sort({ sortOrder: 1, createdAt: -1 });
        
        // Transform exercises to match GraphQL schema
        return exercises.map(exercise => {
          // First convert to plain object if it's a Mongoose document
          const exerciseObj = exercise.toObject ? exercise.toObject() : { ...exercise };
          
          // Safely convert dates to ISO strings
          const safeDate = (date) => {
            if (!date) return null;
            try {
              return new Date(date).toISOString();
            } catch (err) {
              console.warn('⚠️ Invalid date value:', date);
              return null;
            }
          };

          // Ensure content is a JSON string for adminExercises
          let contentString = exerciseObj.content;
          if (typeof exerciseObj.content === 'object') {
            try {
              contentString = JSON.stringify(exerciseObj.content);
            } catch (error) {
              console.warn('⚠️ Error stringifying content for exercise:', exerciseObj._id, error.message);
              contentString = '{}';
            }
          } else if (typeof exerciseObj.content !== 'string') {
            contentString = '{}';
          }

          // Handle prompt_template fields
          let promptTemplate = null;
          if (exerciseObj.prompt_template) {
            promptTemplate = {
              ...exerciseObj.prompt_template,
              expected_output_format: exerciseObj.prompt_template.expected_output_format 
                ? JSON.stringify(exerciseObj.prompt_template.expected_output_format)
                : null,
              fallback_template: exerciseObj.prompt_template.fallback_template
                ? JSON.stringify(exerciseObj.prompt_template.fallback_template)
                : null
            };
          }

          return {
            ...exerciseObj,
            content: contentString,
            prompt_template: promptTemplate,
            id: exerciseObj._id.toString(),
            courseId: exerciseObj.courseId.toString() ,
            unitId: exerciseObj.unitId.toString(),
            lessonId: exerciseObj.lessonId.toString(),
            createdBy: exerciseObj.createdBy && exerciseObj.createdBy.username ? exerciseObj.createdBy : null,
            createdAt: safeDate(exerciseObj.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(exerciseObj.updatedAt) || new Date().toISOString(),
            // Ensure other required fields have default values
            maxScore: exerciseObj.maxScore || 100,
            xpReward: exerciseObj.xpReward || 5,
            estimatedTime: exerciseObj.estimatedTime || 30,
            sortOrder: exerciseObj.sortOrder || 0,
            successRate: exerciseObj.successRate || 0,
            skill_focus: exerciseObj.skill_focus || [],
            tags: exerciseObj.tags || []
          };
        });
      } catch (error) {
        console.error('❌ Error in adminExercises query:', error);
        console.error('Stack trace:', error.stack);
        throw new GraphQLError('Failed to fetch admin exercises');
      }
    },

    // Get single exercise by ID
    exercise: async (parent, { id }, { db, user }) => {
      try {
        console.log('🎮 Getting exercise:', id);
        
        const exercise = await Exercise.findById(id)
          .populate('createdBy', 'username displayName')
          .populate('lessonId', 'title type')
          .populate('unitId', 'title')
          .populate('courseId', 'title');
        
        if (!exercise) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'EXERCISE_NOT_FOUND' }
          });
        }

        // Transform exercise to match GraphQL schema
        const exerciseObj = exercise.toObject();
        
        // Safely convert dates to ISO strings
        const safeDate = (date) => {
          if (!date) return null;
          try {
            return new Date(date).toISOString();
          } catch (err) {
            console.warn('⚠️ Invalid date value:', date);
            return null;
          }
        };

        // Ensure content is a JSON string for single exercise
        let contentString = exerciseObj.content;
        if (typeof exerciseObj.content === 'object') {
          try {
            contentString = JSON.stringify(exerciseObj.content);
          } catch (error) {
            console.warn('⚠️ Error stringifying content for exercise:', exerciseObj._id, error.message);
            contentString = '{}';
          }
        } else if (typeof exerciseObj.content !== 'string') {
          contentString = '{}';
        }

        // Handle prompt_template fields
        let promptTemplate = null;
        if (exerciseObj.prompt_template) {
          promptTemplate = {
            ...exerciseObj.prompt_template,
            expected_output_format: exerciseObj.prompt_template.expected_output_format 
              ? JSON.stringify(exerciseObj.prompt_template.expected_output_format)
              : null,
            fallback_template: exerciseObj.prompt_template.fallback_template
              ? JSON.stringify(exerciseObj.prompt_template.fallback_template)
              : null
          };
        }

        return {
          ...exerciseObj,
          content: contentString,
          prompt_template: promptTemplate,
          id: exerciseObj._id.toString(),
          courseId: exerciseObj.courseId.toString(),
          unitId: exerciseObj.unitId.toString(),
          lessonId: exerciseObj.lessonId.toString(),
          createdBy: exerciseObj.createdBy && exerciseObj.createdBy.username ? exerciseObj.createdBy : null,
          createdAt: safeDate(exerciseObj.createdAt) || new Date().toISOString(),
          updatedAt: safeDate(exerciseObj.updatedAt) || new Date().toISOString(),
          // Ensure other required fields have default values
          maxScore: exerciseObj.maxScore || 100,
          xpReward: exerciseObj.xpReward || 5,
          estimatedTime: exerciseObj.estimatedTime || 30,
          sortOrder: exerciseObj.sortOrder || 0,
          successRate: exerciseObj.successRate || 0,
          skill_focus: exerciseObj.skill_focus || [],
          tags: exerciseObj.tags || []
        };
      } catch (error) {
        console.error('❌ Error in exercise query:', error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch exercise');
      }
    },

    // Get exercises by lesson ID
    lessonExercises: async (parent, { lessonId }, { db, user }) => {
      try {
        console.log('🎮 Getting exercises for lesson:', lessonId);
        
        const exercises = await Exercise.find({ lessonId: lessonId })
          .populate('createdBy', 'username displayName')
          .populate('lessonId', 'title type')
          .populate('unitId', 'title')
          .populate('courseId', 'title')
          .sort({ sortOrder: 1, createdAt: -1 });
        
        // Transform exercises to match GraphQL schema
        return exercises.map(exercise => {
          // First convert to plain object if it's a Mongoose document
          const exerciseObj = exercise.toObject ? exercise.toObject() : { ...exercise };
          
          // Safely convert dates to ISO strings
          const safeDate = (date) => {
            if (!date) return null;
            try {
              return new Date(date).toISOString();
            } catch (err) {
              console.warn('⚠️ Invalid date value:', date);
              return null;
            }
          };

          // Ensure content is a JSON string for lessonExercises
          let contentString = exerciseObj.content;
          if (typeof exerciseObj.content === 'object') {
            try {
              contentString = JSON.stringify(exerciseObj.content);
            } catch (error) {
              console.warn('⚠️ Error stringifying content for exercise:', exerciseObj._id, error.message);
              contentString = '{}';
            }
          } else if (typeof exerciseObj.content !== 'string') {
            contentString = '{}';
          }

          // Handle prompt_template fields
          let promptTemplate = null;
          if (exerciseObj.prompt_template) {
            promptTemplate = {
              ...exerciseObj.prompt_template,
              expected_output_format: exerciseObj.prompt_template.expected_output_format 
                ? JSON.stringify(exerciseObj.prompt_template.expected_output_format)
                : null,
              fallback_template: exerciseObj.prompt_template.fallback_template
                ? JSON.stringify(exerciseObj.prompt_template.fallback_template)
                : null
            };
          }

          return {
            ...exerciseObj,
            content: contentString,
            prompt_template: promptTemplate,
            id: exerciseObj._id.toString(),
            courseId: exerciseObj.courseId.toString(),
            unitId: exerciseObj.unitId.toString(),
            lessonId: exerciseObj.lessonId.toString(),
            createdBy: exerciseObj.createdBy && exerciseObj.createdBy.username ? exerciseObj.createdBy : null,
            createdAt: safeDate(exerciseObj.createdAt) || new Date().toISOString(),
            updatedAt: safeDate(exerciseObj.updatedAt) || new Date().toISOString(),
            // Ensure other required fields have default values
            maxScore: exerciseObj.maxScore || 100,
            xpReward: exerciseObj.xpReward || 5,
            estimatedTime: exerciseObj.estimatedTime || 30,
            sortOrder: exerciseObj.sortOrder || 0,
            successRate: exerciseObj.successRate || 0,
            skill_focus: exerciseObj.skill_focus || [],
            tags: exerciseObj.tags || []
          };
        });
      } catch (error) {
        console.error('❌ Error in lessonExercises query:', error);
        throw new GraphQLError('Failed to fetch lesson exercises');
      }
    },
  },

  Mutation: {
    generateSampleLessons: async (parent, { unitId, count = 3 }, { db, user }) => {
      try {
        console.log('🎲 Generating sample lessons for unit:', unitId);
        
        // Check authentication
        if (!user) {
          throw new GraphQLError('You must be logged in to generate lessons');
        }
        
        // Check if unit exists
        const unit = await db.units.findById(unitId);
        if (!unit) {
          throw new GraphQLError('Unit not found');
        }

        const sampleLessons = [
          {
            title: "Basic Greetings",
            description: "Learn common greetings and introductions in English",
            type: "vocabulary",
            lesson_type: "vocabulary",
            objective: "Master basic greetings and self-introductions",
            icon: "👋",
            totalExercises: 6,
            estimatedDuration: 15,
            difficulty: "easy",
            xpReward: 50,
            sortOrder: 1,
            isPremium: false,
            isPublished: true
          },
          {
            title: "Introducing Yourself",
            description: "Practice introducing yourself and asking basic questions",
            type: "conversation",
            lesson_type: "mixed",
            objective: "Learn to introduce yourself and ask basic questions",
            icon: "🗣️",
            totalExercises: 8,
            estimatedDuration: 20,
            difficulty: "easy",
            xpReward: 60,
            sortOrder: 2,
            isPremium: false,
            isPublished: true
          },
          {
            title: "Common Phrases",
            description: "Essential phrases for basic communication",
            type: "vocabulary",
            lesson_type: "vocabulary",
            objective: "Learn and practice common everyday phrases",
            icon: "💬",
            totalExercises: 7,
            estimatedDuration: 18,
            difficulty: "easy",
            xpReward: 55,
            sortOrder: 3,
            isPremium: false,
            isPublished: true
          }
        ];

        // Create lessons
        const createdLessons = [];
        for (const lessonData of sampleLessons) {
          const lesson = await db.lessons.create(
            {
              ...lessonData,
              courseId: unit.courseId,
              unitId: unit._id,
            },
            user.userId // Pass createdBy as second argument
          );
          createdLessons.push(lesson);
        }

        // Update unit's totalLessons count
        await db.units.update(unitId, {
          totalLessons: createdLessons.length
        });

        console.log(`✅ Created ${createdLessons.length} sample lessons`);
        
        return {
          success: true,
          message: `Created ${createdLessons.length} sample lessons`,
          lessons: createdLessons
        };
      } catch (error) {
        console.error('❌ Error generating sample lessons:', error);
        throw new GraphQLError(error.message);
      }
    }
  }
};