# 🔧 Hướng dẫn cấu hình .env cho Firebase Project mới

## Tạo file .env

Tạo file `.env` trong thư mục `LinguaLeap-Backend` với nội dung sau:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/lingualeap

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google Cloud TTS Configuration
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Firebase Configuration - NEW PROJECT
FIREBASE_PROJECT_ID=lingualeap-ed012
FIREBASE_STORAGE_BUCKET=lingualeap-ed012.appspot.com
FIREBASE_CREDENTIALS_PATH=./google-credentials-firebase.json

# AI Configuration (Claude)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Audio Configuration
AUDIO_FORMAT=mp3
AUDIO_SAMPLE_RATE=22050
AUDIO_VOICE=en-US-Standard-A
```

## 🔑 Các thông tin quan trọng:

- **Project ID**: `lingualeap-ed012`
- **Storage Bucket**: `lingualeap-ed012.appspot.com`
- **Credentials File**: `google-credentials-firebase.json` (đã có)

## 📝 Lưu ý:

1. Thay `your-anthropic-api-key-here` bằng API key thực của Claude AI
2. Thay `your-super-secret-jwt-key-change-this-in-production` bằng JWT secret thực
3. Đảm bảo MongoDB đang chạy nếu sử dụng local database

## ✅ Sau khi tạo .env:

1. Chạy: `npm install` (nếu chưa cài dependencies)
2. Test Firebase: `node test-firebase.js`
3. Khởi động server: `npm start` 