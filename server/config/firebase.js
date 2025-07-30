import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const FIREBASE_CONFIG = {
  projectId: 'lingualeap-ed012',
  storageBucket: 'lingualeap-ed012.firebasestorage.app',
  credentialsPath: path.join(__dirname, '../../google-credentials-firebase.json')
};

// Initialize Firebase Admin SDK
let firebaseApp = null;

export const initializeFirebase = () => {
  try {
    if (!firebaseApp) {
      const serviceAccount = require(FIREBASE_CONFIG.credentialsPath);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: FIREBASE_CONFIG.storageBucket
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
      console.log(`📁 Project ID: ${FIREBASE_CONFIG.projectId}`);
      console.log(`🪣 Storage Bucket: ${FIREBASE_CONFIG.storageBucket}`);
    }
    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    return null;
  }
};

export const getFirebaseApp = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

export const getFirebaseStorage = () => {
  const app = getFirebaseApp();
  if (app) {
    return app.storage();
  }
  return null;
};

export const getFirebaseBucket = () => {
  const storage = getFirebaseStorage();
  if (storage) {
    return storage.bucket();
  }
  return null;
};

export default {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseStorage,
  getFirebaseBucket,
  config: FIREBASE_CONFIG
}; 