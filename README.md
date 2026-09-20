# ⚡ DRX HARDWARE — NEXT-GEN E-COMMERCE & PC BUILDER PLATFORM

> **Nền tảng thương mại điện tử chuyên cung cấp linh kiện máy tính, PC Gaming cao cấp, công cụ tự Build PC chuẩn tương thích và Trợ lý AI phần cứng thời gian thực.**

---

## 🌟 TÍNH NĂNG NỔI BẬT

- 🖥️ **DRX PC Builder**: Công cụ tự cấu hình PC thông minh, kiểm tra chuẩn Socket, RAM DDR4/DDR5, công suất nguồn PSU và độ dài card đồ họa theo thời gian thực.
- 🤖 **DRX CyberBot AI 2.0**: Trợ lý AI phân tích phần cứng, tư vấn cấu hình, tra cứu giá bán và giải đáp thắc mắc khách hàng kết nối trực tiếp kho dữ liệu Supabase.
- 🛡️ **Quản Lý Serial SN & Bảo Hành Điện Tử**: Quản lý từng mã Serial phần cứng, tự động chuyển trạng thái `AVAILABLE -> SOLD` khi đơn hàng giao thành công, tra cứu bảo hành 1 đổi 1 36 tháng không cần hóa đơn giấy.
- 💳 **Thanh Toán Tự Động VietQR & COD**: Tạo mã QR thanh toán ngân hàng tự động, xác thực giao dịch tức thì và hỗ trợ COD toàn quốc.
- 📦 **Bảng Điều Khiển Admin & Nhân Viên (Staff Portal)**: Quản lý sản phẩm, đơn hàng, kho serial, voucher giảm giá và báo cáo doanh thu trực quan.
- 🐳 **Dockerized 100%**: Đóng gói Multi-stage build siêu nhẹ (~110MB), sẵn sàng triển khai trên mọi VPS/Server với 1 dòng lệnh.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Thành phần | Công nghệ / Thư viện |
| :--- | :--- |
| **Frontend Core** | Next.js 14 (App Router, Server & Client Components), React 18, TypeScript |
| **Styling & UI** | Tailwind CSS 3.4, Framer Motion, Lucide Icons, Tabler Icons |
| **Database & Auth** | Supabase (PostgreSQL), Prisma ORM v5, Row Level Security |
| **AI Engine** | DeepSeek Chat API, Groq Cloud (Llama 3.3 70B), Custom Realtime Knowledge Graph |
| **Payment Gateway** | VietQR API (Dynamic QR Code Generation) |
| **Containerization** | Docker, Docker Compose (Multi-stage Alpine Runner) |

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 20.x trở lên
- **Docker Desktop** (Tùy chọn nếu muốn chạy qua Container)
- **NPM** hoặc **Yarn / PNPM**

### 2. Cài đặt Dependencies
```bash
# Clone repository
git clone https://github.com/vobaolan/DRXHardware.git
cd DRXHardware

# Cài đặt các gói thư viện
npm install

# Khởi tạo Prisma Client
npx prisma generate
```

### 3. Cấu hình biến môi trường (`.env.local` hoặc `.env`)
Tạo file `.env.local` tại thư mục gốc với các thông số sau:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Connection
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?sslmode=require"

# AI Chatbot Keys
DEEPSEEK_API_KEY=sk-your-deepseek-key
GROQ_API_KEY=gsk_your-groq-key
```

### 4. Chạy ở môi trường Development
```bash
npm run dev
```
👉 Truy cập: `http://localhost:3000`

### 5. Build & Chạy Production
```bash
npm run build
npm run start
```

---

## 🐳 TRIỂN KHAI BẰNG DOCKER

Dự án đã được tích hợp sẵn `Dockerfile` (Multi-stage build) và `docker-compose.yml`:

```bash
# 1. Build Image và Khởi chạy container ngầm
docker compose up -d --build

# 2. Xem log hoạt động
docker compose logs -f

# 3. Kiểm tra trạng thái Container
docker ps

# 4. Dừng container
docker compose down
```

👉 Container sẽ tự động lắng nghe tại cổng `http://localhost:3000` với cơ chế Healthcheck định kỳ 30 giây.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
DRXHardware/
├── prisma/                  # Schema Database PostgreSQL & Migrations
│   └── schema.prisma
├── public/                  # Static assets (Banners, Icons, Images)
├── src/
│   ├── app/                 # Next.js 14 App Router (Pages & API Routes)
│   │   ├── admin/           # Admin Dashboard (Sản phẩm, Đơn hàng, Serials, Coupons)
│   │   ├── staff/           # Staff Dashboard (Đơn hàng & Vận chuyển, Serial Sold)
│   │   ├── pc-builder/      # Trang cấu hình PC thông minh
│   │   ├── products/        # Trang danh mục, chi tiết sản phẩm, best-sellers
│   │   ├── warranty/        # Trang tra cứu bảo hành Serial SN
│   │   ├── api/             # API Endpoints (Orders, Products, Chat, Coupons...)
│   │   └── page.tsx         # Trang chủ DRX Hardware (Showcases, Banners, Categories)
│   ├── components/          # Reusable UI Components (Header, Footer, Chatbot, Modals)
│   └── lib/                 # Core Libraries
│       ├── chatbot/         # AI Routing, Realtime DB Knowledge, Prompting Engine
│       ├── hardware-data.ts # Dữ liệu phần cứng dự phòng & cấu hình danh mục
│       └── supabase.ts      # Khởi tạo kết nối Supabase Client
├── Dockerfile               # Docker Multi-stage build (Alpine Linux Standalone)
├── docker-compose.yml       # Docker Compose Orchestration & Healthcheck
├── next.config.mjs          # Cấu hình Next.js (Standalone, CSP Security Headers)
└── package.json             # Danh sách dependencies và scripts
```

---

## 🛡️ BẢO MẬT & HIỆU NĂNG

- **Content Security Policy (CSP)**: Thiết lập bảo mật chống XSS, Clickjacking và Injection attacks trong `next.config.mjs`.
- **Standalone Build**: Tối ưu hóa bundle kích thước nhỏ gọn, loại bỏ thư viện thừa khi chạy production.
- **Data Integrity**: Giao dịch trừ kho & đổi trạng thái Serial SN đảm bảo tính nhất quán giữa Đơn hàng và Kho linh kiện.

---

## 📄 BẢN QUYỀN
Phát triển bởi **DRX Hardware Team** © 2026. Mọi quyền được bảo lưu.
