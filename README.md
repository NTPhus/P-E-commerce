# P-E-commerce: Commerce Core MVP

## Tổng quan
P-E-commerce hiện đang ở giai đoạn `Commerce Core MVP` với trọng tâm là giao dịch giữa `Buyer`, `Seller`, và `Admin`. Repo đã có runtime thật cho:

- Catalog sản phẩm và category
- Auth JWT cơ bản
- Cart theo rule `single-seller`
- Checkout COD
- Order lifecycle cho buyer, seller, admin
- Media upload cho seller/admin
- Chat module nền tảng ở mức in-memory/websocket

Phần social feed, short-video commerce, recommendation, affiliate và OAuth vẫn là roadmap, chưa phải runtime chính của repo hiện tại.

## Cấu trúc repo
```text
.
├── apps
│   ├── web          # Buyer/Seller commerce UI (React + Vite)
│   ├── api          # NestJS API + Prisma/Postgres commerce backend
│   └── admin        # Admin operations dashboard (React + Vite)
├── ai               # Docs, planning memory, agent scaffolding
└── docker-compose.yml
```

## Tính năng đã có

### Buyer
- Đăng ký / đăng nhập JWT
- Xem catalog, lọc theo category, xem product detail
- Thêm vào cart
- Checkout COD
- Xem order history
- Hủy đơn khi trạng thái còn `CONFIRMED`

### Seller
- Tạo / sửa / archive sản phẩm
- Upload ảnh sản phẩm qua media API
- Xem incoming orders liên quan đến sản phẩm của mình
- Chuyển trạng thái đơn `CONFIRMED -> SHIPPING -> COMPLETED`

### Admin
- Xem operations metrics
- Quản lý category
- Xem toàn bộ order
- Override trạng thái order khi cần

## Tech stack thực tế
- Frontend: React, Vite
- Backend: NestJS, Prisma, PostgreSQL, JWT tự quản
- Media: ImageKit
- Infra local: Docker Compose cho Postgres
- Tests: Jest cho API, Vitest cho web

## Chạy local
1. Chạy `docker-compose up -d`
2. Kiểm tra Postgres đã mở cổng `5432` và đang dùng DB `p_ecommerce`
3. Trong `apps/api`: `npm install`
4. Trong `apps/api`: `npm run prisma:generate`
5. Trong `apps/api`: `npm run prisma:push`
6. Trong `apps/api`: `npm run prisma:seed`
7. Chạy `npm run dev` trong từng app cần dùng:
   - `apps/api`
   - `apps/web`
   - `apps/admin`

## Runtime health check
- API health endpoint: `GET http://localhost:3000/v1/health`
- Endpoint này trả trạng thái `api` và `database`, kèm `databaseUrl` đã được mask password.
- Nếu `services.database.ok = false`, backend đang không dùng được catalog/cart/order runtime thật.

## Khi gặp lỗi Prisma ở catalog
- Nếu thấy lỗi như `Invalid this.prisma.product.findMany()` hoặc `category.findMany()`, nguyên nhân thường không nằm ở query đó mà là:
  - Postgres chưa chạy
  - `DATABASE_URL` sai
  - schema local chưa được `prisma:push`
  - DB đang thiếu bảng/cột commerce mới
- Bản hiện tại của API sẽ fail-fast ở bootstrap và log rõ hơn khi DB/schema chưa sẵn sàng.
- Quy trình xử lý chuẩn:
  1. Chạy lại `docker-compose up -d`
  2. Xác nhận `.env` của `apps/api` đang dùng `postgresql://postgres:postgres@localhost:5432/p_ecommerce?schema=public`
  3. Chạy `npm run prisma:push`
  4. Chạy `npm run prisma:seed`
  5. Gọi `GET /v1/health`

## Demo accounts
- Buyer: `buyer@example.com / buyer123`
- Seller: `seller@example.com / seller123`
- Admin: `admin@example.com / admin123`

## Trạng thái roadmap
- Đã làm: commerce core + seller/admin operations cơ bản
- Chưa làm: voucher, online payment, search nâng cao, social graph, feed, video commerce, recommendation, affiliate
