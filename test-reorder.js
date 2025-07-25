// Script để test tính năng reorder lessons
import mongoose from 'mongoose';
import { Course, Unit, Lesson } from './server/data/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualeap';

async function testReorder() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Lấy course đầu tiên
    const course = await Course.findOne({}).sort({ sortOrder: 1 });
    if (!course) {
      console.log('❌ No courses found');
      return;
    }
    console.log(`📚 Testing with course: ${course.title}`);

    // Lấy unit đầu tiên
    const unit = await Unit.findOne({ courseId: course._id }).sort({ sortOrder: 1 });
    if (!unit) {
      console.log('❌ No units found');
      return;
    }
    console.log(`📦 Testing with unit: ${unit.title}`);

    // Lấy lessons của unit
    const lessons = await Lesson.find({ unitId: unit._id }).sort({ sortOrder: 1 });
    console.log(`📝 Found ${lessons.length} lessons`);

    if (lessons.length < 2) {
      console.log('❌ Need at least 2 lessons to test reorder');
      return;
    }

    // Hiển thị thứ tự hiện tại
    console.log('\n📊 Current lesson order:');
    lessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.title} (sortOrder: ${lesson.sortOrder})`);
    });

    // Test reorder: đảo ngược thứ tự
    console.log('\n🔄 Testing reorder (reverse order)...');
    const reversedLessonIds = lessons.map(lesson => lesson._id.toString()).reversed.toList();
    
    console.log('New order:');
    reversedLessonIds.forEach((lessonId, index) => {
      const lesson = lessons.find(l => l._id.toString() === lessonId);
      console.log(`  ${index + 1}. ${lesson.title} (ID: ${lessonId})`);
    });

    // Simulate reorder mutation
    console.log('\n💾 Simulating reorder mutation...');
    const updatePromises = reversedLessonIds.map((lessonId, index) => {
      const newSortOrder = index + 1;
      console.log(`📝 Setting lesson ${lessonId} to sort order ${newSortOrder}`);
      return Lesson.findByIdAndUpdate(lessonId, { sortOrder: newSortOrder }, { new: true });
    });

    const updatedLessons = await Promise.all(updatePromises);
    
    // Sort lessons by new sortOrder
    const sortedLessons = updatedLessons.sort((a, b) => a.sortOrder - b.sortOrder);

    console.log('\n✅ Reorder completed!');
    console.log('📊 New lesson order:');
    sortedLessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.title} (sortOrder: ${lesson.sortOrder})`);
    });

  } catch (error) {
    console.error('❌ Error testing reorder:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Chạy test
testReorder(); 