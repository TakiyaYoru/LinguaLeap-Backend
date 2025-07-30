// ===============================================
// FIREBASE TEST SCRIPT
// ===============================================

import { FirebaseService } from './server/utils/firebaseService.js';
import { TTSService } from './server/utils/ttsService.js';
import dotenv from 'dotenv';

dotenv.config();

async function testFirebaseIntegration() {
  console.log('🧪 Testing Firebase Integration...\n');
  
  try {
    // Test 1: Check Firebase initialization
    console.log('1️⃣ Testing Firebase initialization...');
    const isInitialized = FirebaseService.isInitialized();
    console.log(`Firebase initialized: ${isInitialized ? '✅' : '❌'}`);
    
    if (!isInitialized) {
      console.log('⚠️ Firebase not initialized. Please check:');
      console.log('   - google-credentials.json exists');
      console.log('   - FIREBASE_STORAGE_BUCKET in .env');
      console.log('   - Firebase project setup');
      return;
    }
    
    // Test 2: Generate test audio
    console.log('\n2️⃣ Testing TTS generation...');
    const testText = "Hello, this is a test audio for LinguaLeap listening exercise.";
    const audioBuffer = await TTSService.generateAudio(testText);
    console.log(`✅ Audio generated: ${audioBuffer.length} bytes`);
    
    // Test 3: Upload to Firebase
    console.log('\n3️⃣ Testing Firebase upload...');
    const filename = `test_${Date.now()}.mp3`;
    const result = await FirebaseService.uploadAudioFile(audioBuffer, filename, 'test');
    console.log(`✅ Audio uploaded: ${result.url}`);
    
    // Test 4: List files
    console.log('\n4️⃣ Testing file listing...');
    const files = await FirebaseService.listAudioFiles('test');
    console.log(`✅ Found ${files.length} files in test folder`);
    
    // Test 5: Cleanup
    console.log('\n5️⃣ Testing cleanup...');
    await FirebaseService.deleteAudioFile(result.path);
    console.log('✅ Test file deleted');
    
    console.log('\n🎉 All Firebase tests passed!');
    
  } catch (error) {
    console.error('\n❌ Firebase test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run test
testFirebaseIntegration(); 