// Test local storage for audio files
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Local Storage for Audio Files...\n');

try {
  // Create test audio directory
  const uploadsDir = path.join(process.cwd(), 'uploads', 'audio', 'exercises');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory:', uploadsDir);
  } else {
    console.log('✅ Uploads directory exists:', uploadsDir);
  }

  // Create test audio file (dummy data)
  const testFilename = `test_audio_${Date.now()}.mp3`;
  const testFilePath = path.join(uploadsDir, testFilename);
  
  // Create dummy audio data (just for testing)
  const dummyAudioData = Buffer.from('dummy audio data for testing');
  fs.writeFileSync(testFilePath, dummyAudioData);
  
  console.log('✅ Test audio file created:', testFilePath);
  console.log('📁 File size:', fs.statSync(testFilePath).size, 'bytes');
  
  // Test file access
  const testUrl = `/uploads/audio/exercises/${testFilename}`;
  console.log('🔗 Test URL:', testUrl);
  
  // Clean up test file
  fs.unlinkSync(testFilePath);
  console.log('🧹 Test file cleaned up');
  
  console.log('\n🎉 Local storage test passed!');
  console.log('💡 You can now use local storage for audio files while setting up Firebase');
  
} catch (error) {
  console.error('❌ Local storage test failed:', error.message);
} 