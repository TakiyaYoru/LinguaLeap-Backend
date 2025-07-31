// ===============================================
// AUTHENTICATION GRAPHQL RESOLVERS - LINGUALEAP
// ===============================================

import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { verifyGoogleToken, generateUsernameFromEmail, generateDisplayName } from '../utils/googleAuthService.js';

// ===============================================
// TYPE DEFINITIONS
// ===============================================

export const authTypeDefs = `
  type User {
    id: ID!
    username: String!
    email: String!
    displayName: String!
    avatar: String
    bio: String
    currentLevel: String!
    level: Int!
    totalXP: Int!
    diamonds: Int!
    hearts: Int!
    currentStreak: Int!
    longestStreak: Int!
    subscriptionType: String!
    isPremium: Boolean!
    dailyGoal: Int!
    isEmailVerified: Boolean!
    isActive: Boolean!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    displayName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    displayName: String
    email: String
    bio: String
    avatarUrl: String
  }

  type UpdateProfilePayload {
    success: Boolean!
    message: String!
    user: User
  }

  # Google Auth types
  input GoogleAuthInput {
    token: String!
  }

  type GoogleAuthResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  extend type Query {
    # Get current user profile
    me: User
  }

  extend type Mutation {
    # Register new user
    register(input: RegisterInput!): AuthPayload!
    
    # Login user
    login(input: LoginInput!): AuthPayload!
    
    # Update user profile
    updateProfile(input: UpdateProfileInput!): UpdateProfilePayload!
    
    # Google authentication
    googleAuth(input: GoogleAuthInput!): GoogleAuthResponse!
  }
`;

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const validateRegisterInput = (input) => {
  const errors = [];
  
  // Username validation
  if (!input.username || input.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if (input.username && input.username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email)) {
    errors.push('Please provide a valid email address');
  }
  
  // Password validation
  if (!input.password || input.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Display name validation
  if (!input.displayName || input.displayName.trim().length < 2) {
    errors.push('Display name must be at least 2 characters long');
  }
  
  return errors;
};

// ===============================================
// RESOLVERS
// ===============================================

export const authResolvers = {
  Query: {
    me: async (parent, args, { db, user }) => {
      // Check if user is authenticated
      if (!user) {
        throw new GraphQLError('You must be logged in to access this resource', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      try {
        const currentUser = await db.users.findById(user.userId);
        
        if (!currentUser) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'USER_NOT_FOUND' }
          });
        }
        
        return currentUser;
      } catch (error) {
        console.error('❌ Error in me query:', error.message);
        throw new GraphQLError('Failed to fetch user profile');
      }
    }
  },

  Mutation: {
    register: async (parent, { input }, { db }) => {
      try {
        console.log('📝 Register attempt for:', input.email);
        
        // Validate input
        const validationErrors = validateRegisterInput(input);
        if (validationErrors.length > 0) {
          throw new GraphQLError(`Validation failed: ${validationErrors.join(', ')}`, {
            extensions: { code: 'VALIDATION_ERROR' }
          });
        }

        // Check if user already exists
        const existingUserByEmail = await db.users.findByEmail(input.email);
        if (existingUserByEmail) {
          throw new GraphQLError('User with this email already exists', {
            extensions: { code: 'EMAIL_ALREADY_EXISTS' }
          });
        }

        const existingUserByUsername = await db.users.findByUsername(input.username);
        if (existingUserByUsername) {
          throw new GraphQLError('Username is already taken', {
            extensions: { code: 'USERNAME_ALREADY_EXISTS' }
          });
        }

        // Create new user
        const newUser = await db.users.create({
          username: input.username.trim(),
          email: input.email.toLowerCase().trim(),
          password: input.password,
          displayName: input.displayName.trim()
        });

        // Generate JWT token
        const token = generateToken(newUser.id);

        console.log('✅ User registered successfully:', newUser.id);

        return {
          token,
          user: newUser
        };
      } catch (error) {
        console.error('❌ Registration error:', error.message);
        
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0];
          throw new GraphQLError(`${field} is already taken`, {
            extensions: { code: 'DUPLICATE_KEY' }
          });
        }
        
        throw new GraphQLError('Registration failed. Please try again.');
      }
    },

    login: async (parent, { input }, { db }) => {
      try {
        console.log('📝 Login attempt for:', input.email);
        
        // Find user by email
        const user = await db.users.findByEmail(input.email);
        if (!user) {
          throw new GraphQLError('Invalid email or password', {
            extensions: { code: 'INVALID_CREDENTIALS' }
          });
        }

        // Check if account is active
        if (!user.isActive) {
          throw new GraphQLError('Your account has been deactivated', {
            extensions: { code: 'ACCOUNT_DEACTIVATED' }
          });
        }

        // Verify password
        const isValidPassword = await db.users.verifyPassword(input.password, user.password);
        if (!isValidPassword) {
          throw new GraphQLError('Invalid email or password', {
            extensions: { code: 'INVALID_CREDENTIALS' }
          });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Remove password from response
        const { password, ...userWithoutPassword } = user.toObject();

        console.log('✅ User logged in successfully:', user._id);

        return {
          token,
          user: userWithoutPassword
        };
      } catch (error) {
        console.error('❌ Login error:', error.message);
        
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        throw new GraphQLError('Login failed. Please try again.');
      }
    },

    updateProfile: async (parent, { input }, { db, user }) => {
      try {
        console.log('📝 Updating profile for user:', user?.id);
        console.log('📤 Update data:', input);

        if (!user) {
          throw new GraphQLError('Authentication required', {
            extensions: { code: 'UNAUTHORIZED' }
          });
        }

        // Validate input
        const updateData = {};
        
        if (input.displayName !== undefined) {
          if (!input.displayName || input.displayName.trim().length < 2) {
            throw new GraphQLError('Display name must be at least 2 characters long', {
              extensions: { code: 'INVALID_DISPLAY_NAME' }
            });
          }
          updateData.displayName = input.displayName.trim();
        }

        if (input.email !== undefined) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!input.email || !emailRegex.test(input.email)) {
            throw new GraphQLError('Please provide a valid email address', {
              extensions: { code: 'INVALID_EMAIL' }
            });
          }
          
          // Check if email is already taken by another user
          const existingUser = await db.users.findByEmail(input.email.toLowerCase().trim());
          if (existingUser && existingUser._id.toString() !== user.id) {
            throw new GraphQLError('Email is already taken by another user', {
              extensions: { code: 'EMAIL_ALREADY_EXISTS' }
            });
          }
          updateData.email = input.email.toLowerCase().trim();
        }

        if (input.bio !== undefined) {
          updateData.bio = input.bio?.trim() || '';
        }

        if (input.avatarUrl !== undefined) {
          updateData.avatar = input.avatarUrl?.trim() || '';
        }

        // Update user profile
        const updatedUser = await db.users.updateProfile(user.id, updateData);
        
        if (!updatedUser) {
          throw new GraphQLError('Failed to update profile', {
            extensions: { code: 'UPDATE_FAILED' }
          });
        }

        console.log('✅ Profile updated successfully for user:', user.id);

        return {
          success: true,
          message: 'Profile updated successfully',
          user: updatedUser
        };
      } catch (error) {
        console.error('❌ Update profile error:', error.message);
        
        if (error instanceof GraphQLError) {
          throw error;
        }
        
        return {
          success: false,
          message: 'Failed to update profile. Please try again.',
          user: null
        };
      }
    },

    googleAuth: async (parent, { input }, { db }) => {
      try {
        console.log('🔥 [GoogleAuth] Google Auth mutation called');
        const { token } = input;

        // Verify Google token
        const googleUserInfo = await verifyGoogleToken(token);
        console.log('📧 [GoogleAuth] Google user email:', googleUserInfo.email);

        // Check if user already exists by email
        let existingUser = await db.users.findByEmail(googleUserInfo.email);

        if (existingUser) {
          console.log('👤 [GoogleAuth] Existing user found, linking Google account...');
          
          // Link Google account to existing user
          const updateData = {
            googleId: googleUserInfo.googleId,
            isGoogleUser: true,
            avatar: googleUserInfo.avatar,
            isEmailVerified: true,
          };
          
          // Update display name if not set or if Google provides better info
          if (!existingUser.displayName || existingUser.displayName.trim().isEmpty) {
            updateData.displayName = generateDisplayName(googleUserInfo);
          }
          
          existingUser = await db.users.updateProfile(existingUser.id, updateData);
          console.log('✅ [GoogleAuth] Google account linked to existing user');
          
        } else {
          console.log('🆕 [GoogleAuth] Creating new user from Google account...');
          
          // Create new user from Google info
          const username = generateUsernameFromEmail(googleUserInfo.email);
          const displayName = generateDisplayName(googleUserInfo);
          
          const newUserData = {
            username,
            email: googleUserInfo.email,
            displayName,
            googleId: googleUserInfo.googleId,
            avatar: googleUserInfo.avatar,
            isGoogleUser: true,
            isEmailVerified: true,
            password: 'google_auth_' + Math.random().toString(36).substring(2), // Dummy password for Google users
          };
          
          existingUser = await db.users.create(newUserData);
          console.log('✅ [GoogleAuth] New Google user created');
        }

        // Generate JWT token
        const jwtToken = generateToken(existingUser.id);
        
        console.log('🎯 [GoogleAuth] Google Auth successful for user:', existingUser.id);

        return {
          success: true,
          message: 'Google authentication successful!',
          token: jwtToken,
          user: existingUser
        };

      } catch (error) {
        console.error('❌ [GoogleAuth] Google Auth error:', error);
        return {
          success: false,
          message: error.message || 'Google authentication failed',
          token: null,
          user: null
        };
      }
    }
  }
};