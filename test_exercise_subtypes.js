// ===============================================
// TEST SCRIPT FOR 28 EXERCISE SUBTYPES
// ===============================================

import fetch from 'node-fetch';

const GRAPHQL_URL = 'http://localhost:4001/graphql';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZjOGUwN2YxY2NkYWMwMDg5YjNhYzgiLCJpYXQiOjE3NTM2NzcwMTUsImV4cCI6MTc1NDI4MTgxNX0.z-BKzLyfw3vAk_1DiFHXdEOgZzUxBGLa_mTvVujPmWo';

// Define all 28 exercise subtypes with their base types
const EXERCISE_SUBTYPES = [
  // Multiple Choice subtypes (4)
  { type: 'multiple_choice', subtype: 'vocabulary_multiple_choice', skill: 'vocabulary' },
  { type: 'multiple_choice', subtype: 'grammar_multiple_choice', skill: 'grammar' },
  { type: 'multiple_choice', subtype: 'listening_multiple_choice', skill: 'listening' },
  { type: 'multiple_choice', subtype: 'pronunciation_multiple_choice', skill: 'pronunciation' },
  
  // Fill Blank subtypes (4)
  { type: 'fill_blank', subtype: 'vocabulary_fill_blank', skill: 'vocabulary' },
  { type: 'fill_blank', subtype: 'grammar_fill_blank', skill: 'grammar' },
  { type: 'fill_blank', subtype: 'listening_fill_blank', skill: 'listening' },
  { type: 'fill_blank', subtype: 'writing_fill_blank', skill: 'writing' },
  
  // Translation subtypes (3)
  { type: 'translation', subtype: 'vocabulary_translation', skill: 'vocabulary' },
  { type: 'translation', subtype: 'grammar_translation', skill: 'grammar' },
  { type: 'translation', subtype: 'writing_translation', skill: 'writing' },
  
  // Word Matching subtypes (1)
  { type: 'word_matching', subtype: 'vocabulary_word_matching', skill: 'vocabulary' },
  
  // Listening subtypes (3)
  { type: 'listening', subtype: 'vocabulary_listening', skill: 'vocabulary' },
  { type: 'listening', subtype: 'grammar_listening', skill: 'grammar' },
  { type: 'listening', subtype: 'pronunciation_listening', skill: 'pronunciation' },
  
  // Speaking subtypes (3)
  { type: 'speaking', subtype: 'vocabulary_speaking', skill: 'vocabulary' },
  { type: 'speaking', subtype: 'grammar_speaking', skill: 'grammar' },
  { type: 'speaking', subtype: 'pronunciation_speaking', skill: 'pronunciation' },
  
  // Reading subtypes (3)
  { type: 'reading', subtype: 'vocabulary_reading', skill: 'vocabulary' },
  { type: 'reading', subtype: 'grammar_reading', skill: 'grammar' },
  { type: 'reading', subtype: 'comprehension_reading', skill: 'reading' },
  
  // Writing subtypes (3)
  { type: 'writing', subtype: 'vocabulary_writing', skill: 'vocabulary' },
  { type: 'writing', subtype: 'grammar_writing', skill: 'grammar' },
  { type: 'writing', subtype: 'sentence_writing', skill: 'writing' },
  
  // True/False subtypes (3)
  { type: 'true_false', subtype: 'vocabulary_true_false', skill: 'vocabulary' },
  { type: 'true_false', subtype: 'grammar_true_false', skill: 'grammar' },
  { type: 'true_false', subtype: 'listening_true_false', skill: 'listening' },
  
  // Drag & Drop subtypes (3)
  { type: 'drag_drop', subtype: 'vocabulary_drag_drop', skill: 'vocabulary' },
  { type: 'drag_drop', subtype: 'grammar_drag_drop', skill: 'grammar' },
  { type: 'drag_drop', subtype: 'writing_drag_drop', skill: 'writing' }
];

// Test context for different skills
const getTestContext = (skill) => {
  const baseContext = {
    word: 'hello',
    meaning: 'xin chào',
    lesson_context: 'greetings',
    situation: 'formal',
    user_level: 'beginner'
  };
  
  // Add skill-specific context
  switch (skill) {
    case 'grammar':
      return {
        ...baseContext,
        word: 'is',
        meaning: 'thì, là',
        lesson_context: 'present tense',
        skill_focus: ['grammar']
      };
    case 'listening':
      return {
        ...baseContext,
        word: 'listen',
        meaning: 'nghe',
        lesson_context: 'audio comprehension',
        skill_focus: ['listening']
      };
    case 'pronunciation':
      return {
        ...baseContext,
        word: 'pronunciation',
        meaning: 'phát âm',
        lesson_context: 'sound practice',
        skill_focus: ['pronunciation']
      };
    case 'reading':
      return {
        ...baseContext,
        word: 'read',
        meaning: 'đọc',
        lesson_context: 'text comprehension',
        skill_focus: ['reading']
      };
    case 'writing':
      return {
        ...baseContext,
        word: 'write',
        meaning: 'viết',
        lesson_context: 'sentence construction',
        skill_focus: ['writing']
      };
    default:
      return {
        ...baseContext,
        skill_focus: ['vocabulary']
      };
  }
};

