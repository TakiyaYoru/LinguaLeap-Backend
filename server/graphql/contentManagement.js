// server/graphql/contentManagement.js - COMPLETE FIXED VERSION
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

  # Exercise Input Types - 🚀 COMPLETELY REMOVED TO AVOID CONFLICTS
  # Exercise inputs will be defined only in courses.js

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

    # Exercise Mutations will be defined in courses.js to avoid conflicts
  }
`;

// ===============================================
// RESOLVERS
// ===============================================

export const contentMutationResolvers = {
  Mutation: {
    // ===============================================
    // COURSE CRUD OPERATIONS
    // ===============================================

    createCourse: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create courses', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📚 Creating course:', input.title);
        
        const courseData = {
          ...input,
          createdBy: user.userId,
          lastUpdatedBy: user.userId
        };

        const course = await db.courses.create(courseData, user.userId);
        if (!course) {
          throw new GraphQLError('Failed to create course');
        }

        console.log('✅ Course created successfully:', course._id);
        return course;
      } catch (error) {
        console.error('❌ Error creating course:', error.message);
        if (error instanceof GraphQLError) throw error;
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

        const courseData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const course = await db.courses.update(id, courseData);
        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        return course;
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

        return course;
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
          lastUpdatedBy: user.userId
        });

        if (!course) {
          throw new GraphQLError('Course not found', {
            extensions: { code: 'COURSE_NOT_FOUND' }
          });
        }

        return course;
      } catch (error) {
        console.error('❌ Error unpublishing course:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to unpublish course');
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
        console.log('📂 Creating unit:', input.title);
        
        const unitData = {
          ...input,
          createdBy: user.userId,
          lastUpdatedBy: user.userId
        };

        const unit = await db.units.create(unitData, user.userId);
        if (!unit) {
          throw new GraphQLError('Failed to create unit');
        }

        console.log('✅ Unit created successfully:', unit._id);
        return unit;
      } catch (error) {
        console.error('❌ Error creating unit:', error.message);
        if (error instanceof GraphQLError) throw error;
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
        console.log('📂 Updating unit:', id);

        const unitData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const unit = await db.units.update(id, unitData);
        if (!unit) {
          throw new GraphQLError('Unit not found', {
            extensions: { code: 'UNIT_NOT_FOUND' }
          });
        }

        return unit;
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
    // LESSON CRUD OPERATIONS
    // ===============================================

    createLesson: async (parent, { input }, { db, user }) => {
      if (!user || user.role !== 'admin') {
        throw new GraphQLError('Only admins can create lessons', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      try {
        console.log('📝 Creating lesson:', input.title);
        
        const lessonData = {
          ...input,
          createdBy: user.userId,
          lastUpdatedBy: user.userId
        };

        const lesson = await db.lessons.create(lessonData, user.userId);
        if (!lesson) {
          throw new GraphQLError('Failed to create lesson');
        }

        console.log('✅ Lesson created successfully:', lesson._id);
        return lesson;
      } catch (error) {
        console.error('❌ Error creating lesson:', error.message);
        if (error instanceof GraphQLError) throw error;
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

        const lessonData = {
          ...input,
          lastUpdatedBy: user.userId
        };

        const lesson = await db.lessons.update(id, lessonData);
        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        return lesson;
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

        const lesson = await db.lessons.update(id, {
          isPublished: true,
          publishedAt: new Date(),
          lastUpdatedBy: user.userId
        });

        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        return lesson;
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

        const lesson = await db.lessons.update(id, {
          isPublished: false,
          lastUpdatedBy: user.userId
        });

        if (!lesson) {
          throw new GraphQLError('Lesson not found', {
            extensions: { code: 'LESSON_NOT_FOUND' }
          });
        }

        return lesson;
      } catch (error) {
        console.error('❌ Error unpublishing lesson:', error.message);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Failed to unpublish lesson');
      }
    }

    // Exercise operations removed - will be handled in courses.js
  }
};