// ===============================================
// FIREBASE SERVICE - AUDIO STORAGE MANAGEMENT
// ===============================================

import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// ===============================================
// FIREBASE INITIALIZATION
// ===============================================

let firebaseApp;
let storage;
let auth;

try {
  // Initialize Firebase Admin
  const serviceAccountPath = path.join(process.cwd(), 'google-credentials-firebase.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.warn('⚠️ google-credentials-firebase.json not found. Please setup Firebase credentials.');
  } else {
    firebaseApp = initializeApp({
      credential: cert(serviceAccountPath),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'lingualeap-ed012.firebasestorage.app'
    });
    
    storage = getStorage(firebaseApp);
    auth = getAuth(firebaseApp);
    
    console.log('✅ Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}

// ===============================================
// AUDIO STORAGE FUNCTIONS
// ===============================================

export class FirebaseService {
  
  // Upload audio file to Firebase Storage
  static async uploadAudioFile(audioBuffer, filename, folder = 'exercises') {
    try {
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }
      
      const bucket = storage.bucket();
      const filePath = `audio/${folder}/${filename}`;
      const file = bucket.file(filePath);
      
      // Upload buffer to Firebase
      await file.save(audioBuffer, {
        metadata: {
          contentType: 'audio/mpeg',
          cacheControl: 'public, max-age=31536000', // 1 year cache
        }
      });
      
      // Make file publicly accessible
      await file.makePublic();
      
      // Set CORS headers for web access
      await file.setMetadata({
        metadata: {
          contentType: 'audio/mpeg',
          cacheControl: 'public, max-age=31536000',
        }
      });
      
      // Set bucket CORS configuration
      try {
        await bucket.setCorsConfiguration([{
          origin: ['*'],
          method: ['GET', 'HEAD', 'OPTIONS'],
          responseHeader: ['Content-Type', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'],
          maxAgeSeconds: 3600
        }]);
      } catch (corsError) {
        console.warn('⚠️ CORS configuration warning:', corsError.message);
      }
      
      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      
      console.log('✅ Audio uploaded to Firebase:', publicUrl);
      return {
        url: publicUrl,
        path: filePath,
        filename: filename
      };
      
    } catch (error) {
      console.error('❌ Firebase upload error:', error.message);
      console.log('🔄 Falling back to local storage...');
      
      // Fallback to local storage
      const uploadsDir = path.join(process.cwd(), 'uploads', 'audio', folder);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const localPath = path.join(uploadsDir, filename);
      fs.writeFileSync(localPath, audioBuffer, 'binary');

      const localUrl = `/uploads/audio/${folder}/${filename}`;
      console.log('💾 Audio saved locally:', localUrl);
      
      return {
        url: localUrl,
        path: localPath,
        filename: filename
      };
    }
  }
  
  // Upload audio from local file
  static async uploadAudioFromFile(filePath, filename, folder = 'exercises') {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const audioBuffer = fs.readFileSync(filePath);
      return await this.uploadAudioFile(audioBuffer, filename, folder);
      
    } catch (error) {
      console.error('❌ Upload from file error:', error.message);
      throw error;
    }
  }
  
  // Delete audio file from Firebase Storage
  static async deleteAudioFile(filePath) {
    try {
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }
      
      const bucket = storage.bucket();
      const file = bucket.file(filePath);
      
      await file.delete();
      console.log('✅ Audio file deleted:', filePath);
      
    } catch (error) {
      console.error('❌ Delete file error:', error.message);
      throw error;
    }
  }
  
  // Get audio file URL
  static getAudioUrl(filePath) {
    if (!process.env.FIREBASE_STORAGE_BUCKET) {
      throw new Error('Firebase Storage bucket not configured');
    }
    
    return `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${filePath}`;
  }
  
  // List audio files in folder
  static async listAudioFiles(folder = 'exercises') {
    try {
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }
      
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({
        prefix: `audio/${folder}/`
      });
      
      return files.map(file => ({
        name: file.name,
        url: this.getAudioUrl(file.name),
        size: file.metadata.size,
        createdAt: file.metadata.timeCreated
      }));
      
    } catch (error) {
      console.error('❌ List files error:', error.message);
      throw error;
    }
  }
  
  // Generate unique filename
  static generateAudioFilename(exerciseType, exerciseId, extension = 'mp3') {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    return `${exerciseType}_${exerciseId}_${timestamp}_${randomId}.${extension}`;
  }
  
  // Check if Firebase is initialized
  static isInitialized() {
    return !!storage;
  }
}

// ===============================================
// AUDIO FOLDER STRUCTURE
// ===============================================

export const AUDIO_FOLDERS = {
  EXERCISES: 'exercises',
  LISTENING: 'exercises/listening',
  SPEAK_REPEAT: 'exercises/speak_repeat',
  LISTEN_CHOOSE: 'exercises/listen_choose',
  VOCABULARY: 'vocabulary',
  LESSONS: 'lessons'
};

// ===============================================
// AUDIO FILE VALIDATION
// ===============================================

export const validateAudioFile = (file) => {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/aac'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid audio file type. Only MP3, WAV, AAC allowed.');
  }
  
  if (file.size > maxSize) {
    throw new Error('Audio file too large. Maximum 10MB allowed.');
  }
  
  return true;
}; 