// Test a single exercise subtype
async function testExerciseSubtype(exerciseConfig) {
  const { type, subtype, skill } = exerciseConfig;
  const context = getTestContext(skill);
  
  const query = `
    query {
      generateExercise(
        type: "${type}", 
        context: {
          word: "${context.word}",
          meaning: "${context.meaning}",
          lesson_context: "${context.lesson_context}",
          situation: "${context.situation}",
          user_level: "${context.user_level}",
          skill_focus: ${JSON.stringify(context.skill_focus)}
        }
      ) {
        type
        exercise_subtype
        content
        vocabulary {
          word
          meaning
        }
        sortOrder
        audioUrl
      }
    }
  `;
  
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      return {
        subtype,
        status: 'ERROR',
        error: result.errors[0].message,
        data: null
      };
    }
    
    const exercise = result.data.generateExercise;
    
    // Validate the response
    const validation = validateExerciseResponse(exercise, subtype);
    
    return {
      subtype,
      status: validation.valid ? 'SUCCESS' : 'INVALID',
      error: validation.error,
      data: exercise,
      validation
    };
    
  } catch (error) {
    return {
      subtype,
      status: 'ERROR',
      error: error.message,
      data: null
    };
  }
}

// Validate exercise response
function validateExerciseResponse(exercise, expectedSubtype) {
  // Check basic fields
  if (!exercise.type) {
    return { valid: false, error: 'Missing type field' };
  }
  
  if (!exercise.exercise_subtype) {
    return { valid: false, error: 'Missing exercise_subtype field' };
  }
  
  if (exercise.exercise_subtype !== expectedSubtype) {
    return { 
      valid: false, 
      error: `Subtype mismatch: expected ${expectedSubtype}, got ${exercise.exercise_subtype}` 
    };
  }
  
  if (!exercise.content) {
    return { valid: false, error: 'Missing content field' };
  }
  
  // Try to parse content JSON
  try {
    const content = JSON.parse(exercise.content);
    
    // Basic content validation based on type
    const baseType = exercise.type;
    switch (baseType) {
      case 'multiple_choice':
        if (!content.question || !content.options || content.correctAnswer === undefined) {
          return { valid: false, error: 'Invalid multiple choice content structure' };
        }
        break;
      case 'fill_blank':
        if (!content.sentence || !content.correctAnswer) {
          return { valid: false, error: 'Invalid fill blank content structure' };
        }
        break;
      case 'translation':
        if (!content.sentence || !content.correctAnswer) {
          return { valid: false, error: 'Invalid translation content structure' };
        }
        break;
      case 'word_matching':
        if (!content.pairs) {
          return { valid: false, error: 'Invalid word matching content structure' };
        }
        break;
      case 'listening':
        if (!content.audioText || !content.question) {
          return { valid: false, error: 'Invalid listening content structure' };
        }
        break;
      case 'speaking':
        if (!content.textToSpeak) {
          return { valid: false, error: 'Invalid speaking content structure' };
        }
        break;
      case 'reading':
        if (!content.text || !content.question) {
          return { valid: false, error: 'Invalid reading content structure' };
        }
        break;
      case 'writing':
        if (!content.prompt) {
          return { valid: false, error: 'Invalid writing content structure' };
        }
        break;
      case 'true_false':
        if (!content.statement || content.isCorrect === undefined) {
          return { valid: false, error: 'Invalid true/false content structure' };
        }
        break;
      case 'drag_drop':
        if (!content.items || !content.targets) {
          return { valid: false, error: 'Invalid drag & drop content structure' };
        }
        break;
    }
    
    return { valid: true, content };
    
  } catch (error) {
    return { valid: false, error: `Invalid JSON content: ${error.message}` };
  }
}

// Main test function
async function runAllTests() {
  console.log('🧪 TESTING 28 EXERCISE SUBTYPES');
  console.log('================================');
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  let invalidCount = 0;
  
  for (const exerciseConfig of EXERCISE_SUBTYPES) {
    console.log(`\n🔍 Testing: ${exerciseConfig.subtype}`);
    
    const result = await testExerciseSubtype(exerciseConfig);
    results.push(result);
    
    switch (result.status) {
      case 'SUCCESS':
        console.log(`✅ ${result.subtype} - SUCCESS`);
        successCount++;
        break;
      case 'INVALID':
        console.log(`⚠️  ${result.subtype} - INVALID: ${result.error}`);
        invalidCount++;
        break;
      case 'ERROR':
        console.log(`❌ ${result.subtype} - ERROR: ${result.error}`);
        errorCount++;
        break;
    }
    
    // Add delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('===============');
  console.log(`✅ Success: ${successCount}/28`);
  console.log(`⚠️  Invalid: ${invalidCount}/28`);
  console.log(`❌ Error: ${errorCount}/28`);
  
  // Show detailed results for failed tests
  const failedTests = results.filter(r => r.status !== 'SUCCESS');
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`\n${test.subtype}:`);
      console.log(`  Status: ${test.status}`);
      console.log(`  Error: ${test.error}`);
      if (test.data) {
        console.log(`  Data: ${JSON.stringify(test.data, null, 2)}`);
      }
    });
  }
  
  // Show sample successful responses
  const successfulTests = results.filter(r => r.status === 'SUCCESS');
  if (successfulTests.length > 0) {
    console.log('\n✅ SAMPLE SUCCESSFUL RESPONSES:');
    successfulTests.slice(0, 3).forEach(test => {
      console.log(`\n${test.subtype}:`);
      console.log(JSON.stringify(test.data, null, 2));
    });
  }
  
  return results;
}

// Run the tests
runAllTests().catch(console.error); 