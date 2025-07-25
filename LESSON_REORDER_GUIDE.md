# 📝 Lesson Reorder Guide

## Tổng quan
Tính năng reorder lessons cho phép admin sắp xếp lại thứ tự các lessons trong một unit một cách trực quan.

## Backend API

### 1. Query: Lấy danh sách lessons của unit
```graphql
query GetUnitLessonsForAdmin($unitId: ID!) {
  getUnitLessonsForAdmin(unitId: $unitId) {
    success
    message
    lessons {
      id
      title
      description
      type
      sortOrder
      isPublished
      # ... other fields
    }
  }
}
```

### 2. Mutation: Reorder lessons
```graphql
mutation ReorderLessons($unitId: ID!, $lessonIds: [ID!]!) {
  reorderLessons(unitId: $unitId, lessonIds: $lessonIds) {
    success
    message
    lessons {
      id
      title
      sortOrder
    }
  }
}
```

## Flutter Implementation

### 1. Service
- `lib/network/lesson_reorder_service.dart` - Service để gọi API

### 2. Widget
- `lib/widgets/lesson_reorder_widget.dart` - Widget drag & drop để reorder

### 3. Page
- `lib/pages/admin/lesson_order_page.dart` - Trang admin để quản lý

## Cách sử dụng

### 1. Trong Flutter App
```dart
// Navigate to lesson order page
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => LessonOrderPage(
      unitId: 'unit_id_here',
      unitTitle: 'Unit Title',
    ),
  ),
);
```

### 2. Test với script
```bash
# Fix lesson order (chạy một lần)
node fix-lesson-order.js

# Test reorder functionality
node test-reorder.js
```

## Tính năng

### ✅ Đã hoàn thành
- [x] Backend API cho reorder lessons
- [x] Flutter service để gọi API
- [x] Drag & drop widget
- [x] Admin page
- [x] Validation và error handling
- [x] Auto-refresh sau khi save

### 🔄 Cần cải thiện
- [ ] Thêm animation khi drag & drop
- [ ] Preview thứ tự mới trước khi save
- [ ] Undo/redo functionality
- [ ] Bulk reorder (move multiple lessons)
- [ ] Keyboard shortcuts

## Lưu ý quan trọng

1. **Admin Only**: Chỉ admin mới có thể sử dụng tính năng này
2. **Validation**: Backend validate rằng tất cả lessons thuộc về unit được chỉ định
3. **Sort Order**: Lessons được sort theo `sortOrder` field, bắt đầu từ 1
4. **Real-time**: Thay đổi sẽ ảnh hưởng ngay lập tức đến learnmap

## Troubleshooting

### Lỗi thường gặp
1. **"Admin access required"**: Kiểm tra user role
2. **"Some lessons not found"**: Kiểm tra lesson IDs
3. **"Internal server error"**: Kiểm tra database connection

### Debug
```bash
# Xem logs backend
npm run dev

# Test API trực tiếp
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { getUnitLessonsForAdmin(unitId: \"unit_id\") { success message lessons { id title sortOrder } } }"}'
``` 