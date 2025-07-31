// server/scripts/add_sample_speaking_exercises.js
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Exercise, User, Course, Unit, Lesson } from '../data/models/index.js';

// Load environment variables
config();

async function addSampleSpeakingExercises() {
  try {
    console.log('🎤 Starting to add sample English speaking exercises...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️ No admin user found, creating one...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@lingualeap.com',
        password: 'admin123',
        role: 'admin',
        displayName: 'Admin User',
        isActive: true,
      });
    }
    console.log('✅ Admin user ready:', adminUser.username);
    
    // Find or create a course
    let course = await Course.findOne({});
    if (!course) {
      console.log('⚠️ No course found, creating one...');
      course = await Course.create({
        title: 'Basic English Course',
        description: 'Basic English course for beginners',
        level: 'beginner',
        isActive: true,
        createdBy: adminUser._id,
      });
    }
    console.log('✅ Course ready:', course.title);
    
    // Find or create a unit
    let unit = await Unit.findOne({ courseId: course._id });
    if (!unit) {
      console.log('⚠️ No unit found, creating one...');
      unit = await Unit.create({
        title: 'Unit 1: Greetings',
        description: 'Learn basic greetings',
        courseId: course._id,
        sortOrder: 1,
        isActive: true,
        createdBy: adminUser._id,
      });
    }
    console.log('✅ Unit ready:', unit.title);
    
    // Find or create a lesson
    let lesson = await Lesson.findOne({ unitId: unit._id });
    if (!lesson) {
      console.log('⚠️ No lesson found, creating one...');
      lesson = await Lesson.create({
        title: 'Lesson 1: Hello',
        description: 'Learn to say hello',
        unitId: unit._id,
        courseId: course._id,
        sortOrder: 1,
        isActive: true,
        createdBy: adminUser._id,
      });
    }
    console.log('✅ Lesson ready:', lesson.title);
    
    // Delete existing speaking exercises to avoid duplicates
    await Exercise.deleteMany({ type: 'speaking' });
    console.log('🗑️ Deleted existing speaking exercises');
    
    // Sample English speaking exercises
    const speakingExercises = [
      {
        title: 'Hello',
        instruction: 'Say "Hello" clearly and naturally',
        type: 'speaking',
        type_display_name: 'Speaking',
        skill_focus: ['pronunciation', 'speaking'],
        question: {
          text: 'Say "Hello"',
          audioUrl: null,
          imageUrl: null,
          videoUrl: null,
        },
        content: JSON.stringify({
          sentence: 'Hello',
          instruction: 'Say "Hello" clearly and naturally',
          audio_text: 'Hello',
          target_pronunciation: 'Hello',
          difficulty: 'beginner',
        }),
        maxScore: 10,
        difficulty: 'beginner',
        xpReward: 5,
        timeLimit: 30,
        estimatedTime: 45,
        requires_audio: false,
        requires_microphone: true,
        isPremium: false,
        isActive: true,
        sortOrder: 1,
        feedback: {
          correct: 'Excellent pronunciation! You said "Hello" very clearly.',
          incorrect: 'Try again. Say "Hello" slowly and clearly.',
          hint: 'Focus on the "H" sound and the "o" sound at the end.'
        },
        tags: ['greeting', 'basic', 'pronunciation'],
        lessonId: lesson._id,
        unitId: unit._id,
        courseId: course._id,
        createdBy: adminUser._id,
      },
      {
        title: 'My name is...',
        instruction: 'Say "My name is [your name]"',
        type: 'speaking',
        type_display_name: 'Speaking',
        skill_focus: ['pronunciation', 'speaking'],
        question: {
          text: 'Say "My name is [your name]"',
          audioUrl: null,
          imageUrl: null,
          videoUrl: null,
        },
        content: JSON.stringify({
          sentence: 'My name is [your name]',
          instruction: 'Say "My name is [your name]"',
          audio_text: 'My name is [your name]',
          target_pronunciation: 'My name is',
          difficulty: 'intermediate',
        }),
        maxScore: 10,
        difficulty: 'intermediate',
        xpReward: 8,
        timeLimit: 45,
        estimatedTime: 60,
        requires_audio: false,
        requires_microphone: true,
        isPremium: false,
        isActive: true,
        sortOrder: 2,
        feedback: {
          correct: 'Great! You introduced yourself very well.',
          incorrect: 'Try again. Say "My name is" then say your name.',
          hint: 'Focus on the "My" sound and "name" pronunciation.'
        },
        tags: ['introduction', 'self', 'pronunciation'],
        lessonId: lesson._id,
        unitId: unit._id,
        courseId: course._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Thank you',
        instruction: 'Say "Thank you" politely',
        type: 'speaking',
        type_display_name: 'Speaking',
        skill_focus: ['pronunciation', 'speaking'],
        question: {
          text: 'Say "Thank you"',
          audioUrl: null,
          imageUrl: null,
          videoUrl: null,
        },
        content: JSON.stringify({
          sentence: 'Thank you',
          instruction: 'Say "Thank you" politely',
          audio_text: 'Thank you',
          target_pronunciation: 'Thank you',
          difficulty: 'beginner',
        }),
        maxScore: 10,
        difficulty: 'beginner',
        xpReward: 5,
        timeLimit: 30,
        estimatedTime: 45,
        requires_audio: false,
        requires_microphone: true,
        isPremium: false,
        isActive: true,
        sortOrder: 3,
        feedback: {
          correct: 'Very good! You said "Thank you" very politely.',
          incorrect: 'Try again. Say "Thank you" with a polite tone.',
          hint: 'Focus on the "th" sound and "you" pronunciation.'
        },
        tags: ['thanks', 'politeness', 'basic'],
        lessonId: lesson._id,
        unitId: unit._id,
        courseId: course._id,
        createdBy: adminUser._id,
      },
      {
        title: 'How are you?',
        instruction: 'Say "How are you?" to ask about someone\'s well-being',
        type: 'speaking',
        type_display_name: 'Speaking',
        skill_focus: ['pronunciation', 'speaking'],
        question: {
          text: 'Say "How are you?"',
          audioUrl: null,
          imageUrl: null,
          videoUrl: null,
        },
        content: JSON.stringify({
          sentence: 'How are you?',
          instruction: 'Say "How are you?" to ask about someone\'s well-being',
          audio_text: 'How are you?',
          target_pronunciation: 'How are you?',
          difficulty: 'intermediate',
        }),
        maxScore: 10,
        difficulty: 'intermediate',
        xpReward: 8,
        timeLimit: 45,
        estimatedTime: 60,
        requires_audio: false,
        requires_microphone: true,
        isPremium: false,
        isActive: true,
        sortOrder: 4,
        feedback: {
          correct: 'Excellent! You asked very naturally.',
          incorrect: 'Try again. Say "How are you?" with a questioning tone.',
          hint: 'Remember to raise your voice at the end for a question.'
        },
        tags: ['question', 'health', 'conversation'],
        lessonId: lesson._id,
        unitId: unit._id,
        courseId: course._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Nice to meet you',
        instruction: 'Say "Nice to meet you" when meeting someone',
        type: 'speaking',
        type_display_name: 'Speaking',
        skill_focus: ['pronunciation', 'speaking'],
        question: {
          text: 'Say "Nice to meet you"',
          audioUrl: null,
          imageUrl: null,
          videoUrl: null,
        },
        content: JSON.stringify({
          sentence: 'Nice to meet you',
          instruction: 'Say "Nice to meet you" when meeting someone',
          audio_text: 'Nice to meet you',
          target_pronunciation: 'Nice to meet you',
          difficulty: 'advanced',
        }),
        maxScore: 10,
        difficulty: 'advanced',
        xpReward: 12,
        timeLimit: 60,
        estimatedTime: 75,
        requires_audio: false,
        requires_microphone: true,
        isPremium: false,
        isActive: true,
        sortOrder: 5,
        feedback: {
          correct: 'Perfect! You expressed that very well.',
          incorrect: 'Try again. Say each word slowly and clearly.',
          hint: 'Focus on "Nice", "to", "meet", and "you" pronunciation.'
        },
        tags: ['meeting', 'politeness', 'advanced'],
        lessonId: lesson._id,
        unitId: unit._id,
        courseId: course._id,
        createdBy: adminUser._id,
      },
      {
        title: 'What do you do?',
        instruction: 'Say "What do you do?" to ask about someone\'s job',
        type: 'speaking',
        type_display_name: 'Speaking',
        skill_focus: ['pronunciation', 'speaking'],
        question: {
          text: 'Say "What do you do?"',
          audioUrl: null,
          imageUrl: null,
          videoUrl: null,
        },
        content: JSON.stringify({
          sentence: 'What do you do?',
          instruction: 'Say "What do you do?" to ask about someone\'s job',
          audio_text: 'What do you do?',
          target_pronunciation: 'What do you do?',
          difficulty: 'intermediate',
        }),
        maxScore: 10,
        difficulty: 'intermediate',
        xpReward: 8,
        timeLimit: 45,
        estimatedTime: 60,
        requires_audio: false,
        requires_microphone: true,
        isPremium: false,
        isActive: true,
        sortOrder: 6,
        feedback: {
          correct: 'Very good! You asked about the job naturally.',
          incorrect: 'Try again. Say "What do you do?" with a questioning tone.',
          hint: 'Focus on the "What" and "do" sounds, and raise your voice at the end.'
        },
        tags: ['question', 'occupation', 'conversation'],
        lessonId: lesson._id,
        unitId: unit._id,
        courseId: course._id,
        createdBy: adminUser._id,
      },
      {
        title: 'I like learning English',
        instruction: 'Say "I like learning English"',
        type: 'speaking',
        type_display_name: 'Speaking',
        skill_focus: ['pronunciation', 'speaking'],
        question: {
          text: 'Say "I like learning English"',
          audioUrl: null,
          imageUrl: null,
          videoUrl: null,
        },
        content: JSON.stringify({
          sentence: 'I like learning English',
          instruction: 'Say "I like learning English"',
          audio_text: 'I like learning English',
          target_pronunciation: 'I like learning English',
          difficulty: 'advanced',
        }),
        maxScore: 10,
        difficulty: 'advanced',
        xpReward: 12,
        timeLimit: 60,
        estimatedTime: 75,
        requires_audio: false,
        requires_microphone: true,
        isPremium: false,
        isActive: true,
        sortOrder: 7,
        feedback: {
          correct: 'Excellent! You expressed your interest very well.',
          incorrect: 'Try again. Say each word slowly and clearly.',
          hint: 'Focus on "like", "learning", and "English" pronunciation.'
        },
        tags: ['preference', 'learning', 'language'],
        lessonId: lesson._id,
        unitId: unit._id,
        courseId: course._id,
        createdBy: adminUser._id,
      },
      {
        title: 'Can you help me?',
        instruction: 'Say "Can you help me?" to ask for assistance',
        type: 'speaking',
        type_display_name: 'Speaking',
        skill_focus: ['pronunciation', 'speaking'],
        question: {
          text: 'Say "Can you help me?"',
          audioUrl: null,
          imageUrl: null,
          videoUrl: null,
        },
        content: JSON.stringify({
          sentence: 'Can you help me?',
          instruction: 'Say "Can you help me?" to ask for assistance',
          audio_text: 'Can you help me?',
          target_pronunciation: 'Can you help me?',
          difficulty: 'advanced',
        }),
        maxScore: 10,
        difficulty: 'advanced',
        xpReward: 12,
        timeLimit: 60,
        estimatedTime: 75,
        requires_audio: false,
        requires_microphone: true,
        isPremium: false,
        isActive: true,
        sortOrder: 8,
        feedback: {
          correct: 'Very good! You asked for help politely.',
          incorrect: 'Try again. Say "Can you help me?" with a polite tone.',
          hint: 'Focus on "Can", "you", "help", and "me" pronunciation.'
        },
        tags: ['request', 'help', 'politeness'],
        lessonId: lesson._id,
        unitId: unit._id,
        courseId: course._id,
        createdBy: adminUser._id,
      },
    ];
    
    // Insert speaking exercises
    const createdExercises = await Exercise.insertMany(speakingExercises);
    console.log(`✅ Successfully created ${createdExercises.length} English speaking exercises`);
    
    // Log created exercises
    createdExercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.title} (${exercise.difficulty})`);
    });
    
    console.log('🎤 Sample English speaking exercises added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample speaking exercises:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addSampleSpeakingExercises(); 