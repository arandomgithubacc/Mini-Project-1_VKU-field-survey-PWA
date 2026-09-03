# VKU Field Survey PWA

Ứng dụng Progressive Web App hỗ trợ kiểm tra và ghi nhận hiện trạng cơ sở vật chất tại Trường Đại học Việt - Hàn (VKU). Nhân viên có thể nhập thông tin tòa nhà, phòng, thiết bị, mức đánh giá, ghi chú lỗi và ảnh hiện trạng ngay cả khi không có kết nối Internet.

Dữ liệu khảo sát được lưu cục bộ với trạng thái `PENDING_SYNC`. Khi thiết bị có mạng trở lại, ứng dụng tự động giả lập đồng bộ các báo cáo lên server và cập nhật trạng thái thành `SYNCED`.

## Live Demo

GitHub Pages hiện chưa được triển khai cho repository này. Bạn có thể truy cập mã nguồn tại [VKU Field Survey PWA trên GitHub](https://github.com/arandomgithubacc/Mini-Project-1_VKU-field-survey-PWA) và chạy bản production local theo hướng dẫn bên dưới.

## Tính năng chính

- Hiển thị trạng thái kết nối Online/Offline.
- Nhập thông tin tòa nhà, tầng, số phòng và phân loại thiết bị.
- Đánh giá tình trạng theo thang điểm 1-5 sao.
- Ghi chú lỗi và chụp/tải ảnh hiện trạng.
- Lưu báo cáo offline vào IndexedDB.
- Tự động đồng bộ dữ liệu khi kết nối Internet được khôi phục.
- Hiển thị lịch sử khảo sát cùng trạng thái đồng bộ.
- Có thể chạy dưới dạng PWA hoặc tích hợp camera native qua Capacitor.

## Công nghệ sử dụng

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) thông qua [LocalForage](https://localforage.github.io/localForage/)
- [Service Worker PWA](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) với [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Capacitor Camera](https://capacitorjs.com/docs/apis/camera) cho thiết bị native

## Yêu cầu môi trường

- Node.js 20 trở lên
- npm

## Cài đặt và chạy local

Clone repository và cài đặt các dependency:

```bash
git clone https://github.com/arandomgithubacc/Mini-Project-1_VKU-field-survey-PWA.git
cd Mini-Project-1_VKU-field-survey-PWA
npm install
```

Khởi động development server:

```bash
npm run dev
```

Mở URL được Vite hiển thị trong terminal, thường là `http://localhost:5173`.

## Build PWA

Tạo bản build production và service worker:

```bash
npm run build
```

Các file build được tạo trong thư mục `dist/`. Có thể xem thử bản production bằng:

```bash
npm run preview
```

PWA sử dụng chiến lược `generateSW` và Workbox để cache các tệp HTML, CSS, JavaScript, giúp ứng dụng tiếp tục hoạt động offline.

## Kiểm tra mã nguồn

Chạy ESLint bằng lệnh:

```bash
npm run lint
```
