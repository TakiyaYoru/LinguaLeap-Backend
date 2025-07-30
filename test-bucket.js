// Test bucket name
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

dotenv.config();

console.log('🔍 Testing bucket configuration...\n');

// Check environment variables
console.log('📋 Environment variables:');
console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET);
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

// Load service account
const serviceAccountPath = path.join(process.cwd(), 'google-credentials-firebase.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

console.log('\n📁 Service account project_id:', serviceAccount.project_id);

// Try different bucket names
const possibleBuckets = [
  'lingualeap-ed012.firebasestorage.app',
  'lingualeap-ed012.appspot.com',
  `${serviceAccount.project_id}.firebasestorage.app`,
  `${serviceAccount.project_id}.appspot.com`
];

console.log('\n🔍 Testing bucket names:');

for (const bucketName of possibleBuckets) {
  try {
    console.log(`\n🧪 Testing: ${bucketName}`);
    
    // Initialize Firebase with this bucket
    const firebaseApp = initializeApp({
      credential: cert(serviceAccountPath),
      storageBucket: bucketName
    });
    
    const storage = getStorage(firebaseApp);
    const bucket = storage.bucket();
    
    // Test if bucket exists
    const [exists] = await bucket.exists();
    
    if (exists) {
      console.log(`✅ SUCCESS: ${bucketName} exists!`);
      console.log(`🎯 Use this bucket name: ${bucketName}`);
      break;
    } else {
      console.log(`❌ Bucket does not exist: ${bucketName}`);
    }
    
  } catch (error) {
    console.log(`❌ Error with ${bucketName}:`, error.message);
  }
} 