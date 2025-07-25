// ===============================================
// CONTENT MANAGEMENT MUTATIONS - LINGUALEAP
// ===============================================

import { GraphQLError } from 'graphql';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const contentMutationTypeDefs = `
  # Course Input Types
  input CreateCourseInput {
    title: String!
    description: String!
    level: String!
    category: String!
    difficulty: String!
    estimatedDuration: Int!
    color: String
    thumbnail: String
    isPremium: Boolean
    learningObjectives: [String!]
    prerequisites: [String!]
    skill_focus: [String!]
    sortOrder: Int
    totalXP: Int
  }

  input UpdateCourseInput {
    title: String
    description: String
    level: String
    category: String
    difficulty: String
    estimatedDuration: Int
    color: String
    thumbnail: String
    isPremium: Boolean
    isPublished: Boolean
    learningObjectives: [String!]
    prerequisites: [String!]
    skill_focus: [String!]
    sortOrder: Int
    totalXP: Int
  }

  # Unit Input Types
  input CreateUnitInput {
    title: String!
    description: String!
    courseId: ID!
    theme: String!
    icon: String
    color: String
    estimatedDuration: Int!
    isPremium: Boolean
    sortOrder: Int!
    xpReward: Int
    vocabulary: [CourseVocabularyInput!]
    grammarPoints: [GrammarPointInput!]
  }

  input UpdateUnitInput {
    title: String
    description: String
    courseId: ID
    theme: String
    icon: String
    color: String
    estimatedDuration: Int
    isPremium: Boolean
    isPublished: Boolean
    sortOrder: Int
    xpReward: Int
    vocabulary: [CourseVocabularyInput!]
    grammarPoints: [GrammarPointInput!]
  }

  input CourseVocabularyInput {
    word: String!
    meaning: String!
    pronunciation: String
    audioUrl: String
    example: ExampleInput
  }

  input ExampleInput {
    sentence: String!
    translation: String!
  }

  input GrammarPointInput {
    title: String!
    explanation: String!
    examples: [ExampleInput!]
  }

  # Lesson Input Types
  input CreateLessonInput {
    title: String!
    description: String
    courseId: ID!
    unitId: ID!
    type: String!
    lesson_type: String
    objective: String
    icon: String
    thumbnail: String
    estimatedDuration: Int!
    difficulty: String
    isPremium: Boolean
    sortOrder: Int!
    xpReward: Int
    perfectScoreBonus: Int
    targetAccuracy: Int
    passThreshold: Int
    vocabulary: [CourseVocabularyInput!]
    grammarFocus: GrammarPointInput
  }

  input UpdateLessonInput {
    title: String
    description: String
    courseId: ID
    unitId: ID
    type: String
    lesson_type: String
    objective: String
    icon: String
    thumbnail: String
    estimatedDuration: Int
    difficulty: String
    isPremium: Boolean
    isPublished: Boolean
    sortOrder: Int
    xpReward: Int
    perfectScoreBonus: Int
    targetAccuracy: Int
    passThreshold: Int
    vocabulary: [CourseVocabularyInput!]
    grammarFocus: GrammarPointInput
  }

  # Exercise Input Types
  input CreateExerciseInput {
    title: String
    instruction: String!
    courseId: ID!
    unitId: ID!
    lessonId: ID!
    type: String!
    skill_focus: [String!]
    question: ExerciseQuestionInput!
    content: String! # JSON string
    maxScore: Int
    difficulty: String
    xpReward: Int
    timeLimit: Int
    estimatedTime: Int
    requires_audio: Boolean
    requires_microphone: Boolean
    isPremium: Boolean
    isActive: Boolean
    sortOrder: Int!
    feedback: FeedbackInput
    tags: [String!]
  }

  input UpdateExerciseInput {
    title: String
    instruction: String
    type: String
    question: ExerciseQuestionInput
    content: String
    maxScore: Int
    difficulty: String
    xpReward: Int
    timeLimit: Int
    estimatedTime: Int
    isPremium: Boolean
    isActive: Boolean
    sortOrder: Int
    feedback: FeedbackInput
    tags: [String!]
  }

  input ExerciseQuestionInput {
    text: String!
    audioUrl: String
    imageUrl: String
    videoUrl: String
  }

  input FeedbackInput {
    correct: String
    incorrect: String
    hint: String
  }

  extend type Mutation {
    # Course Mutations
    createCourse(input: CreateCourseInput!): Course!
    updateCourse(id: ID!, input: UpdateCourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
    publishCourse(id: ID!): Course!
    unpublishCourse(id: ID!): Course!

    # Unit Mutations
    createUnit(input: CreateUnitInput!): Unit!
    updateUnit(id: ID!, input: UpdateUnitInput!): Unit!
    deleteUnit(id: ID!): Boolean!
    publishUnit(id: ID!): Unit!
    unpublishUnit(id: ID!): Unit!

    # Lesson Mutations
    createLesson(input: CreateLessonInput!): Lesson!
    updateLesson(id: ID!, input: UpdateLessonInput!): Lesson!
    deleteLesson(id: ID!): Boolean!
    publishLesson(id: ID!): Lesson!
    unpublishLesson(id: ID!): Lesson!

    # Exercise Mutations
    createExercise(input: CreateExerciseInput!): Exercise!
    updateExercise(id: ID!, input: UpdateExerciseInput!): Exercise!
    deleteExercise(id: ID!): Boolean!
    publishExercise(id: ID!): Exercise!
    unpublishExercise(id: ID!): Exercise!
  }
`;

