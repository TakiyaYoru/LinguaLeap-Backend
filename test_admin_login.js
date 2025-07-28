// ===============================================
// TEST ADMIN LOGIN AND CRUD - LINGUALEAP
// ===============================================

import fetch from 'node-fetch';

const GRAPHQL_URL = 'http://localhost:4001/graphql';

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

async function makeGraphQLRequest(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Request error:', error.message);
    return null;
  }
}

async function makeAuthenticatedGraphQLRequest(query, variables = {}, token) {
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL errors:', result.errors);
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('❌ Request error:', error.message);
    return null;
  }
}

// ===============================================
// ADMIN LOGIN
// ===============================================

async function loginAdmin() {
  console.log('🔧 Logging in as admin...');
  
  const loginQuery = `
    mutation LoginAdmin($input: LoginInput!) {
      login(input: $input) {
        token
        user {
          id
          username
          email
          displayName
          role
        }
      }
    }
  `;

  const loginData = {
    email: 'duykha@gmail.com',
    password: '123456'
  };

  const result = await makeGraphQLRequest(loginQuery, { input: loginData });
  
  if (result?.login) {
    console.log('✅ Admin login successful!');
    console.log('👤 User:', result.login.user);
    console.log('🔑 Token:', result.login.token.substring(0, 50) + '...');
    return result.login.token;
  } else {
    console.log('❌ Failed to login as admin');
    return null;
  }
}

// ===============================================
// TEST ADMIN CRUD OPERATIONS
// ===============================================

async function testAllExerciseSubtypes(token) {
  console.log('\n🧪 Testing Create Exercise for ALL 28 subtypes...');
  const createExerciseQuery = `
    mutation CreateExercise($input: CreateExerciseInput!) {
      createExercise(input: $input) {
        success
        message
        exercise {
          _id
          type
          exercise_subtype
          title
        }
      }
    }
  `;

  // List of all 28 subtypes and their static data
  const subtypes = [
    'vocabulary_multiple_choice',
    'grammar_multiple_choice',
    'listening_multiple_choice',
    'pronunciation_multiple_choice',
    'vocabulary_fill_blank',
    'grammar_fill_blank',
    'listening_fill_blank',
    'writing_fill_blank',
    'vocabulary_translation',
    'grammar_translation',
    'writing_translation',
    'vocabulary_word_matching',
    'vocabulary_listening',
    'grammar_listening',
    'pronunciation_listening',
    'vocabulary_speaking',
    'grammar_speaking',
    'pronunciation_speaking',
    'vocabulary_reading',
    'grammar_reading',
    'comprehension_reading',
    'vocabulary_writing',
    'grammar_writing',
    'sentence_writing',
    'vocabulary_true_false',
    'grammar_true_false',
    'listening_true_false',
    'vocabulary_drag_drop',
    'grammar_drag_drop',
    'writing_drag_drop',
  ];

  // Import static data
  const { STATIC_EXERCISES } = await import('./server/data/staticExercises.js');

  let successCount = 0;
  for (const subtype of subtypes) {
    const staticData = STATIC_EXERCISES[subtype];
    if (!staticData) {
      console.log(`❌ [${subtype}] No static data found!`);
      continue;
    }
    // Prepare input
    const input = {
      ...staticData,
      content: JSON.stringify(staticData.content),
    };
    // Remove fields not in CreateExerciseInput
    delete input.exercise_subtype; // will be set below
    input.exercise_subtype = subtype;
    // Call mutation
    const result = await makeAuthenticatedGraphQLRequest(
      createExerciseQuery,
      { input },
      token
    );
    if (result?.createExercise?.success) {
      console.log(`✅ [${subtype}] Created: ${result.createExercise.exercise.title}`);
      successCount++;
    } else {
      console.log(`❌ [${subtype}] Failed:`, result?.createExercise?.message || result);
    }
  }
  console.log(`\nTổng số thành công: ${successCount}/28`);
}

// ===============================================
// TEST NON-ADMIN ACCESS (SHOULD FAIL)
// ===============================================

async function testNonAdminAccess() {
  console.log('\n🚫 Testing Non-Admin Access (Should Fail)...');
  
  // Create a regular user
  console.log('\n1️⃣ Creating regular user...');
  const registerQuery = `
    mutation RegisterUser($input: RegisterInput!) {
      register(input: $input) {
        token
        user {
          id
          username
          email
          displayName
          role
        }
      }
    }
  `;

  const userData = {
    username: 'student3',
    email: 'student3@lingualeap.com',
    password: 'student123456',
    displayName: 'Regular Student 3'
  };

  const result = await makeGraphQLRequest(registerQuery, { input: userData });
  
  if (result?.register) {
    const studentToken = result.register.token;
    console.log('✅ Regular user created!');
    console.log('👤 Role:', result.register.user.role);
    
    // Test admin operation with student token (should fail)
    console.log('\n2️⃣ Testing admin operation with student token...');
    const createExerciseQuery = `
      mutation CreateExercise($input: CreateExerciseInput!) {
        createExercise(input: $input) {
          success
          message
          exercise {
            _id
            title
          }
        }
      }
    `;

    const exerciseData = {
      type: 'multiple_choice',
      exercise_subtype: 'vocabulary_multiple_choice',
      title: 'Student Created Exercise',
      instruction: 'This should fail',
      content: JSON.stringify({
        question: 'Test question',
        options: ['a', 'b', 'c', 'd'],
        correctAnswer: 'a'
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

    const createResult = await makeAuthenticatedGraphQLRequest(
      createExerciseQuery,
      { input: exerciseData },
      studentToken
    );

    if (createResult?.createExercise?.success) {
      console.log('❌ ERROR: Student was able to create exercise!');
    } else {
      console.log('✅ CORRECT: Student cannot create exercise (Admin access required)');
    }
  } else {
    console.log('❌ Failed to create regular user');
  }
}

// ===============================================
// MAIN EXECUTION
// ===============================================

async function main() {
  console.log('🚀 Starting Admin Login and CRUD Test...\n');
  
  // Step 1: Login as admin
  const adminToken = await loginAdmin();
  
  if (!adminToken) {
    console.log('❌ Cannot proceed without admin token');
    return;
  }
  
  // Step 2: Test tất cả 28 dạng bài tập
  await testAllExerciseSubtypes(adminToken);
  
  // Step 3: Test non-admin access (should fail)
  await testNonAdminAccess();
  
  console.log('\n🎉 Admin CRUD test completed!');
}

main().catch(console.error); 