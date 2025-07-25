// Script để fix sortOrder cho lessons
import mongoose from 'mongoose';
import { Course, Unit, Lesson } from './server/data/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualeap';

async function fixLessonOrder() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy tất cả courses
    const courses = await Course.find({}).sort({ sortOrder: 1 });
    console.log(`📚 Found ${courses.length} courses`);

    for (const course of courses) {
      console.log(`\n📖 Processing course: ${course.title}`);
      
      // Lấy units của course theo sortOrder
      const units = await Unit.find({ courseId: course._id }).sort({ sortOrder: 1 });
      console.log(`📦 Found ${units.length} units`);

      for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
        const unit = units[unitIndex];
        console.log(`  📦 Processing unit: ${unit.title}`);
        
        // Lấy lessons của unit theo createdAt (thứ tự tạo)
        const lessons = await Lesson.find({ unitId: unit._id }).sort({ createdAt: 1 });
        console.log(`    📝 Found ${lessons.length} lessons`);

        // Set sortOrder cho lessons (bắt đầu từ 1)
        for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
          const lesson = lessons[lessonIndex];
          const newSortOrder = lessonIndex + 1;
          
          // Fix difficulty field if needed
          if (lesson.difficulty === 'easy') {
            console.log(`    🔧 Fixing difficulty for lesson "${lesson.title}" from 'easy' to 'beginner'`);
            lesson.difficulty = 'beginner';
          }
          
          if (lesson.sortOrder !== newSortOrder) {
            console.log(`    📝 Updating lesson "${lesson.title}" from sortOrder ${lesson.sortOrder} to ${newSortOrder}`);
            lesson.sortOrder = newSortOrder;
            await lesson.save();
          } else {
            console.log(`    ✅ Lesson "${lesson.title}" already has correct sortOrder: ${lesson.sortOrder}`);
          }
        }
      }
    }

    console.log('\n✅ All lesson orders have been fixed!');
  } catch (error) {
    console.error('❌ Error fixing lesson order:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Chạy script
fixLessonOrder(); 