// ===============================================
// RESOLVERS
// ===============================================

export const contentMutationResolvers = {
  Mutation: {
    // ===============================================
    // COURSE MUTATIONS
    // ===============================================

    createCourse: async (parent, { input }, { db, user }) => {
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📚 Creating new course:', input.title);

        const courseData = {
          ...input,
          createdBy: user.userId,
          isPublished: false,
          sortOrder: input.sortOrder || 0
        };

        const course = await db.courses.create(courseData, user.userId);
        
        // Transform course to handle createdBy field properly
        const courseObj = course.toObject ? course.toObject() : { ...course };
        
        return {
          ...courseObj,
          id: courseObj._id.toString(),
          createdBy: courseObj.createdBy && courseObj.createdBy.username ? courseObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error creating course:', error.message);
        throw new GraphQLError('Failed to create course');
      }
    },

    updateCourse: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📚 Updating course:', id);

        const updateData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const course = await db.courses.update(id, updateData);
        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        // Transform course to handle createdBy field properly
        const courseObj = course.toObject ? course.toObject() : { ...course };
        
        return {
          ...courseObj,
          id: courseObj._id.toString(),
          createdBy: courseObj.createdBy && courseObj.createdBy.username ? courseObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error updating course:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update course');
      }
    },

    deleteCourse: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting course:', id);

        const deleted = await db.courses.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting course:', error.message);
        throw new GraphQLError('Failed to delete course');
      }
    },

    publishCourse: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can publish courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📢 Publishing course:', id);

        const course = await db.courses.update(id, {
          isPublished: true,
          publishedAt: new Date(),
          lastUpdatedBy: user.userId
        });

        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        // Transform course to handle createdBy field properly
        const courseObj = course.toObject ? course.toObject() : { ...course };
        
        return {
          ...courseObj,
          id: courseObj._id.toString(),
          createdBy: courseObj.createdBy && courseObj.createdBy.username ? courseObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error publishing course:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to publish course');
      }
    },

    unpublishCourse: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can unpublish courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📢 Unpublishing course:', id);

        const course = await db.courses.update(id, {
          isPublished: false,
          publishedAt: null,
          lastUpdatedBy: user.userId
        });

        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        // Transform course to handle createdBy field properly
        const courseObj = course.toObject ? course.toObject() : { ...course };
        
        return {
          ...courseObj,
          id: courseObj._id.toString(),
          createdBy: courseObj.createdBy && courseObj.createdBy.username ? courseObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error unpublishing course:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to unpublish course');
      }
    },

    // ===============================================
    // UNIT MUTATIONS
    // ===============================================

    createUnit: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📖 Creating new unit:', input.title);

        // Fix: Get userId from user context (could be userId or _id)
        const userId = user.userId || user._id || user.id;
        
        console.log('🔍 [createUnit] User context:', JSON.stringify(user, null, 2));
        console.log('🔍 [createUnit] Extracted userId:', userId);
        
        if (!userId) {
          throw new GraphQLError('User ID not found in context', {
            extensions: { code: 'AUTHENTICATION_ERROR' }
          });
        }

        const unitData = {
          ...input,
          createdBy: userId,
          isPublished: false
        };

        const unit = await db.units.create(unitData, userId);
        
        // Transform unit to handle createdBy field properly
        const unitObj = unit.toObject ? unit.toObject() : { ...unit };
        
        return {
          ...unitObj,
          id: unitObj._id.toString(),
          createdBy: unitObj.createdBy && unitObj.createdBy.username ? unitObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error creating unit:', error.message);
        throw new GraphQLError('Failed to create unit');
      }
    },

    updateUnit: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📖 Updating unit:', id);

        const updateData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const unit = await db.units.update(id, updateData);
        if (!unit) {
          throw new GraphQLError('Unit not found', {
            extensions: { code: 'UNIT_NOT_FOUND' }
          });
        }

        // Transform unit to handle createdBy field properly
        const unitObj = unit.toObject ? unit.toObject() : { ...unit };
        
        return {
          ...unitObj,
          id: unitObj._id.toString(),
          createdBy: unitObj.createdBy && unitObj.createdBy.username ? unitObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error updating unit:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update unit');
      }
    },

    deleteUnit: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting unit:', id);

        const deleted = await db.units.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting unit:', error.message);
        throw new GraphQLError('Failed to delete unit');
      }
    },

    // ===============================================
    // LESSON MUTATIONS
    // ===============================================

    createLesson: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📝 Creating new lesson:', input.title);

        // Fix: Get userId from user context
        const userId = user.userId || user._id || user.id;
        
        const lessonData = {
          ...input,
          createdBy: userId,
          isPublished: false
        };

        const lesson = await db.lessons.create(lessonData, userId);
        
        // Transform lesson to handle createdBy field properly
        const lessonObj = lesson.toObject ? lesson.toObject() : { ...lesson };
        
        return {
          ...lessonObj,
          id: lessonObj._id.toString(),
          createdBy: lessonObj.createdBy && lessonObj.createdBy.username ? lessonObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error creating lesson:', error.message);
        throw new GraphQLError('Failed to create lesson');
      }
    },

    updateLesson: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📝 Updating lesson:', id);
        console.log('🔍 Lesson ID type:', typeof id);
        console.log('🔍 Lesson ID value:', id);

        // Fix: Get userId from user context
        const userId = user.userId || user._id || user.id;
        
        const updateData = {
          ...input,
          lastUpdatedBy: userId
        };

        console.log('🔍 Update data:', updateData);

        const lesson = await db.lessons.update(id, updateData);
        console.log('🔍 Update result:', lesson);
        
        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        // Transform lesson to handle createdBy field properly
        const lessonObj = lesson.toObject ? lesson.toObject() : { ...lesson };
        
        return {
          ...lessonObj,
          id: lessonObj._id.toString(),
          createdBy: lessonObj.createdBy && lessonObj.createdBy.username ? lessonObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error updating lesson:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update lesson');
      }
    },

    deleteLesson: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting lesson:', id);

        const deleted = await db.lessons.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting lesson:', error.message);
        throw new GraphQLError('Failed to delete lesson');
      }
    },

    publishLesson: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can publish lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📢 Publishing lesson:', id);

        // Fix: Get userId from user context
        const userId = user.userId || user._id || user.id;

        const lesson = await db.lessons.update(id, {
          isPublished: true,
          publishedAt: new Date(),
          lastUpdatedBy: userId
        });

        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        // Transform lesson to handle createdBy field properly
        const lessonObj = lesson.toObject ? lesson.toObject() : { ...lesson };
        
        return {
          ...lessonObj,
          id: lessonObj._id.toString(),
          createdBy: lessonObj.createdBy && lessonObj.createdBy.username ? lessonObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error publishing lesson:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to publish lesson');
      }
    },

    unpublishLesson: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can unpublish lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📢 Unpublishing lesson:', id);

        // Fix: Get userId from user context
        const userId = user.userId || user._id || user.id;

        const lesson = await db.lessons.update(id, {
          isPublished: false,
          publishedAt: null,
          lastUpdatedBy: userId
        });

        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        // Transform lesson to handle createdBy field properly
        const lessonObj = lesson.toObject ? lesson.toObject() : { ...lesson };
        
        return {
          ...lessonObj,
          id: lessonObj._id.toString(),
          createdBy: lessonObj.createdBy && lessonObj.createdBy.username ? lessonObj.createdBy : null,
        };
      } catch (error) {
        console.error('❌ Error unpublishing lesson:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to unpublish lesson');
      }
    },

    // ===============================================
    // EXERCISE MUTATIONS
    // ===============================================

    createExercise: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🎮 Creating new exercise:', input.type);

        const exerciseData = {
          ...input,
          createdBy: user.userId,
          isActive: true
        };

        const exercise = await db.exercises.create(exerciseData, user.userId);
        return exercise;
      } catch (error) {
        console.error('❌ Error creating exercise:', error.message);
        throw new GraphQLError('Failed to create exercise');
      }
    },

    updateExercise: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🎮 Updating exercise:', id);

        const updateData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const exercise = await db.exercises.update(id, updateData);
        if (!exercise) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'EXERCISE_NOT_FOUND' }
          });
        }

        return exercise;
      } catch (error) {
        console.error('❌ Error updating exercise:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update exercise');
      }
    },

    deleteExercise: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting exercise:', id);

        const deleted = await db.exercises.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting exercise:', error.message);
        throw new GraphQLError('Failed to delete exercise');
      }
    },

    // ===============================================
    // UNIT CRUD OPERATIONS
    // ===============================================

    createUnit: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📖 Creating unit:', input.title);

        const unitData = {
          ...input,
          createdBy: user.userId,
          lastUpdatedBy: user.userId
        };

        const unit = await db.units.create(unitData);
        if (!unit) {
          throw new GraphQLError('Failed to create unit');
        }

        return unit;
      } catch (error) {
        console.error('❌ Error creating unit:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to create unit');
      }
    },

    publishUnit: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can publish units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📢 Publishing unit:', id);

        const unit = await db.units.update(id, {
          isPublished: true,
          publishedAt: new Date(),
          lastUpdatedBy: user.userId
        });

        if (!unit) {
          throw new GraphQLError('Unit not found', {
            extensions: { code: 'UNIT_NOT_FOUND' }
          });
        }

        return unit;
      } catch (error) {
        console.error('❌ Error publishing unit:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to publish unit');
      }
    },

    unpublishUnit: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can unpublish units', {
          extensions: { code: 'FORBIDDEN' }
        });
      }
      try {
        console.log('📢 Unpublishing unit:', id);
        const unit = await db.units.update(id, {
          isPublished: false,
          publishedAt: null,
          lastUpdatedBy: user.userId
        });
        if (!unit) {
          throw new GraphQLError('Unit not found', {
            extensions: { code: 'UNIT_NOT_FOUND' }
          });
        }
        return unit;
      } catch (error) {
        console.error('❌ Error unpublishing unit:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to unpublish unit');
      }
    },

    // ===============================================
    // EXERCISE CRUD OPERATIONS
    // ===============================================

    createExercise: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🎮 Creating exercise:', input.title || input.type);
        console.log('📝 Exercise data:', JSON.stringify(input, null, 2));

        // Parse content JSON string to object if it's a string
        let parsedContent = input.content;
        if (typeof input.content === 'string') {
          try {
            parsedContent = JSON.parse(input.content);
          } catch (error) {
            console.error('❌ Error parsing content JSON:', error.message);
            throw new GraphQLError('Invalid content JSON format');
          }
        }

        const exerciseData = {
          ...input,
          content: parsedContent,
          createdBy: user.userId,
          lastUpdatedBy: user.userId
        };

        console.log('📝 Final exercise data:', JSON.stringify(exerciseData, null, 2));

        const exercise = await db.exercises.create(exerciseData, user.userId);
        if (!exercise) {
          throw new GraphQLError('Failed to create exercise');
        }

        console.log('✅ Exercise created successfully:', exercise._id);
        
        // Transform exercise to match GraphQL schema
        const exerciseObj = exercise.toObject ? exercise.toObject() : { ...exercise };
        
        // Ensure content is a JSON string
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

        return {
          ...exerciseObj,
          content: contentString,
          id: exerciseObj._id.toString(),
          courseId: exerciseObj.courseId.toString(),
          unitId: exerciseObj.unitId.toString(),
          lessonId: exerciseObj.lessonId.toString(),
          createdAt: exerciseObj.createdAt ? new Date(exerciseObj.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: exerciseObj.updatedAt ? new Date(exerciseObj.updatedAt).toISOString() : new Date().toISOString(),
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
        console.error('❌ Error creating exercise:', error.message);
        console.error('❌ Error stack:', error.stack);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to create exercise');
      }
    },

    updateExercise: async (parent, { id, input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can update exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🎮 Updating exercise:', id);

        const exerciseData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const exercise = await db.exercises.update(id, exerciseData);
        if (!exercise) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'EXERCISE_NOT_FOUND' }
          });
        }

        // Transform exercise to match GraphQL schema
        const exerciseObj = exercise.toObject ? exercise.toObject() : { ...exercise };
        
        // Ensure content is a JSON string
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

        return {
          ...exerciseObj,
          content: contentString,
          id: exerciseObj._id.toString(),
          courseId: exerciseObj.courseId.toString(),
          unitId: exerciseObj.unitId.toString(),
          lessonId: exerciseObj.lessonId.toString(),
          createdAt: exerciseObj.createdAt ? new Date(exerciseObj.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: exerciseObj.updatedAt ? new Date(exerciseObj.updatedAt).toISOString() : new Date().toISOString(),
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
        console.error('❌ Error updating exercise:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to update exercise');
      }
    },

    deleteExercise: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can delete exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('🗑️ Deleting exercise:', id);

        const deleted = await db.exercises.delete(id);
        return deleted;
      } catch (error) {
        console.error('❌ Error deleting exercise:', error.message);
        throw new GraphQLError('Failed to delete exercise');
      }
    },

    publishExercise: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can publish exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📢 Publishing exercise:', id);

        const exercise = await db.exercises.update(id, {
          isActive: true,
          lastUpdatedBy: user.userId
        });

        if (!exercise) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'EXERCISE_NOT_FOUND' }
          });
        }

        return exercise;
      } catch (error) {
        console.error('❌ Error publishing exercise:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to publish exercise');
      }
    },

    unpublishExercise: async (parent, { id }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can unpublish exercises', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📢 Unpublishing exercise:', id);

        const exercise = await db.exercises.update(id, {
          isActive: false,
          lastUpdatedBy: user.userId
        });

        if (!exercise) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'EXERCISE_NOT_FOUND' }
          });
        }

        return exercise;
      } catch (error) {
        console.error('❌ Error unpublishing exercise:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to unpublish exercise');
      }
    }
  }
};