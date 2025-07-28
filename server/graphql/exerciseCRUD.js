// ===============================================
// EXERCISE CRUD OPERATIONS - GRAPHQL RESOLVERS
// ===============================================

import { GraphQLError } from 'graphql';
import { STATIC_EXERCISES, getExerciseBySubtype, getAllExerciseSubtypes, getExercisesBySkill, getExercisesByType } from '../data/staticExercises.js';
import { requireAdmin, requireUser } from '../utils/auth.js';

// In-memory storage for exercises (replace with database later)
let exercises = [];
let exerciseIdCounter = 1;

// Initialize with static exercises
Object.values(STATIC_EXERCISES).forEach(exercise => {
  exercises.push({
    _id: `exercise_${exerciseIdCounter++}`,
    ...exercise,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    isPremium: false,
    sortOrder: exerciseIdCounter - 1,
    successRate: 0,
    totalAttempts: 0,
    correctAttempts: 0
  });
});

export const exerciseCRUDTypeDefs = `
  # Exercise CRUD Types
  type ExerciseCRUD {
    _id: ID!
    type: String!
    exercise_subtype: String!
    title: String!
    instruction: String!
    content: String! # JSON string
    maxScore: Int!
    difficulty: String!
    xpReward: Int!
    timeLimit: Int
    estimatedTime: Int!
    requiresAudio: Boolean!
    requiresMicrophone: Boolean!
    isActive: Boolean!
    isPremium: Boolean!
    sortOrder: Int!
    successRate: Int!
    totalAttempts: Int!
    correctAttempts: Int!
    skillFocus: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreateExerciseInput {
    type: String!
    exercise_subtype: String!
    title: String!
    instruction: String!
    content: String! # JSON string
    maxScore: Int!
    difficulty: String!
    xpReward: Int!
    timeLimit: Int
    estimatedTime: Int!
    requiresAudio: Boolean!
    requiresMicrophone: Boolean!
    isPremium: Boolean
    sortOrder: Int
    skillFocus: [String!]!
  }

  input UpdateExerciseInput {
    type: String
    exercise_subtype: String
    title: String
    instruction: String
    content: String
    maxScore: Int
    difficulty: String
    xpReward: Int
    timeLimit: Int
    estimatedTime: Int
    requiresAudio: Boolean
    requiresMicrophone: Boolean
    isActive: Boolean
    isPremium: Boolean
    sortOrder: Int
    skillFocus: [String!]
  }

  input ExerciseFilterInput {
    type: String
    exercise_subtype: String
    difficulty: String
    skillFocus: [String!]
    isActive: Boolean
    isPremium: Boolean
    requiresAudio: Boolean
    requiresMicrophone: Boolean
  }

  type ExerciseCRUDPayload {
    success: Boolean!
    message: String!
    exercise: ExerciseCRUD
  }

  type ExerciseListPayload {
    success: Boolean!
    message: String!
    exercises: [ExerciseCRUD!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  type ExerciseStatsPayload {
    success: Boolean!
    message: String!
    stats: ExerciseStats!
  }

  type ExerciseStats {
    total: Int!
    byType: [TypeCount!]!
    byDifficulty: [DifficultyCount!]!
    bySkill: [SkillCount!]!
    averageSuccessRate: Float!
    totalAttempts: Int!
    totalCorrectAttempts: Int!
  }

  type TypeCount {
    type: String!
    count: Int!
  }

  type DifficultyCount {
    difficulty: String!
    count: Int!
  }

  type SkillCount {
    skill: String!
    count: Int!
  }

  extend type Query {
    # Get all exercises with pagination and filtering
    getExercises(
      page: Int = 1
      limit: Int = 10
      filter: ExerciseFilterInput
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): ExerciseListPayload!
    
    # Get exercise by ID
    getExercise(id: ID!): ExerciseCRUD
    
    # Get exercise by subtype
    getExerciseBySubtype(subtype: String!): ExerciseCRUD
    
    # Get exercises by type
    getExercisesByType(type: String!): [ExerciseCRUD!]!
    
    # Get exercises by skill focus
    getExercisesBySkill(skill: String!): [ExerciseCRUD!]!
    
    # Get all available exercise subtypes
    getExerciseSubtypes: [String!]!
    
    # Get exercise statistics
    getExerciseStats: ExerciseStatsPayload!
    
    # Get random exercise
    getRandomExercise(filter: ExerciseFilterInput): ExerciseCRUD
    
    # Get exercises for lesson (multiple exercises)
    getLessonExercises(
      lessonId: ID!
      count: Int = 6
      skillFocus: [String!]
    ): [ExerciseCRUD!]!
  }

  extend type Mutation {
    # Create new exercise
    createExercise(input: CreateExerciseInput!): ExerciseCRUDPayload!
    
    # Update exercise
    updateExercise(id: ID!, input: UpdateExerciseInput!): ExerciseCRUDPayload!
    
    # Delete exercise
    deleteExercise(id: ID!): ExerciseCRUDPayload!
    
    # Toggle exercise active status
    toggleExerciseActive(id: ID!): ExerciseCRUDPayload!
    
    # Update exercise success rate
    updateExerciseSuccessRate(
      id: ID!
      isCorrect: Boolean!
    ): ExerciseCRUDPayload!
    
    # Bulk create exercises from template
    bulkCreateExercises(
      template: String!
      count: Int!
      skillFocus: [String!]
    ): ExerciseListPayload!
    
    # Reorder exercises
    reorderExercises(ids: [ID!]!): ExerciseListPayload!
  }
`;

