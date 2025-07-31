// server/scripts/add_sample_reading_exercises.js
import mongoose from 'mongoose';
import { Exercise, User, Course, Unit, Lesson } from '../data/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualeap';

async function addSampleReadingExercises() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin user (or create one if needed)
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️ No admin user found. Creating one...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@lingualeap.com',
        password: 'admin123',
        role: 'admin',
        displayName: 'Admin User'
      });
    }

    // Get or create a course
    let course = await Course.findOne();
    if (!course) {
      console.log('⚠️ No course found. Creating one...');
      course = await Course.create({
        title: 'English for Beginners',
        description: 'Basic English course for beginners',
        level: 'beginner',
        category: 'general',
        skill_focus: ['reading', 'vocabulary', 'grammar'],
        color: '#4CAF50',
        estimatedDuration: 30,
        isPremium: false,
        isPublished: true,
        createdBy: adminUser._id
      });
    }

    // Get or create a unit
    let unit = await Unit.findOne({ courseId: course._id });
    if (!unit) {
      console.log('⚠️ No unit found. Creating one...');
      unit = await Unit.create({
        title: 'Reading Practice',
        description: 'Practice reading comprehension',
        courseId: course._id,
        theme: 'reading',
        color: '#2196F3',
        isPremium: false,
        isPublished: true,
        createdBy: adminUser._id
      });
    }

    // Get or create a lesson
    let lesson = await Lesson.findOne({ unitId: unit._id });
    if (!lesson) {
      console.log('⚠️ No lesson found. Creating one...');
      lesson = await Lesson.create({
        title: 'Reading Comprehension',
        description: 'Practice reading and answering questions',
        courseId: course._id,
        unitId: unit._id,
        type: 'reading',
        lesson_type: 'reading',
        objective: 'Improve reading comprehension skills',
        totalExercises: 4,
        estimatedDuration: 20,
        difficulty: 'beginner',
        xpReward: 50,
        isPremium: false,
        isPublished: true,
        createdBy: adminUser._id
      });
    }

    // Sample reading exercises
    const sampleExercises = [
      {
        title: "A Day at the Coffee Shop",
        instruction: "Read the passage about Sarah's work day and answer the questions below.",
        type: "reading",
        type_display_name: "Reading Comprehension",
        skill_focus: ["reading", "vocabulary"],
        question: {
          text: "What does the passage tell us about Sarah's typical work day?"
        },
        content: {
          passage: `Sarah works at a busy coffee shop in the city center. Every morning, she arrives at 7:00 AM to prepare for the day. She makes fresh coffee, arranges pastries in the display case, and cleans the tables.

The coffee shop opens at 8:00 AM. Many customers come for breakfast before work. They usually order coffee, tea, or hot chocolate with croissants or muffins. Sarah enjoys talking to regular customers who visit every day.

During lunch time, the shop gets very busy. People order sandwiches, salads, and cold drinks. Sarah works quickly to serve everyone. She likes her job because she meets different people from around the world.

The coffee shop closes at 6:00 PM. After closing, Sarah counts the money, washes the dishes, and prepares everything for the next day. She usually goes home at 7:30 PM, feeling tired but happy.`,
          questions: [
            {
              question: "What time does Sarah arrive at work?",
              options: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"],
              correctAnswer: "7:00 AM",
              explanation: "The passage states 'Every morning, she arrives at 7:00 AM to prepare for the day.'"
            },
            {
              question: "What does Sarah do before the coffee shop opens?",
              options: [
                "Serves customers",
                "Makes fresh coffee and arranges pastries",
                "Counts money",
                "Goes home"
              ],
              correctAnswer: "Makes fresh coffee and arranges pastries",
              explanation: "The text mentions she 'makes fresh coffee, arranges pastries in the display case, and cleans the tables' before opening."
            },
            {
              question: "When does the coffee shop get very busy?",
              options: [
                "In the morning",
                "During lunch time",
                "In the evening",
                "At closing time"
              ],
              correctAnswer: "During lunch time",
              explanation: "The passage clearly states 'During lunch time, the shop gets very busy.'"
            },
            {
              question: "Why does Sarah like her job?",
              options: [
                "Because it pays well",
                "Because it's easy",
                "Because she meets different people",
                "Because she works alone"
              ],
              correctAnswer: "Because she meets different people",
              explanation: "The text says 'She likes her job because she meets different people from around the world.'"
            }
          ]
        },
        maxScore: 100,
        difficulty: "beginner",
        xpReward: 10,
        estimatedTime: 300,
        requires_audio: false,
        requires_microphone: false,
        isPremium: false,
        isActive: true,
        sortOrder: 1,
        successRate: 0,
        tags: ["reading", "beginner", "daily life"],
        courseId: course._id,
        unitId: unit._id,
        lessonId: lesson._id,
        createdBy: adminUser._id
      },
      {
        title: "The Weather Forecast",
        instruction: "Read the weather forecast and answer the questions about the weather conditions.",
        type: "reading",
        type_display_name: "Reading Comprehension",
        skill_focus: ["reading", "vocabulary"],
        question: {
          text: "What is the weather forecast telling us about the upcoming week?"
        },
        content: {
          passage: `Today's weather forecast shows a mixed week ahead. Monday will be sunny with a high temperature of 25°C and a low of 15°C. It's a perfect day for outdoor activities.

Tuesday brings clouds and light rain in the afternoon. The temperature will drop to 20°C during the day and 12°C at night. Don't forget to bring an umbrella if you're going out.

Wednesday will be partly cloudy with temperatures ranging from 18°C to 22°C. There's a 30% chance of rain in the evening, so you might want to plan indoor activities.

Thursday is expected to be the warmest day of the week, reaching 28°C with clear skies. It's an excellent day for a picnic or a walk in the park.

Friday will be cooler again, with temperatures between 16°C and 20°C. There might be some morning fog, but it should clear by noon.`,
          questions: [
            {
              question: "What will the weather be like on Monday?",
              options: [
                "Rainy and cold",
                "Sunny and warm",
                "Cloudy and cool",
                "Foggy and cold"
              ],
              correctAnswer: "Sunny and warm",
              explanation: "The forecast states 'Monday will be sunny with a high temperature of 25°C'"
            },
            {
              question: "Which day will be the warmest?",
              options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
              correctAnswer: "Thursday",
              explanation: "The text says 'Thursday is expected to be the warmest day of the week, reaching 28°C'"
            },
            {
              question: "What should you bring on Tuesday?",
              options: [
                "Sunglasses",
                "An umbrella",
                "A jacket",
                "A hat"
              ],
              correctAnswer: "An umbrella",
              explanation: "The forecast mentions 'Don't forget to bring an umbrella if you're going out' for Tuesday"
            },
            {
              question: "What is the chance of rain on Wednesday evening?",
              options: ["10%", "20%", "30%", "40%"],
              correctAnswer: "30%",
              explanation: "The text states 'There's a 30% chance of rain in the evening' for Wednesday"
            }
          ]
        },
        maxScore: 100,
        difficulty: "beginner",
        xpReward: 10,
        estimatedTime: 300,
        requires_audio: false,
        requires_microphone: false,
        isPremium: false,
        isActive: true,
        sortOrder: 2,
        successRate: 0,
        tags: ["reading", "beginner", "weather"],
        courseId: course._id,
        unitId: unit._id,
        lessonId: lesson._id,
        createdBy: adminUser._id
      },
      {
        title: "My Daily Routine",
        instruction: "Read about Tom's daily routine and answer the questions about his schedule.",
        type: "reading",
        type_display_name: "Reading Comprehension",
        skill_focus: ["reading", "vocabulary"],
        question: {
          text: "What does Tom's daily routine tell us about his lifestyle?"
        },
        content: {
          passage: `My name is Tom, and I want to share my daily routine with you. I wake up at 6:30 AM every morning. The first thing I do is brush my teeth and take a shower. Then I have breakfast with my family.

I leave home at 7:30 AM to go to work. I work as a teacher at a local school. My classes start at 8:00 AM and finish at 3:00 PM. I teach English to students of different ages.

After work, I usually go to the gym for about an hour. I like to exercise to stay healthy and fit. Then I go home and have dinner with my family around 6:00 PM.

In the evening, I sometimes watch TV or read a book. I also prepare my lessons for the next day. I usually go to bed at 10:30 PM to get enough sleep.

On weekends, I like to spend time with my friends and family. We often go to the park or visit interesting places in the city.`,
          questions: [
            {
              question: "What time does Tom wake up?",
              options: ["6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM"],
              correctAnswer: "6:30 AM",
              explanation: "The text states 'I wake up at 6:30 AM every morning'"
            },
            {
              question: "What does Tom do for work?",
              options: [
                "He's a doctor",
                "He's a teacher",
                "He's a student",
                "He's a driver"
              ],
              correctAnswer: "He's a teacher",
              explanation: "The text says 'I work as a teacher at a local school'"
            },
            {
              question: "What does Tom do after work?",
              options: [
                "He goes home immediately",
                "He goes to the gym",
                "He goes shopping",
                "He goes to a restaurant"
              ],
              correctAnswer: "He goes to the gym",
              explanation: "The text states 'After work, I usually go to the gym for about an hour'"
            },
            {
              question: "What does Tom do on weekends?",
              options: [
                "He works extra hours",
                "He stays home all day",
                "He spends time with friends and family",
                "He studies all day"
              ],
              correctAnswer: "He spends time with friends and family",
              explanation: "The text says 'On weekends, I like to spend time with my friends and family'"
            }
          ]
        },
        maxScore: 100,
        difficulty: "beginner",
        xpReward: 10,
        estimatedTime: 300,
        requires_audio: false,
        requires_microphone: false,
        isPremium: false,
        isActive: true,
        sortOrder: 3,
        successRate: 0,
        tags: ["reading", "beginner", "daily routine"],
        courseId: course._id,
        unitId: unit._id,
        lessonId: lesson._id,
        createdBy: adminUser._id
      },
      {
        title: "Healthy Eating Habits",
        instruction: "Read about healthy eating habits and answer the questions about nutrition.",
        type: "reading",
        type_display_name: "Reading Comprehension",
        skill_focus: ["reading", "vocabulary"],
        question: {
          text: "What does the passage tell us about maintaining a healthy diet?"
        },
        content: {
          passage: `Eating healthy food is very important for our health and well-being. A balanced diet should include different types of food from all food groups.

Fruits and vegetables are essential for good health. They provide vitamins, minerals, and fiber that our bodies need. We should eat at least five servings of fruits and vegetables every day.

Protein is important for building and repairing our muscles. Good sources of protein include meat, fish, eggs, beans, and nuts. We should include protein in every meal.

Carbohydrates give us energy for daily activities. Whole grains like brown rice, whole wheat bread, and oats are better choices than refined grains. They provide more nutrients and fiber.

We should also drink plenty of water throughout the day. Water helps our bodies function properly and keeps us hydrated. It's better to drink water instead of sugary drinks.

Remember to eat regular meals and avoid skipping breakfast. Eating at regular times helps maintain a healthy metabolism and keeps our energy levels stable.`,
          questions: [
            {
              question: "How many servings of fruits and vegetables should we eat daily?",
              options: ["3 servings", "5 servings", "7 servings", "10 servings"],
              correctAnswer: "5 servings",
              explanation: "The text states 'We should eat at least five servings of fruits and vegetables every day'"
            },
            {
              question: "What is protein important for?",
              options: [
                "Providing energy",
                "Building and repairing muscles",
                "Keeping us hydrated",
                "Providing vitamins"
              ],
              correctAnswer: "Building and repairing muscles",
              explanation: "The text says 'Protein is important for building and repairing our muscles'"
            },
            {
              question: "Which type of grains is better for our health?",
              options: [
                "Refined grains",
                "Whole grains",
                "White grains",
                "Processed grains"
              ],
              correctAnswer: "Whole grains",
              explanation: "The text states 'Whole grains like brown rice, whole wheat bread, and oats are better choices than refined grains'"
            },
            {
              question: "What should we drink instead of sugary drinks?",
              options: [
                "Coffee",
                "Tea",
                "Water",
                "Juice"
              ],
              correctAnswer: "Water",
              explanation: "The text says 'It's better to drink water instead of sugary drinks'"
            }
          ]
        },
        maxScore: 100,
        difficulty: "beginner",
        xpReward: 10,
        estimatedTime: 300,
        requires_audio: false,
        requires_microphone: false,
        isPremium: false,
        isActive: true,
        sortOrder: 4,
        successRate: 0,
        tags: ["reading", "beginner", "health", "nutrition"],
        courseId: course._id,
        unitId: unit._id,
        lessonId: lesson._id,
        createdBy: adminUser._id
      }
    ];

    console.log('📖 Adding sample reading exercises...');

    // Clear existing reading exercises
    await Exercise.deleteMany({ type: 'reading' });
    console.log('🗑️ Cleared existing reading exercises');

    // Add new exercises
    for (const exerciseData of sampleExercises) {
      const exercise = await Exercise.create(exerciseData);
      console.log(`✅ Added exercise: ${exercise.title}`);
    }

    console.log('🎉 Successfully added 4 sample reading exercises!');
    console.log('📊 Summary:');
    console.log('  - A Day at the Coffee Shop (4 questions)');
    console.log('  - The Weather Forecast (4 questions)');
    console.log('  - My Daily Routine (4 questions)');
    console.log('  - Healthy Eating Habits (4 questions)');

  } catch (error) {
    console.error('❌ Error adding sample reading exercises:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addSampleReadingExercises(); 