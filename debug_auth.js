// ===============================================
// DEBUG AUTHENTICATION - LINGUALEAP
// ===============================================

import fetch from 'node-fetch';

const GRAPHQL_URL = 'http://localhost:4001/graphql';

async function makeAuthenticatedGraphQLRequest(query, variables = {}, token) {
  try {
    console.log('🔍 Making request with token:', token.substring(0, 50) + '...');
    console.log('🔍 Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
    
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
    
    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
    
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

async function testAuth() {
  console.log('🔧 Testing authentication...');
  
  // Login as admin
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

  const loginResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: loginQuery,
      variables: { input: loginData },
    }),
  });

  const loginResult = await loginResponse.json();
  
  if (loginResult.data?.login) {
    const token = loginResult.data.login.token;
    console.log('✅ Login successful!');
    console.log('👤 User:', loginResult.data.login.user);
    console.log('🔑 Token:', token.substring(0, 50) + '...');
    
    // Test simple query first
    console.log('\n🔍 Testing simple query...');
    const simpleQuery = `
      query {
        me {
          id
          username
          email
          role
        }
      }
    `;
    
    const simpleResult = await makeAuthenticatedGraphQLRequest(simpleQuery, {}, token);
    console.log('🔍 Simple query result:', simpleResult);
    
    // Test create exercise
    console.log('\n🔍 Testing create exercise...');
    const createQuery = `
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
      title: 'Debug Test Exercise',
      instruction: 'Test instruction',
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

    const createResult = await makeAuthenticatedGraphQLRequest(createQuery, { input: exerciseData }, token);
    console.log('🔍 Create exercise result:', createResult);
    
  } else {
    console.log('❌ Login failed:', loginResult.errors);
  }
}

testAuth().catch(console.error); 