export const exerciseCRUDResolvers = {
  Query: {
    // Get all exercises with pagination and filtering
    getExercises: async (parent, { page = 1, limit = 10, filter = {}, sortBy = "createdAt", sortOrder = "desc" }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to view exercises', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        let filteredExercises = [...exercises];

        // Apply filters
        if (filter.type) {
          filteredExercises = filteredExercises.filter(ex => ex.type === filter.type);
        }
        if (filter.exercise_subtype) {
          filteredExercises = filteredExercises.filter(ex => ex.exercise_subtype === filter.exercise_subtype);
        }
        if (filter.difficulty) {
          filteredExercises = filteredExercises.filter(ex => ex.difficulty === filter.difficulty);
        }
        if (filter.skillFocus && filter.skillFocus.length > 0) {
          filteredExercises = filteredExercises.filter(ex => 
            ex.skillFocus.some(skill => filter.skillFocus.includes(skill))
          );
        }
        if (filter.isActive !== undefined) {
          filteredExercises = filteredExercises.filter(ex => ex.isActive === filter.isActive);
        }
        if (filter.isPremium !== undefined) {
          filteredExercises = filteredExercises.filter(ex => ex.isPremium === filter.isPremium);
        }
        if (filter.requiresAudio !== undefined) {
          filteredExercises = filteredExercises.filter(ex => ex.requiresAudio === filter.requiresAudio);
        }
        if (filter.requiresMicrophone !== undefined) {
          filteredExercises = filteredExercises.filter(ex => ex.requiresMicrophone === filter.requiresMicrophone);
        }

        // Apply sorting
        filteredExercises.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];
          
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (sortOrder === 'desc') {
            return aValue < bValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });

        // Apply pagination
        const total = filteredExercises.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedExercises = filteredExercises.slice(startIndex, endIndex);

        return {
          success: true,
          message: `Found ${total} exercises`,
          exercises: paginatedExercises,
          total,
          page,
          limit
        };

      } catch (error) {
        console.error('❌ Error getting exercises:', error.message);
        throw new GraphQLError('Failed to get exercises');
      }
    },

    // Get exercise by ID
    getExercise: async (parent, { id }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to view exercises', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const exercise = exercises.find(ex => ex._id === id);
        if (!exercise) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return exercise;

      } catch (error) {
        console.error('❌ Error getting exercise:', error.message);
        throw error;
      }
    },

    // Get exercise by subtype
    getExerciseBySubtype: async (parent, { subtype }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to view exercises', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const exercise = exercises.find(ex => ex.exercise_subtype === subtype);
        if (!exercise) {
          throw new GraphQLError('Exercise subtype not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return exercise;

      } catch (error) {
        console.error('❌ Error getting exercise by subtype:', error.message);
        throw error;
      }
    },

    // Get exercises by type
    getExercisesByType: async (parent, { type }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to view exercises', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        return exercises.filter(ex => ex.type === type);

      } catch (error) {
        console.error('❌ Error getting exercises by type:', error.message);
        throw new GraphQLError('Failed to get exercises by type');
      }
    },

    // Get exercises by skill focus
    getExercisesBySkill: async (parent, { skill }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to view exercises', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        return exercises.filter(ex => ex.skillFocus.includes(skill));

      } catch (error) {
        console.error('❌ Error getting exercises by skill:', error.message);
        throw new GraphQLError('Failed to get exercises by skill');
      }
    },

    // Get all available exercise subtypes
    getExerciseSubtypes: async (parent, args, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to view exercise subtypes', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        return getAllExerciseSubtypes();

      } catch (error) {
        console.error('❌ Error getting exercise subtypes:', error.message);
        throw new GraphQLError('Failed to get exercise subtypes');
      }
    },

    // Get exercise statistics
    getExerciseStats: async (parent, args, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to view exercise stats', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const total = exercises.length;
        const totalAttempts = exercises.reduce((sum, ex) => sum + ex.totalAttempts, 0);
        const totalCorrectAttempts = exercises.reduce((sum, ex) => sum + ex.correctAttempts, 0);
        const averageSuccessRate = totalAttempts > 0 ? (totalCorrectAttempts / totalAttempts) * 100 : 0;

        // Count by type
        const typeCount = {};
        exercises.forEach(ex => {
          typeCount[ex.type] = (typeCount[ex.type] || 0) + 1;
        });

        // Count by difficulty
        const difficultyCount = {};
        exercises.forEach(ex => {
          difficultyCount[ex.difficulty] = (difficultyCount[ex.difficulty] || 0) + 1;
        });

        // Count by skill
        const skillCount = {};
        exercises.forEach(ex => {
          ex.skillFocus.forEach(skill => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
          });
        });

        return {
          success: true,
          message: 'Exercise statistics retrieved successfully',
          stats: {
            total,
            byType: Object.entries(typeCount).map(([type, count]) => ({ type, count })),
            byDifficulty: Object.entries(difficultyCount).map(([difficulty, count]) => ({ difficulty, count })),
            bySkill: Object.entries(skillCount).map(([skill, count]) => ({ skill, count })),
            averageSuccessRate,
            totalAttempts,
            totalCorrectAttempts
          }
        };

      } catch (error) {
        console.error('❌ Error getting exercise stats:', error.message);
        throw new GraphQLError('Failed to get exercise statistics');
      }
    },

    // Get random exercise
    getRandomExercise: async (parent, { filter = {} }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to get random exercise', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        let filteredExercises = [...exercises];

        // Apply filters
        if (filter.type) {
          filteredExercises = filteredExercises.filter(ex => ex.type === filter.type);
        }
        if (filter.exercise_subtype) {
          filteredExercises = filteredExercises.filter(ex => ex.exercise_subtype === filter.exercise_subtype);
        }
        if (filter.difficulty) {
          filteredExercises = filteredExercises.filter(ex => ex.difficulty === filter.difficulty);
        }
        if (filter.skillFocus && filter.skillFocus.length > 0) {
          filteredExercises = filteredExercises.filter(ex => 
            ex.skillFocus.some(skill => filter.skillFocus.includes(skill))
          );
        }

        if (filteredExercises.length === 0) {
          throw new GraphQLError('No exercises found with the given filter', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const randomIndex = Math.floor(Math.random() * filteredExercises.length);
        return filteredExercises[randomIndex];

      } catch (error) {
        console.error('❌ Error getting random exercise:', error.message);
        throw error;
      }
    },

    // Get exercises for lesson
    getLessonExercises: async (parent, { lessonId, count = 6, skillFocus = [] }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to get lesson exercises', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        let filteredExercises = [...exercises];

        // Filter by skill focus if provided
        if (skillFocus.length > 0) {
          filteredExercises = filteredExercises.filter(ex => 
            ex.skillFocus.some(skill => skillFocus.includes(skill))
          );
        }

        // Shuffle and take count
        const shuffled = filteredExercises.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);

      } catch (error) {
        console.error('❌ Error getting lesson exercises:', error.message);
        throw new GraphQLError('Failed to get lesson exercises');
      }
    }
  },

  Mutation: {
    // Create new exercise (Admin only)
    createExercise: async (parent, { input }, context) => {
      try {
        // Require admin access
        await requireAdmin(parent, { input }, context);

        // Validate input
        if (!input.type || !input.exercise_subtype || !input.title || !input.instruction) {
          throw new GraphQLError('Missing required fields', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const newExercise = {
          _id: `exercise_${exerciseIdCounter++}`,
          ...input,
          isActive: input.isActive !== undefined ? input.isActive : true,
          isPremium: input.isPremium !== undefined ? input.isPremium : false,
          sortOrder: input.sortOrder || exerciseIdCounter - 1,
          successRate: 0,
          totalAttempts: 0,
          correctAttempts: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        exercises.push(newExercise);

        return {
          success: true,
          message: 'Exercise created successfully',
          exercise: newExercise
        };

      } catch (error) {
        console.error('❌ Error creating exercise:', error.message);
        throw error;
      }
    },

    // Update exercise (Admin only)
    updateExercise: async (parent, { id, input }, context) => {
      try {
        // Require admin access
        await requireAdmin(parent, { id, input }, context);

        const exerciseIndex = exercises.findIndex(ex => ex._id === id);
        if (exerciseIndex === -1) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const updatedExercise = {
          ...exercises[exerciseIndex],
          ...input,
          updatedAt: new Date().toISOString()
        };

        exercises[exerciseIndex] = updatedExercise;

        return {
          success: true,
          message: 'Exercise updated successfully',
          exercise: updatedExercise
        };

      } catch (error) {
        console.error('❌ Error updating exercise:', error.message);
        throw error;
      }
    },

    // Delete exercise (Admin only)
    deleteExercise: async (parent, { id }, context) => {
      try {
        // Require admin access
        await requireAdmin(parent, { id }, context);

        const exerciseIndex = exercises.findIndex(ex => ex._id === id);
        if (exerciseIndex === -1) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const deletedExercise = exercises[exerciseIndex];
        exercises.splice(exerciseIndex, 1);

        return {
          success: true,
          message: 'Exercise deleted successfully',
          exercise: deletedExercise
        };

      } catch (error) {
        console.error('❌ Error deleting exercise:', error.message);
        throw error;
      }
    },

    // Toggle exercise active status (Admin only)
    toggleExerciseActive: async (parent, { id }, context) => {
      try {
        // Require admin access
        await requireAdmin(parent, { id }, context);

        const exerciseIndex = exercises.findIndex(ex => ex._id === id);
        if (exerciseIndex === -1) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        exercises[exerciseIndex].isActive = !exercises[exerciseIndex].isActive;
        exercises[exerciseIndex].updatedAt = new Date().toISOString();

        return {
          success: true,
          message: `Exercise ${exercises[exerciseIndex].isActive ? 'activated' : 'deactivated'} successfully`,
          exercise: exercises[exerciseIndex]
        };

      } catch (error) {
        console.error('❌ Error toggling exercise status:', error.message);
        throw error;
      }
    },

    // Update exercise success rate
    updateExerciseSuccessRate: async (parent, { id, isCorrect }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('You must be logged in to update exercise success rate', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const exerciseIndex = exercises.findIndex(ex => ex._id === id);
        if (exerciseIndex === -1) {
          throw new GraphQLError('Exercise not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        exercises[exerciseIndex].totalAttempts++;
        if (isCorrect) {
          exercises[exerciseIndex].correctAttempts++;
        }
        exercises[exerciseIndex].successRate = Math.round(
          (exercises[exerciseIndex].correctAttempts / exercises[exerciseIndex].totalAttempts) * 100
        );
        exercises[exerciseIndex].updatedAt = new Date().toISOString();

        return {
          success: true,
          message: 'Exercise success rate updated successfully',
          exercise: exercises[exerciseIndex]
        };

      } catch (error) {
        console.error('❌ Error updating exercise success rate:', error.message);
        throw error;
      }
    },

    // Bulk create exercises from template (Admin only)
    bulkCreateExercises: async (parent, { template, count, skillFocus = [] }, context) => {
      try {
        // Require admin access
        await requireAdmin(parent, { template, count, skillFocus }, context);

        const createdExercises = [];
        const templateExercise = getExerciseBySubtype(template);

        if (!templateExercise) {
          throw new GraphQLError('Template exercise not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        for (let i = 0; i < count; i++) {
          const newExercise = {
            _id: `exercise_${exerciseIdCounter++}`,
            ...templateExercise,
            title: `${templateExercise.title} ${i + 1}`,
            skillFocus: skillFocus.length > 0 ? skillFocus : templateExercise.skillFocus,
            isActive: true,
            isPremium: false,
            sortOrder: exerciseIdCounter - 1,
            successRate: 0,
            totalAttempts: 0,
            correctAttempts: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          exercises.push(newExercise);
          createdExercises.push(newExercise);
        }

        return {
          success: true,
          message: `Created ${count} exercises from template`,
          exercises: createdExercises,
          total: createdExercises.length,
          page: 1,
          limit: count
        };

      } catch (error) {
        console.error('❌ Error bulk creating exercises:', error.message);
        throw error;
      }
    },

    // Reorder exercises (Admin only)
    reorderExercises: async (parent, { ids }, context) => {
      try {
        // Require admin access
        await requireAdmin(parent, { ids }, context);

        const reorderedExercises = [];
        
        ids.forEach((id, index) => {
          const exerciseIndex = exercises.findIndex(ex => ex._id === id);
          if (exerciseIndex !== -1) {
            exercises[exerciseIndex].sortOrder = index + 1;
            exercises[exerciseIndex].updatedAt = new Date().toISOString();
            reorderedExercises.push(exercises[exerciseIndex]);
          }
        });

        // Sort exercises by new order
        exercises.sort((a, b) => a.sortOrder - b.sortOrder);

        return {
          success: true,
          message: 'Exercises reordered successfully',
          exercises: reorderedExercises,
          total: reorderedExercises.length,
          page: 1,
          limit: reorderedExercises.length
        };

      } catch (error) {
        console.error('❌ Error reordering exercises:', error.message);
        throw new GraphQLError('Failed to reorder exercises');
      }
    }
  }
}; 