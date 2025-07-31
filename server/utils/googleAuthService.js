// server/utils/googleAuthService.js - Google Auth Service for LinguaLeap

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google token (ID token hoặc access token) and extract user information
 * @param {string} token - Google token from frontend
 * @returns {Object} - Verified user information
 */
export async function verifyGoogleToken(token) {
  try {
    console.log('🔍 [GoogleAuth] Verifying Google token...');
    console.log('🔍 [GoogleAuth] Token type check:', token.includes('.') ? 'JWT (ID token)' : 'Access token');
    
    // Check if token is JWT format (ID token) or access token
    if (token.includes('.') && token.split('.').length === 3) {
      // This is likely an ID token (JWT format)
      return await verifyIDToken(token);
    } else {
      // This is likely an access token
      return await verifyAccessToken(token);
    }
    
  } catch (error) {
    console.error('❌ [GoogleAuth] Google token verification failed:', error.message);
    throw new Error('Invalid Google token');
  }
}

/**
 * Verify Google ID Token (JWT)
 */
async function verifyIDToken(idToken) {
  try {
    console.log('🔍 [GoogleAuth] Verifying ID token with Google Auth Library...');
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    console.log('✅ [GoogleAuth] ID token verified successfully');
    
    return extractUserInfoFromPayload(payload);
  } catch (error) {
    console.error('❌ [GoogleAuth] ID token verification failed:', error.message);
    throw error;
  }
}

/**
 * Verify Google Access Token
 */
async function verifyAccessToken(accessToken) {
  try {
    console.log('🔍 [GoogleAuth] Verifying access token by calling Google API...');
    
    // Get user info using access token
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }
    
    const userInfo = await response.json();
    console.log('✅ [GoogleAuth] Access token verified successfully');
    console.log('📧 [GoogleAuth] Email:', userInfo.email);
    console.log('👤 [GoogleAuth] Name:', userInfo.name);
    
    // Convert Google API response to our expected format
    return {
      googleId: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.given_name || '',
      lastName: userInfo.family_name || '',
      fullName: userInfo.name,
      avatar: userInfo.picture,
      isEmailVerified: userInfo.verified_email || false
    };
    
  } catch (error) {
    console.error('❌ [GoogleAuth] Access token verification failed:', error.message);
    throw error;
  }
}

/**
 * Extract user info from ID token payload
 */
function extractUserInfoFromPayload(payload) {
  return {
    googleId: payload.sub,
    email: payload.email,
    firstName: payload.given_name || '',
    lastName: payload.family_name || '',
    fullName: payload.name,
    avatar: payload.picture,
    isEmailVerified: payload.email_verified || false
  };
}

/**
 * Generate username from email (unique fallback)
 * @param {string} email 
 * @returns {string} - Generated username
 */
export function generateUsernameFromEmail(email) {
  const baseName = email.split('@')[0];
  const timestamp = Date.now().toString().slice(-4);
  return `${baseName}_${timestamp}`;
}

/**
 * Generate display name from Google user info
 * @param {Object} googleUserInfo 
 * @returns {string} - Generated display name
 */
export function generateDisplayName(googleUserInfo) {
  if (googleUserInfo.fullName) {
    return googleUserInfo.fullName;
  }
  
  const firstName = googleUserInfo.firstName || '';
  const lastName = googleUserInfo.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  }
  
  // Fallback to email username
  return googleUserInfo.email.split('@')[0];
} 