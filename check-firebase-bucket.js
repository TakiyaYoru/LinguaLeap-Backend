// Check Firebase bucket configuration
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

console.log('🔍 Checking Firebase bucket configuration...\n');

try {
  // Load service account
  const serviceAccountPath = path.join(process.cwd(), 'google-credentials-firebase.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ google-credentials-firebase.json not found!');
    process.exit(1);
  }
  
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  console.log('✅ Service account loaded');
  console.log(`📁 Project ID: ${serviceAccount.project_id}`);
  
  // Try different bucket names
  const possibleBuckets = [
    `${serviceAccount.project_id}.appspot.com`,
    `${serviceAccount.project_id}-default-rtdb.appspot.com`,
    `${serviceAccount.project_id}-storage.appspot.com`
  ];
  
  console.log('\n🔍 Possible bucket names:');
  possibleBuckets.forEach((bucket, index) => {
    console.log(`   ${index + 1}. ${bucket}`);
  });
  
  // Initialize Firebase
  const firebaseApp = initializeApp({
    credential: cert(serviceAccountPath),
    storageBucket: possibleBuckets[0] // Try first one
  });
  
  const storage = getStorage(firebaseApp);
  console.log('\n✅ Firebase initialized successfully');
  
  // Test bucket access
  console.log('\n🧪 Testing bucket access...');
  for (const bucketName of possibleBuckets) {
    try {
      const bucket = storage.bucket(bucketName);
      const [exists] = await bucket.exists();
      
      if (exists) {
        console.log(`✅ Bucket exists: ${bucketName}`);
        console.log(`🎯 Use this bucket name in your configuration!`);
        break;
      } else {
        console.log(`❌ Bucket does not exist: ${bucketName}`);
      }
    } catch (error) {
      console.log(`❌ Error checking bucket ${bucketName}: ${error.message}`);
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Solutions:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Go to Storage section');
  console.log('4. Create a new bucket if needed');
  console.log('5. Update the bucket name in your configuration');
} 