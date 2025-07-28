// ===============================================
// AUTHENTICATION MIDDLEWARE - LINGUALEAP
// ===============================================

import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

// ===============================================
// AUTHENTICATION MIDDLEWARE
// ===============================================

export const authenticateUser = async (req) => {
  try {
    console.log('🔍 authenticateUser called');
    console.log('🔍 All headers:', req.headers);
    
    // Try different ways to get authorization header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || req.headers.authorization || req.headers.Authorization;
    console.log('🔍 authHeader:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 No Bearer token found');
      return null;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 Extracted token:', token.substring(0, 50) + '...');
    
    if (!token) {
      console.log('🔍 Empty token');
      return null;
    }
    
    console.log('🔍 JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Decoded token:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return null;
  }
};

// ===============================================
// ADMIN AUTHORIZATION MIDDLEWARE
// ===============================================

export const requireAdmin = async (parent, args, { db, user }) => {
  // Check if user is authenticated
  if (!user) {
    throw new GraphQLError('You must be logged in to access this resource', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  
  try {
    // Get current user from database
    const currentUser = await db.users.findById(user.userId);
    
    if (!currentUser) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'USER_NOT_FOUND' }
      });
    }
    
    // Check if user is admin
    if (currentUser.role !== 'admin') {
      throw new GraphQLError('Admin access required', {
        extensions: { code: 'FORBIDDEN' }
      });
    }
    
    return currentUser;
  } catch (error) {
    console.error('❌ Admin authorization error:', error.message);
    
    if (error instanceof GraphQLError) {
      throw error;
    }
    
    throw new GraphQLError('Authorization failed', {
      extensions: { code: 'AUTHORIZATION_ERROR' }
    });
  }
};

// ===============================================
// USER AUTHORIZATION MIDDLEWARE
// ===============================================

export const requireUser = async (parent, args, { db, user }) => {
  // Check if user is authenticated
  if (!user) {
    throw new GraphQLError('You must be logged in to access this resource', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  
  try {
    // Get current user from database
    const currentUser = await db.users.findById(user.userId);
    
    if (!currentUser) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'USER_NOT_FOUND' }
      });
    }
    
    // Check if user is active
    if (!currentUser.isActive) {
      throw new GraphQLError('Your account has been deactivated', {
        extensions: { code: 'ACCOUNT_DEACTIVATED' }
      });
    }
    
    return currentUser;
  } catch (error) {
    console.error('❌ User authorization error:', error.message);
    
    if (error instanceof GraphQLError) {
      throw error;
    }
    
    throw new GraphQLError('Authorization failed', {
      extensions: { code: 'AUTHORIZATION_ERROR' }
    });
  }
};

// ===============================================
// OPTIONAL USER MIDDLEWARE (for public queries)
// ===============================================

export const optionalUser = async (parent, args, { db, user }) => {
  if (!user) {
    return null;
  }
  
  try {
    const currentUser = await db.users.findById(user.userId);
    return currentUser?.isActive ? currentUser : null;
  } catch (error) {
    console.error('❌ Optional user error:', error.message);
    return null;
  }
};