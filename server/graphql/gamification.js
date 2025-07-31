// ===============================================
// GAMIFICATION GRAPHQL RESOLVERS - LINGUALEAP
// ===============================================

import { GraphQLError } from 'graphql';
import { db } from '../data/mongoRepo.js';
import { UserProgress, User } from '../data/models/index.js';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const gamificationTypeDefs = `
  type GamificationStats {
    level: Int!
    totalXP: Int!
    diamonds: Int!
    hearts: Int!
    currentStreak: Int!
    longestStreak: Int!
    isPremium: Boolean!
    heartsRefillTime: String
  }

  type LeaderboardEntry {
    id: ID!
    username: String!
    displayName: String!
    totalXP: Int!
    level: Int!
    diamonds: Int!
    currentStreak: Int!
    rank: Int!
  }

  type LessonCompletionResult {
    success: Boolean!
    message: String!
    xpEarned: Int!
    diamondsEarned: Int!
    levelUpBonus: Int!
    newLevel: Int!
    newTotalXP: Int!
    newDiamonds: Int!
  }

  type UnitCompletionResult {
    success: Boolean!
    message: String!
    xpEarned: Int!
    diamondsEarned: Int!
    levelUpBonus: Int!
    newLevel: Int!
    newTotalXP: Int!
    newDiamonds: Int!
  }

  type HeartPurchaseResult {
    success: Boolean!
    message: String!
    heartsBought: Int!
    diamondsSpent: Int!
    newHearts: Int!
    newDiamonds: Int!
  }

  type HeartRefillResult {
    success: Boolean!
    message: String!
    heartsRefilled: Int!
    diamondsSpent: Int!
    newHearts: Int!
    newDiamonds: Int!
  }

  type PracticeRewardResult {
    success: Boolean!
    message: String!
    xpAwarded: Int!
    diamondsAwarded: Int!
    newTotalXP: Int!
    newDiamonds: Int!
  }

  extend type Query {
    # Get user gamification stats
    gamificationStats: GamificationStats!
    
    # Get leaderboard
    leaderboard(limit: Int): [LeaderboardEntry!]!
  }

  extend type Mutation {
    # Complete lesson
    completeLesson(lessonId: ID!, score: Int): LessonCompletionResult!
    
    # Complete unit
    completeUnit(unitId: ID!, score: Int): UnitCompletionResult!
    
    # Buy hearts with diamonds
    buyHearts(heartCount: Int!): HeartPurchaseResult!
    
    # Refill hearts with diamonds (instant)
    refillHearts: HeartRefillResult!
    
    # Use heart (for wrong answers)
    useHeart: GamificationStats!
    
    # Award practice rewards
    awardPracticeRewards(xp: Int!, diamonds: Int!): PracticeRewardResult!
  }
`;

// ===============================================
// RESOLVERS
// ===============================================

