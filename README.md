# P-E-commerce: Unified Commerce & Social Platform

## 🌟 Tổng quan dự án
P-E-commerce là một nền tảng hiện đại tích hợp ba trụ cột chính: **Thương mại điện tử (E-commerce)**, **Mạng xã hội (Social Network)** và **Video ngắn (Short Video Commerce)**. Dự án được thiết kế với kiến trúc Monorepo mạnh mẽ, sẵn sàng cho việc mở rộng và tối ưu hiệu năng cao.

---

## 🏗️ Cấu trúc dự án (Monorepo)
Dự án sử dụng **TurboRepo** để quản lý nhiều ứng dụng và gói thư viện trong một kho lưu trữ duy nhất.

```text
.
├── apps
│   ├── web          # Ứng dụng React (Vite) dành cho Người mua & Mạng xã hội
│   ├── api          # Backend NestJS (Core logic & RESTful API)
│   └── admin        # Dashboard quản lý dành cho Admin (React + Vite)
├── packages
│   ├── ui           # Thư viện UI components dùng chung (TailwindCSS)
│   ├── schema       # Định nghĩa Prisma Schema & Zod validation dùng chung
│   ├── utils        # Các hàm tiện ích (Format, Auth helpers, Helpers)
│   └── config       # Cấu hình dùng chung (ESLint, TypeScript, Tailwind)
├── ai               # Hệ thống hướng dẫn & bộ nhớ dành cho AI Agents
└── docker-compose.yml # Thiết lập môi trường Database (Postgres, Redis)
```

---

## 🚀 Tính năng cốt lõi

### 1. Thương mại điện tử (Shopee-style)
- **Quản lý sản phẩm**: Danh mục đa tầng, tìm kiếm tối ưu với GIN Index, bộ lọc giá và đánh giá.
- **Giỏ hàng & Đặt hàng**: Quy trình checkout an toàn, xử lý giao dịch đồng nhất.
- **Hệ thống giảm giá**: Quản lý Voucher, Coupon và các chương trình khuyến mãi.
- **Theo dõi đơn hàng**: Trạng thái đơn hàng thời gian thực từ lúc đặt đến khi hoàn tất.

### 2. Mạng xã hội (Facebook-style)
- **Bảng tin (News Feed)**: Thuật toán tổng hợp bài viết từ những người đang theo dõi.
- **Tương tác**: Like, Comment, Share và hệ thống thông báo thời gian thực.
- **Nhóm & Quan hệ**: Hệ thống Follow/Follower, tham gia nhóm và thảo luận.
- **Tin nhắn trực tiếp (DM)**: Chat real-time giữa người dùng và chủ shop.

### 3. Video ngắn & Thương mại (TikTok-style)
- **Video Feed**: Cuộn vô tận, tối ưu hóa autoplay và tải trước video.
- **Gắn thẻ sản phẩm**: Cho phép gắn link sản phẩm trực tiếp vào video ngắn.
- **Mua hàng từ video**: Trải nghiệm "Click-to-buy" ngay trên giao diện xem video.

### 4. Hệ thống gợi ý (Rule-based Recommendation)
Hệ thống sử dụng thuật toán chấm điểm hành vi (Scoring Engine) thay vì AI API bên ngoài để bảo mật và tối ưu chi phí:
- **Điểm tương tác**: View (1đ), Like (5đ), Comment (10đ), Mua hàng (50đ).
- **Category Affinity**: Gợi ý dựa trên mức độ yêu thích danh mục sản phẩm.
- **Decay Factor**: Ưu tiên các tương tác gần nhất, giảm trọng số theo thời gian.

---

## 🛠️ Công nghệ sử dụng
- **Frontend**: React, TypeScript, Vite, TailwindCSS, Zustand, React Query.
- **Backend**: NestJS, TypeScript, Zod Validation, Passport (JWT + Facebook OAuth).
- **Database**: PostgreSQL (Main), Redis (Cache), Prisma ORM.
- **Media**: Cloudinary (Lưu trữ và tối ưu hóa hình ảnh/video).
- **DevOps**: Docker, TurboRepo, Playwright (E2E Testing).

---

## 🧠 AI-Driven Development
Dự án được thiết kế đặc biệt để tương tác với các AI Coding Assistant thông qua thư mục `/ai`:
- `ai/rules.md`: Các quy tắc lập trình nghiêm ngặt.
- `ai/architecture.md`: Mô tả chi tiết kiến trúc và logic nghiệp vụ.
- `ai/tasks/`: Quản lý tiến độ công việc theo dạng DAG (Directed Acyclic Graph).

---

## 🛠️ Hướng dẫn cài đặt nhanh
1. Clone repository.
2. Chạy `npm install` tại thư mục gốc.
3. Cấu hình file `.env` (Database URL, Cloudinary, Facebook API).
4. Chạy `docker-compose up -d` để khởi động Database.
5. Chạy `npx prisma migrate dev` để tạo bảng.
6. Chạy `npm run dev` để bắt đầu phát triển.

---
*Dự án được thiết kế và vận hành bởi hệ thống AI-Driven Architecture.*
