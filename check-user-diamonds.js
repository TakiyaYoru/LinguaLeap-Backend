// check-user-diamonds.js - Kiểm tra và cập nhật field diamonds cho users
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './server/data/models/index.js';

dotenv.config();

async function checkAndUpdateUserDiamonds() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lingualeap');
    console.log('✅ Connected to MongoDB');

    // Kiểm tra users hiện tại
    const users = await User.find({}, 'username diamonds level totalXP createdAt');
    console.log(`📊 Found ${users.length} users`);

    // Kiểm tra users không có diamonds
    const usersWithoutDiamonds = users.filter(user => user.diamonds === undefined || user.diamonds === null);
    console.log(`⚠️ Users without diamonds: ${usersWithoutDiamonds.length}`);

    if (usersWithoutDiamonds.length > 0) {
      console.log('🔧 Updating users without diamonds...');
      
      // Cập nhật tất cả users không có diamonds
      const updateResult = await User.updateMany(
        { diamonds: { $exists: false } },
        { $set: { diamonds: 0, level: 1 } }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} users`);
    }

    // Kiểm tra lại sau khi cập nhật
    const updatedUsers = await User.find({}, 'username diamonds level totalXP').limit(5);
    console.log('📋 Sample users after update:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.username}: Level ${user.level}, ${user.totalXP} XP, ${user.diamonds} diamonds`);
    });

    console.log('✅ Check and update completed');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkAndUpdateUserDiamonds(); 