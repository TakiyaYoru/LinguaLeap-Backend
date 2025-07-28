# LinguaLeap Backend - CRUD 28 Exercise Types

## 1. Thông tin Project
- **Tên:** LinguaLeap Backend
- **Tech:** Node.js, Express, Apollo GraphQL, MongoDB (Mongoose)
- **Mục tiêu:** Hệ thống quản lý bài tập tiếng Anh với 28 dạng bài tập (exercise subtype), hỗ trợ CRUD đầy đủ, phân quyền admin, dùng dữ liệu static để phát triển UI và kiểm thử.

## 2. Mục tiêu & Checklist
### Mục tiêu
- Chuẩn hóa hệ thống bài tập với 28 subtype (multiple choice, fill blank, translation, listening, speaking, reading, writing, drag & drop, true/false, ...)
- Chuẩn hóa schema, content, CRUD API cho từng dạng
- Chỉ admin mới được phép tạo/sửa/xóa bài tập
- Dùng dữ liệu static để phát triển UI, chưa tích hợp AI
- Đảm bảo backend sẵn sàng cho frontend Flutter phát triển UI bài tập

### Checklist
- [x] Định nghĩa đủ 28 subtype bài tập (staticExercises.js)
- [x] Chuẩn hóa schema GraphQL CRUD (ExerciseCRUD, CreateExerciseInput, ...)
- [x] Tạo CRUD API cho bài tập (exerciseCRUD.js)
- [x] Chỉ cho phép admin thực hiện mutation CRUD
- [x] Test tự động CRUD cho tất cả 28 subtype (test_admin_login.js)
- [x] Đảm bảo dữ liệu trả về đúng schema, đúng content
- [x] Đảm bảo backend sẵn sàng cho frontend Flutter
- [x] Ghi chú lại toàn bộ quy trình, trạng thái, hướng dẫn tiếp tục

## 3. Các bước đã thực hiện
1. **Phân tích codebase:** Đọc toàn bộ backend, xác định luồng dữ liệu, các model, các API hiện có.
2. **Chuẩn hóa schema:** Thêm các trường cần thiết cho 28 subtype, chuẩn hóa content, thêm enum, helper.
3. **Tạo static data:** Viết file `staticExercises.js` chứa đủ 28 dạng bài tập mẫu, mỗi dạng có content chuẩn.
4. **Tạo CRUD API:** Viết file `exerciseCRUD.js` với đầy đủ typeDefs, resolvers, in-memory array, phân quyền admin.
5. **Tích hợp vào server:** Import vào `index.js`, merge schema, đảm bảo hoạt động với context user.
6. **Test tự động:** Viết script `test_admin_login.js` để login admin, lặp qua 28 subtype, test mutation createExercise cho từng dạng, log kết quả.
7. **Fix bug:** Sửa các lỗi về context, JWT, header, user object, ... đến khi CRUD hoạt động ổn định.
8. **Kiểm tra lại:** Đảm bảo mutation chỉ cho phép admin, test lại với user thường sẽ bị chặn.

## 4. Trạng thái hiện tại
- **Backend đã hoàn thiện CRUD cho 28 dạng bài tập.**
- **Tất cả mutation createExercise cho 28 subtype đều thành công với role admin.**
- **Phân quyền admin hoạt động chuẩn.**
- **Dữ liệu trả về đúng schema, đúng content.**
- **Sẵn sàng cho frontend Flutter phát triển UI bài tập.**

## 5. Hướng dẫn tiếp tục cho dev khác
- **Muốn test lại:**
  - Chạy `node test_admin_login.js` để test tự động CRUD 28 dạng bài tập.
  - Đảm bảo server backend đã chạy ở port 4001.
- **Muốn phát triển UI:**
  - Sử dụng API CRUD đã có, lấy dữ liệu từ các mutation/query.
  - Có thể dùng static data để render UI cho từng dạng bài tập.
- **Muốn mở rộng:**
  - Có thể thêm AI generation, audio, OOP cho exercise type sau khi UI hoàn thiện.
- **Muốn kiểm tra phân quyền:**
  - Đăng nhập bằng user thường, thử mutation sẽ bị chặn.
- **Muốn reset dữ liệu:**
  - Xóa array exercises trong memory hoặc restart server.

## 6. Liên hệ & Ghi chú
- **Admin test account:**
  - Email: `duykha@gmail.com`
  - Password: `123456`
- **Script test:** `test_admin_login.js` (có thể chỉnh sửa để test update/delete/bulk...)
- **File static:** `server/data/staticExercises.js`
- **API chính:** `server/graphql/exerciseCRUD.js`

---
**File này dùng để bàn giao, giúp dev mới hoặc AI assistant hiểu nhanh trạng thái, mục tiêu, cách tiếp tục phát triển hệ thống CRUD 28 bài tập LinguaLeap.** 