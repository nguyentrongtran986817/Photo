# PhotoVault - Thư viện ảnh cá nhân đồng bộ Google Drive & Sẵn sàng GitHub Pages

Trang web trưng bày bộ sưu tập ảnh cá nhân, liên kết trực tiếp với tài khoản Google Drive để lấy ảnh và tự động cập nhật danh sách ảnh hiển thị khi có ảnh mới.

---

## 🌟 Các tính năng nổi bật

1. **Liên kết tài khoản Google Drive**:
   - Đăng nhập an toàn qua Google OAuth 2.0 (sử dụng Firebase Authentication).
   - Truy xuất danh sách ảnh từ Google Drive (hỗ trợ lọc theo thư mục hoặc xem toàn bộ ảnh).
   - Tự động lấy thông số chi tiết ảnh (EXIF): Máy ảnh, tiêu cự, khẩu độ, ISO, độ phân giải, ngày chụp.

2. **Tự động cập nhật danh sách ảnh (Auto-Sync)**:
   - Cơ chế quét nền tự động theo chu kỳ (mỗi 15s, 30s, 1 phút, 2 phút, 5 phút).
   - Tự động gắn huy hiệu **"Mới cập nhật"** khi phát hiện ảnh mới tải lên Google Drive.
   - Nút **"Đồng bộ ngay"** cho phép kích hoạt làm mới tức thì bất kỳ lúc nào.

3. **Giao diện trưng bày ảnh cao cấp**:
   - Hỗ trợ xem dạng Lưới đều hoặc Cột lớn.
   - Tìm kiếm nhanh theo tên ảnh và lọc theo năm chụp.
   - Trình xem ảnh toàn màn hình (Lightbox) với tính năng phóng to/thu nhỏ, xoay ảnh, trình chiếu tự động (Slideshow) và tải ảnh gốc chất lượng cao về máy.

4. **Sẵn sàng triển khai lên GitHub Pages**:
   - Cấu hình sẵn `base: './'` trong `vite.config.ts`.
   - File tự động deploy `.github/workflows/deploy.yml` đã được tạo sẵn trong dự án.
   - Tính năng xuất bản tĩnh (Static Showcase) để khách ghé thăm website xem được ảnh mà không cần đăng nhập Google Drive cá nhân của bạn.

---

## 🚀 Hướng dẫn đưa lên GitHub Pages

### Bước 1: Đẩy mã nguồn lên GitHub
Mở Terminal tại thư mục dự án và chạy các lệnh sau:

```bash
git init
git add .
git commit -m "Initial commit: Photo gallery with Google Drive sync"
git branch -M main
git remote add origin https://github.com/<tai-khoan-github>/<ten-repo>.git
git push -u origin main
```

### Bước 2: Kích hoạt GitHub Pages (QUAN TRỌNG NHẤT)
1. Truy cập vào kho lưu trữ trên GitHub (`https://github.com/nguyentrongtran986817/<ten-repo>`).
2. Vào **Settings** > **Pages** (cột bên trái).
3. Tại phần **Build and deployment** > **Source**, chuyển từ **Deploy from a branch** sang **GitHub Actions**. *(Nếu không chọn bước này, GitHub sẽ báo lỗi đỏ "Failed to deploy to github-pages").*
4. Vào **Settings** > **Actions** > **General**, cuộn xuống dưới cùng tại mục **Workflow permissions** và chọn **Read and write permissions**, sau đó bấm **Save**.
5. Bây giờ GitHub Actions sẽ tự động chạy lại hoặc bạn có thể vào tab **Actions** > chọn **Deploy to GitHub Pages** > bấm **Run workflow**.
6. Website sẽ hoạt động tại địa chỉ: `https://nguyentrongtran986817.github.io/<ten-repo>/`

### Bước 3: Cấu hình Authorized Origins cho Google Drive OAuth
Để tính năng đăng nhập Google Drive hoạt động trên tên miền GitHub Pages của bạn:
1. Mở [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. Chọn **OAuth 2.0 Client ID** cho ứng dụng web.
3. Trong mục **Authorized JavaScript origins**, thêm địa chỉ GitHub Pages của bạn:
   `https://<tai-khoan-github>.github.io`
4. Bấm **Save**.
