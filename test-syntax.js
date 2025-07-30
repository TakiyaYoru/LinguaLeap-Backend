// Test syntax của aiService.js
console.log('🧪 Testing aiService.js syntax...');

try {
  // Import aiService để kiểm tra syntax
  const aiService = await import('./server/utils/aiService.js');
  console.log('✅ aiService.js syntax is valid!');
  console.log('📝 Available methods:', Object.keys(aiService.default));
} catch (error) {
  console.error('❌ Syntax error in aiService.js:', error.message);
  process.exit(1);
}

console.log('🎉 All syntax tests passed!'); 