// ===============================================
// TEST SCRIPT FOR EXERCISE CRUD OPERATIONS
// ===============================================

import fetch from 'node-fetch';

const GRAPHQL_URL = 'http://localhost:4001/graphql';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODZjOGUwN2YxY2NkYWMwMDg5YjNhYzgiLCJpYXQiOjE3NTM2NzcwMTUsImV4cCI6MTc1NDI4MTgxNX0.z-BKzLyfw3vAk_1DiFHXdEOgZzUxBGLa_mTvVujPmWo';

// Test data for creating exercises
const testExerciseData = {
  type: 'multiple_choice',
  exercise_subtype: 'vocabulary_multiple_choice',
  title: 'Test Exercise - Chọn từ vựng',
  instruction: 'Chọn từ tiếng Anh đúng cho từ tiếng Việt',
  content: JSON.stringify({
    question: 'What is the English word for "cảm ơn"?',
    options: ['Thank you', 'Hello', 'Goodbye', 'Sorry'],
    correctAnswer: 0,
    feedback: {
      correct: 'Đúng rồi! "Thank you" có nghĩa là "cảm ơn"',
      incorrect: 'Sai rồi, thử lại!',
      hint: 'Đây là lời cảm ơn'
    }
  }),
  maxScore: 10,
  difficulty: 'beginner',
  xpReward: 5,
  timeLimit: 30,
  estimatedTime: 20,
  requiresAudio: false,
  requiresMicrophone: false,
  skillFocus: ['vocabulary']
};