export const gamificationResolvers = {
  Query: {
    // Get user gamification stats
    gamificationStats: async (_, __, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const userData = await db.users.findById(user.userId);
        if (!userData) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Calculate hearts refill time
        let heartsRefillTime = null;
        if (userData.hearts < 5 && !userData.isPremium) {
          const lastHeartLoss = userData.updatedAt || new Date();
          const refillTime = new Date(lastHeartLoss.getTime() + 30 * 60 * 1000); // 30 minutes
          heartsRefillTime = refillTime.toISOString();
        }

        return {
          level: userData.level || 1,
          totalXP: userData.totalXP || 0,
          diamonds: userData.diamonds || 0,
          hearts: userData.hearts || 5,
          currentStreak: userData.currentStreak || 0,
          longestStreak: userData.longestStreak || 0,
          isPremium: userData.isPremium || false,
          heartsRefillTime
        };
      } catch (error) {
        console.error('❌ Error getting gamification stats:', error.message);
        throw new GraphQLError('Failed to get gamification stats', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Get leaderboard
    leaderboard: async (_, { limit = 50 }) => {
      try {
        const users = await db.users.getLeaderboard(limit);
        
        return users.map((user, index) => ({
          id: user._id,
          username: user.username,
          displayName: user.displayName,
          totalXP: user.totalXP || 0,
          level: user.level || 1,
          diamonds: user.diamonds || 0,
          currentStreak: user.currentStreak || 0,
          rank: index + 1
        }));
      } catch (error) {
        console.error('❌ Error getting leaderboard:', error.message);
        throw new GraphQLError('Failed to get leaderboard', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  },

  Mutation: {
    // Complete lesson
    completeLesson: async (_, { lessonId, score = 0 }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        console.log('🔧 [completeLesson] User context:', { userId: user.userId, lessonId, score });
        
        // Get the user's current level before the update
        const currentUser = await db.users.findById(user.userId);
        if (!currentUser) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        
        const oldLevel = currentUser.level;
        const oldTotalXP = currentUser.totalXP;
        
        const userData = await db.users.completeLesson(user.userId, lessonId, score);
        if (!userData) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const xpEarned = 5;
        const diamondsEarned = 10;
        const levelUpBonus = userData.level > oldLevel ? (userData.level - oldLevel) * 50 : 0;
        
        console.log('🔧 [completeLesson] Level calculation:', {
          oldLevel,
          newLevel: userData.level,
          levelUpBonus
        });

        console.log('✅ [completeLesson] Success result:', {
          xpEarned,
          diamondsEarned,
          levelUpBonus,
          newLevel: userData.level,
          newTotalXP: userData.totalXP,
          newDiamonds: userData.diamonds
        });
        
        return {
          success: true,
          message: 'Lesson completed successfully!',
          xpEarned,
          diamondsEarned,
          levelUpBonus,
          newLevel: userData.level,
          newTotalXP: userData.totalXP,
          newDiamonds: userData.diamonds
        };
      } catch (error) {
        console.error('❌ Error completing lesson:', error.message);
        throw new GraphQLError('Failed to complete lesson', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Complete unit
    completeUnit: async (_, { unitId, score = 0 }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        // Get the user's current level before the update
        const currentUser = await db.users.findById(user.userId);
        if (!currentUser) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        
        const oldLevel = currentUser.level;
        
        const userData = await db.users.completeUnit(user.userId, unitId, score);
        if (!userData) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const xpEarned = 20;
        const diamondsEarned = 50;
        const levelUpBonus = userData.level > oldLevel ? (userData.level - oldLevel) * 50 : 0;

        return {
          success: true,
          message: 'Unit completed successfully!',
          xpEarned,
          diamondsEarned,
          levelUpBonus,
          newLevel: userData.level,
          newTotalXP: userData.totalXP,
          newDiamonds: userData.diamonds
        };
      } catch (error) {
        console.error('❌ Error completing unit:', error.message);
        throw new GraphQLError('Failed to complete unit', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Buy hearts with diamonds
    buyHearts: async (_, { heartCount = 1 }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const userData = await db.users.buyHearts(user.userId, heartCount);
        if (!userData) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const diamondCost = heartCount * 20;

        return {
          success: true,
          message: `Successfully bought ${heartCount} hearts!`,
          heartsBought: heartCount,
          diamondsSpent: diamondCost,
          newHearts: userData.hearts,
          newDiamonds: userData.diamonds
        };
      } catch (error) {
        console.error('❌ Error buying hearts:', error.message);
        if (error.message === 'Insufficient diamonds') {
          throw new GraphQLError('Insufficient diamonds', {
            extensions: { code: 'INSUFFICIENT_DIAMONDS' }
          });
        }
        throw new GraphQLError('Failed to buy hearts', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Refill hearts with diamonds
    refillHearts: async (_, __, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const userData = await db.users.refillHearts(user.userId);
        if (!userData) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        const heartsRefilled = 5 - (userData.hearts - 5); // Calculate how many were refilled
        const diamondCost = heartsRefilled * 10;

        return {
          success: true,
          message: `Successfully refilled ${heartsRefilled} hearts!`,
          heartsRefilled,
          diamondsSpent: diamondCost,
          newHearts: userData.hearts,
          newDiamonds: userData.diamonds
        };
      } catch (error) {
        console.error('❌ Error refilling hearts:', error.message);
        if (error.message === 'Insufficient diamonds') {
          throw new GraphQLError('Insufficient diamonds', {
            extensions: { code: 'INSUFFICIENT_DIAMONDS' }
          });
        }
        throw new GraphQLError('Failed to refill hearts', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Use heart
    useHeart: async (_, __, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        const userData = await db.users.useHeart(user.userId);
        if (!userData) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        // Calculate hearts refill time
        let heartsRefillTime = null;
        if (userData.hearts < 5 && !userData.isPremium) {
          const lastHeartLoss = userData.updatedAt || new Date();
          const refillTime = new Date(lastHeartLoss.getTime() + 30 * 60 * 1000); // 30 minutes
          heartsRefillTime = refillTime.toISOString();
        }

        return {
          level: userData.level || 1,
          totalXP: userData.totalXP || 0,
          diamonds: userData.diamonds || 0,
          hearts: userData.hearts || 5,
          currentStreak: userData.currentStreak || 0,
          longestStreak: userData.longestStreak || 0,
          isPremium: userData.isPremium || false,
          heartsRefillTime
        };
      } catch (error) {
        console.error('❌ Error using heart:', error.message);
        throw new GraphQLError('Failed to use heart', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    // Award practice rewards
    awardPracticeRewards: async (_, { xp, diamonds }, { user }) => {
      try {
        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHENTICATED' }
          });
        }

        console.log('🎁 Awarding practice rewards:', { xp, diamonds, userId: user.userId });

        // Update user's XP and diamonds
        const userData = await User.findByIdAndUpdate(
          user.userId,
          {
            $inc: {
              totalXP: xp,
              diamonds: diamonds
            }
          },
          { new: true }
        );

        if (!userData) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        console.log('✅ Practice rewards awarded successfully');

        return {
          success: true,
          message: `Successfully awarded ${xp} XP and ${diamonds} diamonds for practice completion!`,
          xpAwarded: xp,
          diamondsAwarded: diamonds,
          newTotalXP: userData.totalXP,
          newDiamonds: userData.diamonds
        };
      } catch (error) {
        console.error('❌ Error awarding practice rewards:', error.message);
        throw new GraphQLError('Failed to award practice rewards', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  }
}; 