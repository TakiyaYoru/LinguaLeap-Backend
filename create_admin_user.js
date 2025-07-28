// ===============================================
// CREATE ADMIN USER SCRIPT - LINGUALEAP
// ===============================================

import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

const GRAPHQL_URL = 'http://localhost:4001/graphql';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualeap';

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
// ADMIN USER CREATION
// ===============================================

async function createAdminUser() {
  console.log('🔧 Creating admin user...');
  
  const registerQuery = `
    mutation RegisterAdmin($input: RegisterInput!) {
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

  const adminData = {
    username: 'admin',
    email: 'admin@lingualeap.com',
    password: 'admin123456',
    displayName: 'System Administrator'
  };

  const result = await makeGraphQLRequest(registerQuery, { input: adminData });
  
  if (result?.register) {
    console.log('✅ Admin user created successfully!');
    console.log('👤 User:', result.register.user);
    console.log('🔑 Token:', result.register.token.substring(0, 50) + '...');
    return result.register.token;
  } else {
    console.log('❌ Failed to create admin user');
    return null;
  }
}

// ===============================================
// UPDATE USER TO ADMIN ROLE
// ===============================================

async function updateUserToAdmin(email) {
  console.log('🔧 Updating user to admin role...');
  
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();
    
    const result = await db.collection('users').updateOne(
      { email: email },
      { $set: { role: 'admin' } }
    );
    
    await client.close();
    
    if (result.modifiedCount > 0) {
      console.log('✅ User updated to admin role successfully!');
      return true;
    } else {
      console.log('❌ User not found or already admin');
      return false;
    }
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return false;
  }
}

// ===============================================
// TEST ADMIN CRUD OPERATIONS
// ===============================================

async function testAdminCRUD(token) {
  console.log('\n🧪 Testing Admin CRUD Operations...');
  
  // Test 1: Create Exercise (Admin only)
  console.log('\n1️⃣ Testing Create Exercise...');
  const createExerciseQuery = `
    mutation CreateExercise($input: CreateExerciseInput!) {
      createExercise(input: $input) {
        success
        message
        exercise {
          id
          type
          exercise_subtype
          title
          instruction
        }
      }
    }
  `;

  const exerciseData = {
    type: 'multiple_choice',
    exercise_subtype: 'vocabulary_multiple_choice',
    title: 'Test Vocabulary Exercise',
    instruction: 'Choose the correct English word for the Vietnamese term',
    content: JSON.stringify({
      question: 'What is the English word for "xe hơi"?',
      options: ['car', 'bus', 'train', 'bike'],
      correctAnswer: 'car',
      explanation: 'Xe hơi means car in Vietnamese'
    }),
    maxScore: 10,
    difficulty: 'beginner',
    xpReward: 5,
    timeLimit: 30,
    estimatedTime: 20,
    requiresAudio: false,
    requiresMicrophone: false,
    skillFocus: ['vocabulary'],
    isActive: true,
    isPremium: false
  };

  const createResult = await makeAuthenticatedGraphQLRequest(
    createExerciseQuery, 
    { input: exerciseData }, 
    token
  );

  if (createResult?.createExercise?.success) {
    console.log('✅ Create exercise successful!');
    console.log('📝 Exercise:', createResult.createExercise.exercise.title);
    
    const exerciseId = createResult.createExercise.exercise.id;
    
    // Test 2: Update Exercise (Admin only)
    console.log('\n2️⃣ Testing Update Exercise...');
    const updateExerciseQuery = `
      mutation UpdateExercise($id: ID!, $input: UpdateExerciseInput!) {
        updateExercise(id: $id, input: $input) {
          success
          message
          exercise {
            id
            title
            instruction
          }
        }
      }
    `;

    const updateData = {
      title: 'Updated Test Vocabulary Exercise',
      instruction: 'Updated instruction for the exercise'
    };

    const updateResult = await makeAuthenticatedGraphQLRequest(
      updateExerciseQuery,
      { id: exerciseId, input: updateData },
      token
    );

    if (updateResult?.updateExercise?.success) {
      console.log('✅ Update exercise successful!');
      console.log('📝 Updated title:', updateResult.updateExercise.exercise.title);
    } else {
      console.log('❌ Update exercise failed');
    }

    // Test 3: Toggle Exercise Active (Admin only)
    console.log('\n3️⃣ Testing Toggle Exercise Active...');
    const toggleQuery = `
      mutation ToggleExerciseActive($id: ID!) {
        toggleExerciseActive(id: $id) {
          success
          message
          exercise {
            id
            isActive
          }
        }
      }
    `;

    const toggleResult = await makeAuthenticatedGraphQLRequest(
      toggleQuery,
      { id: exerciseId },
      token
    );

    if (toggleResult?.toggleExerciseActive?.success) {
      console.log('✅ Toggle exercise active successful!');
      console.log('🔄 Active status:', toggleResult.toggleExerciseActive.exercise.isActive);
    } else {
      console.log('❌ Toggle exercise active failed');
    }

    // Test 4: Delete Exercise (Admin only)
    console.log('\n4️⃣ Testing Delete Exercise...');
    const deleteQuery = `
      mutation DeleteExercise($id: ID!) {
        deleteExercise(id: $id) {
          success
          message
          exercise {
            id
            title
          }
        }
      }
    `;

    const deleteResult = await makeAuthenticatedGraphQLRequest(
      deleteQuery,
      { id: exerciseId },
      token
    );

    if (deleteResult?.deleteExercise?.success) {
      console.log('✅ Delete exercise successful!');
      console.log('🗑️ Deleted exercise:', deleteResult.deleteExercise.exercise.title);
    } else {
      console.log('❌ Delete exercise failed');
    }
  } else {
    console.log('❌ Create exercise failed');
  }

  // Test 5: Bulk Create Exercises (Admin only)
  console.log('\n5️⃣ Testing Bulk Create Exercises...');
  const bulkCreateQuery = `
    mutation BulkCreateExercises($template: String!, $count: Int!, $skillFocus: [String!]) {
      bulkCreateExercises(template: $template, count: $count, skillFocus: $skillFocus) {
        success
        message
        exercises {
          id
          title
          exercise_subtype
        }
        total
      }
    }
  `;

  const bulkResult = await makeAuthenticatedGraphQLRequest(
    bulkCreateQuery,
    { 
      template: 'vocabulary_multiple_choice', 
      count: 3, 
      skillFocus: ['vocabulary'] 
    },
    token
  );

  if (bulkResult?.bulkCreateExercises?.success) {
    console.log('✅ Bulk create exercises successful!');
    console.log('📝 Created:', bulkResult.bulkCreateExercises.total, 'exercises');
  } else {
    console.log('❌ Bulk create exercises failed');
  }
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
    username: 'student',
    email: 'student@lingualeap.com',
    password: 'student123456',
    displayName: 'Regular Student'
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
            id
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
  console.log('🚀 Starting Admin CRUD Test...\n');
  
  // Step 1: Create admin user
  const adminToken = await createAdminUser();
  
  if (!adminToken) {
    console.log('❌ Cannot proceed without admin token');
    return;
  }
  
  // Step 2: Update user to admin role (if needed)
  await updateUserToAdmin('admin@lingualeap.com');
  
  // Step 3: Test admin CRUD operations
  await testAdminCRUD(adminToken);
  
  // Step 4: Test non-admin access (should fail)
  await testNonAdminAccess();
  
  console.log('\n🎉 Admin CRUD test completed!');
}

main().catch(console.error); 