// Helper function to make GraphQL requests
async function makeGraphQLRequest(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({ query, variables })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      return {
        success: false,
        error: result.errors[0].message,
        data: null
      };
    }
    
    return {
      success: true,
      error: null,
      data: result.data
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// Test functions
async function testGetExercises() {
  console.log('\n🔍 Testing: Get All Exercises');
  
  const query = `
    query {
      getExercises(page: 1, limit: 5) {
        success
        message
        exercises {
          _id
          type
          exercise_subtype
          title
          instruction
          maxScore
          difficulty
          isActive
          skillFocus
        }
        total
        page
        limit
      }
    }
  `;
  
  const result = await makeGraphQLRequest(query);
  
  if (result.success) {
    console.log('✅ Get Exercises - SUCCESS');
    console.log(`📊 Found ${result.data.getExercises.total} exercises`);
    console.log(`📄 Showing page ${result.data.getExercises.page} of ${result.data.getExercises.exercises.length} exercises`);
    
    result.data.getExercises.exercises.forEach((exercise, index) => {
      console.log(`  ${index + 1}. ${exercise.title} (${exercise.exercise_subtype})`);
    });
    
    return result.data.getExercises.exercises[0]?._id; // Return first exercise ID for other tests
  } else {
    console.log('❌ Get Exercises - ERROR:', result.error);
    return null;
  }
}

async function testGetExerciseSubtypes() {
  console.log('\n🔍 Testing: Get Exercise Subtypes');
  
  const query = `
    query {
      getExerciseSubtypes
    }
  `;
  
  const result = await makeGraphQLRequest(query);
  
  if (result.success) {
    console.log('✅ Get Exercise Subtypes - SUCCESS');
    console.log(`📊 Found ${result.data.getExerciseSubtypes.length} subtypes:`);
    result.data.getExerciseSubtypes.forEach((subtype, index) => {
      console.log(`  ${index + 1}. ${subtype}`);
    });
  } else {
    console.log('❌ Get Exercise Subtypes - ERROR:', result.error);
  }
}

async function testGetExerciseStats() {
  console.log('\n🔍 Testing: Get Exercise Statistics');
  
  const query = `
    query {
      getExerciseStats {
        success
        message
        stats {
          total
          byType {
            type
            count
          }
          byDifficulty {
            difficulty
            count
          }
          bySkill {
            skill
            count
          }
          averageSuccessRate
          totalAttempts
          totalCorrectAttempts
        }
      }
    }
  `;
  
  const result = await makeGraphQLRequest(query);
  
  if (result.success) {
    console.log('✅ Get Exercise Stats - SUCCESS');
    const stats = result.data.getExerciseStats.stats;
    console.log(`📊 Total exercises: ${stats.total}`);
    console.log(`📈 Average success rate: ${stats.averageSuccessRate.toFixed(2)}%`);
    console.log(`🎯 Total attempts: ${stats.totalAttempts}`);
    console.log(`✅ Correct attempts: ${stats.totalCorrectAttempts}`);
    
    console.log('\n📋 By Type:');
    stats.byType.forEach(type => {
      console.log(`  - ${type.type}: ${type.count}`);
    });
    
    console.log('\n📋 By Difficulty:');
    stats.byDifficulty.forEach(diff => {
      console.log(`  - ${diff.difficulty}: ${diff.count}`);
    });
    
    console.log('\n📋 By Skill:');
    stats.bySkill.forEach(skill => {
      console.log(`  - ${skill.skill}: ${skill.count}`);
    });
  } else {
    console.log('❌ Get Exercise Stats - ERROR:', result.error);
  }
}

async function testCreateExercise() {
  console.log('\n🔍 Testing: Create Exercise');
  
  const mutation = `
    mutation CreateExercise($input: CreateExerciseInput!) {
      createExercise(input: $input) {
        success
        message
        exercise {
          _id
          type
          exercise_subtype
          title
          instruction
          maxScore
          difficulty
          isActive
          skillFocus
          createdAt
        }
      }
    }
  `;
  
  const result = await makeGraphQLRequest(mutation, { input: testExerciseData });
  
  if (result.success) {
    console.log('✅ Create Exercise - SUCCESS');
    console.log(`📝 Created: ${result.data.createExercise.exercise.title}`);
    console.log(`🆔 ID: ${result.data.createExercise.exercise._id}`);
    return result.data.createExercise.exercise._id;
  } else {
    console.log('❌ Create Exercise - ERROR:', result.error);
    return null;
  }
}

async function testGetExerciseById(exerciseId) {
  console.log('\n🔍 Testing: Get Exercise by ID');
  
  const query = `
    query GetExercise($id: ID!) {
      getExercise(id: $id) {
        _id
        type
        exercise_subtype
        title
        instruction
        maxScore
        difficulty
        isActive
        skillFocus
      }
    }
  `;
  
  const result = await makeGraphQLRequest(query, { id: exerciseId });
  
  if (result.success) {
    console.log('✅ Get Exercise by ID - SUCCESS');
    console.log(`📝 Exercise: ${result.data.getExercise.title}`);
    console.log(`🆔 ID: ${result.data.getExercise._id}`);
    console.log(`📊 Type: ${result.data.getExercise.type}`);
    console.log(`🎯 Subtype: ${result.data.getExercise.exercise_subtype}`);
  } else {
    console.log('❌ Get Exercise by ID - ERROR:', result.error);
  }
}

async function testUpdateExercise(exerciseId) {
  console.log('\n🔍 Testing: Update Exercise');
  
  const mutation = `
    mutation UpdateExercise($id: ID!, $input: UpdateExerciseInput!) {
      updateExercise(id: $id, input: $input) {
        success
        message
        exercise {
          _id
          title
          instruction
          maxScore
          difficulty
          updatedAt
        }
      }
    }
  `;
  
  const updateData = {
    title: 'Updated Test Exercise - Chọn từ vựng',
    instruction: 'Chọn từ tiếng Anh đúng cho từ tiếng Việt (Updated)',
    maxScore: 15,
    difficulty: 'intermediate'
  };
  
  const result = await makeGraphQLRequest(mutation, { id: exerciseId, input: updateData });
  
  if (result.success) {
    console.log('✅ Update Exercise - SUCCESS');
    console.log(`📝 Updated: ${result.data.updateExercise.exercise.title}`);
    console.log(`📊 New max score: ${result.data.updateExercise.exercise.maxScore}`);
    console.log(`📈 New difficulty: ${result.data.updateExercise.exercise.difficulty}`);
  } else {
    console.log('❌ Update Exercise - ERROR:', result.error);
  }
}

async function testToggleExerciseActive(exerciseId) {
  console.log('\n🔍 Testing: Toggle Exercise Active Status');
  
  const mutation = `
    mutation ToggleExerciseActive($id: ID!) {
      toggleExerciseActive(id: $id) {
        success
        message
        exercise {
          _id
          title
          isActive
          updatedAt
        }
      }
    }
  `;
  
  const result = await makeGraphQLRequest(mutation, { id: exerciseId });
  
  if (result.success) {
    console.log('✅ Toggle Exercise Active - SUCCESS');
    console.log(`📝 Exercise: ${result.data.toggleExerciseActive.exercise.title}`);
    console.log(`🔄 Status: ${result.data.toggleExerciseActive.exercise.isActive ? 'Active' : 'Inactive'}`);
  } else {
    console.log('❌ Toggle Exercise Active - ERROR:', result.error);
  }
}

async function testUpdateExerciseSuccessRate(exerciseId) {
  console.log('\n🔍 Testing: Update Exercise Success Rate');
  
  const mutation = `
    mutation UpdateExerciseSuccessRate($id: ID!, $isCorrect: Boolean!) {
      updateExerciseSuccessRate(id: $id, isCorrect: $isCorrect) {
        success
        message
        exercise {
          _id
          title
          successRate
          totalAttempts
          correctAttempts
        }
      }
    }
  `;
  
  // Test correct answer
  const correctResult = await makeGraphQLRequest(mutation, { id: exerciseId, isCorrect: true });
  
  if (correctResult.success) {
    console.log('✅ Update Success Rate (Correct) - SUCCESS');
    console.log(`📊 Success Rate: ${correctResult.data.updateExerciseSuccessRate.exercise.successRate}%`);
    console.log(`🎯 Total Attempts: ${correctResult.data.updateExerciseSuccessRate.exercise.totalAttempts}`);
    console.log(`✅ Correct Attempts: ${correctResult.data.updateExerciseSuccessRate.exercise.correctAttempts}`);
  } else {
    console.log('❌ Update Success Rate (Correct) - ERROR:', correctResult.error);
  }
  
  // Test incorrect answer
  const incorrectResult = await makeGraphQLRequest(mutation, { id: exerciseId, isCorrect: false });
  
  if (incorrectResult.success) {
    console.log('✅ Update Success Rate (Incorrect) - SUCCESS');
    console.log(`📊 Success Rate: ${incorrectResult.data.updateExerciseSuccessRate.exercise.successRate}%`);
    console.log(`🎯 Total Attempts: ${incorrectResult.data.updateExerciseSuccessRate.exercise.totalAttempts}`);
    console.log(`✅ Correct Attempts: ${incorrectResult.data.updateExerciseSuccessRate.exercise.correctAttempts}`);
  } else {
    console.log('❌ Update Success Rate (Incorrect) - ERROR:', incorrectResult.error);
  }
}

async function testGetExercisesByType() {
  console.log('\n🔍 Testing: Get Exercises by Type');
  
  const query = `
    query GetExercisesByType($type: String!) {
      getExercisesByType(type: $type) {
        _id
        type
        exercise_subtype
        title
        difficulty
        skillFocus
      }
    }
  `;
  
  const result = await makeGraphQLRequest(query, { type: 'multiple_choice' });
  
  if (result.success) {
    console.log('✅ Get Exercises by Type - SUCCESS');
    console.log(`📊 Found ${result.data.getExercisesByType.length} multiple choice exercises:`);
    result.data.getExercisesByType.forEach((exercise, index) => {
      console.log(`  ${index + 1}. ${exercise.title} (${exercise.exercise_subtype})`);
    });
  } else {
    console.log('❌ Get Exercises by Type - ERROR:', result.error);
  }
}

async function testGetExercisesBySkill() {
  console.log('\n🔍 Testing: Get Exercises by Skill');
  
  const query = `
    query GetExercisesBySkill($skill: String!) {
      getExercisesBySkill(skill: $skill) {
        _id
        type
        exercise_subtype
        title
        difficulty
        skillFocus
      }
    }
  `;
  
  const result = await makeGraphQLRequest(query, { skill: 'vocabulary' });
  
  if (result.success) {
    console.log('✅ Get Exercises by Skill - SUCCESS');
    console.log(`📊 Found ${result.data.getExercisesBySkill.length} vocabulary exercises:`);
    result.data.getExercisesBySkill.forEach((exercise, index) => {
      console.log(`  ${index + 1}. ${exercise.title} (${exercise.exercise_subtype})`);
    });
  } else {
    console.log('❌ Get Exercises by Skill - ERROR:', result.error);
  }
}

async function testGetRandomExercise() {
  console.log('\n🔍 Testing: Get Random Exercise');
  
  const query = `
    query GetRandomExercise($filter: ExerciseFilterInput) {
      getRandomExercise(filter: $filter) {
        _id
        type
        exercise_subtype
        title
        instruction
        difficulty
        skillFocus
      }
    }
  `;
  
  const result = await makeGraphQLRequest(query, { 
    filter: { 
      type: 'multiple_choice',
      difficulty: 'beginner'
    } 
  });
  
  if (result.success) {
    console.log('✅ Get Random Exercise - SUCCESS');
    console.log(`📝 Random exercise: ${result.data.getRandomExercise.title}`);
    console.log(`🆔 ID: ${result.data.getRandomExercise._id}`);
    console.log(`📊 Type: ${result.data.getRandomExercise.type}`);
    console.log(`🎯 Subtype: ${result.data.getRandomExercise.exercise_subtype}`);
  } else {
    console.log('❌ Get Random Exercise - ERROR:', result.error);
  }
}

async function testGetLessonExercises() {
  console.log('\n🔍 Testing: Get Lesson Exercises');
  
  const query = `
    query GetLessonExercises($lessonId: ID!, $count: Int!, $skillFocus: [String!]) {
      getLessonExercises(lessonId: $lessonId, count: $count, skillFocus: $skillFocus) {
        _id
        type
        exercise_subtype
        title
        instruction
        difficulty
        skillFocus
      }
    }
  `;
  
  const result = await makeGraphQLRequest(query, { 
    lessonId: 'lesson_123',
    count: 4,
    skillFocus: ['vocabulary', 'grammar']
  });
  
  if (result.success) {
    console.log('✅ Get Lesson Exercises - SUCCESS');
    console.log(`📊 Found ${result.data.getLessonExercises.length} exercises for lesson:`);
    result.data.getLessonExercises.forEach((exercise, index) => {
      console.log(`  ${index + 1}. ${exercise.title} (${exercise.exercise_subtype})`);
    });
  } else {
    console.log('❌ Get Lesson Exercises - ERROR:', result.error);
  }
}

async function testBulkCreateExercises() {
  console.log('\n🔍 Testing: Bulk Create Exercises');
  
  const mutation = `
    mutation BulkCreateExercises($template: String!, $count: Int!, $skillFocus: [String!]) {
      bulkCreateExercises(template: $template, count: $count, skillFocus: $skillFocus) {
        success
        message
        exercises {
          _id
          title
          exercise_subtype
          skillFocus
        }
        total
      }
    }
  `;
  
  const result = await makeGraphQLRequest(mutation, { 
    template: 'vocabulary_multiple_choice',
    count: 3,
    skillFocus: ['vocabulary', 'listening']
  });
  
  if (result.success) {
    console.log('✅ Bulk Create Exercises - SUCCESS');
    console.log(`📝 Created ${result.data.bulkCreateExercises.total} exercises:`);
    result.data.bulkCreateExercises.exercises.forEach((exercise, index) => {
      console.log(`  ${index + 1}. ${exercise.title} (${exercise.exercise_subtype})`);
    });
    
    // Return the first created exercise ID for cleanup
    return result.data.bulkCreateExercises.exercises[0]?._id;
  } else {
    console.log('❌ Bulk Create Exercises - ERROR:', result.error);
    return null;
  }
}

async function testDeleteExercise(exerciseId) {
  console.log('\n🔍 Testing: Delete Exercise');
  
  const mutation = `
    mutation DeleteExercise($id: ID!) {
      deleteExercise(id: $id) {
        success
        message
        exercise {
          _id
          title
        }
      }
    }
  `;
  
  const result = await makeGraphQLRequest(mutation, { id: exerciseId });
  
  if (result.success) {
    console.log('✅ Delete Exercise - SUCCESS');
    console.log(`🗑️ Deleted: ${result.data.deleteExercise.exercise.title}`);
    console.log(`🆔 ID: ${result.data.deleteExercise.exercise._id}`);
  } else {
    console.log('❌ Delete Exercise - ERROR:', result.error);
  }
}

// Main test function
async function runAllTests() {
  console.log('🧪 TESTING EXERCISE CRUD OPERATIONS');
  console.log('====================================');
  
  try {
    // Test basic queries
    await testGetExerciseSubtypes();
    await testGetExerciseStats();
    await testGetExercises();
    
    // Test filtering and searching
    await testGetExercisesByType();
    await testGetExercisesBySkill();
    await testGetRandomExercise();
    await testGetLessonExercises();
    
    // Test CRUD operations
    const createdExerciseId = await testCreateExercise();
    
    if (createdExerciseId) {
      await testGetExerciseById(createdExerciseId);
      await testUpdateExercise(createdExerciseId);
      await testToggleExerciseActive(createdExerciseId);
      await testUpdateExerciseSuccessRate(createdExerciseId);
      
      // Test bulk operations
      const bulkCreatedId = await testBulkCreateExercises();
      
      // Cleanup - delete test exercises
      if (bulkCreatedId) {
        await testDeleteExercise(bulkCreatedId);
      }
      await testDeleteExercise(createdExerciseId);
    }
    
    console.log('\n🎉 ALL TESTS COMPLETED!');
    console.log('========================');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
runAllTests().catch(console.error); 