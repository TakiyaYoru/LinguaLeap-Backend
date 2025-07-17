// ===============================================
// COURSE GRAPHQL RESOLVERS - LINGUALEAP
// ===============================================

import { GraphQLError } from 'graphql';

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
    xpReward: Int!
    sortOrder: Int!
    progressPercentage: Int!
    isUnlocked: Boolean!
    vocabulary: [UnitVocabulary!]!
    createdAt: String!
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
    xpReward: Int!
    perfectScoreBonus: Int!
    targetAccuracy: Int!
    passThreshold: Int!
    sortOrder: Int!
    status: String!
    isCompleted: Boolean!
    isUnlocked: Boolean!
    userScore: Int
    createdAt: String!
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
  }

  type PromptTemplate {
    system_context: String
    main_prompt: String
    variables: [String!]!
    expected_output_format: String! # JSON string
    fallback_template: String! # JSON string
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
    
    # Get single course by ID
    course(id: ID!): Course
    
    # Get units by course ID
    courseUnits(courseId: ID!): [Unit!]!
    
    # Get lessons by unit ID
    unitLessons(unitId: ID!): [Lesson!]!
    
    # Get exercises by lesson ID
    lessonExercises(lessonId: ID!): [Exercise!]!
    
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
            createdBy: courseObj.createdBy || null,
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
          createdBy: course.createdBy || null
        };
      } catch (error) {
        console.error('❌ Error in course query:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to fetch course');
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