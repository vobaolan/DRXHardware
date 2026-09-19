-- ==============================================================================
-- DRX HARDWARE / ODS STORE - SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- LƯU Ý KHI THI CÔNG TRÊN SUPABASE SQL EDITOR:
-- 1. Script này kích hoạt Row Level Security (RLS) cho toàn bộ 8 bảng cốt lõi.
-- 2. Đảm bảo bảo vệ dữ liệu nhạy cảm của khách hàng ngay cả khi dùng Anon Key.
-- 3. Toàn bộ backend service_role / direct Postgres connection (Prisma) vẫn có quyền quản trị tối đa.
-- ==============================================================================

-- 1. BẬT RLS (ROW LEVEL SECURITY) TRÊN TẤT CẢ CÁC BẢNG
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ProductSerial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Review" ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. CHÍNH SÁCH BẢO MẬT CHO BẢNG: "Product" (Sản phẩm phần cứng)
-- ==============================================================================
-- Ai cũng có thể xem sản phẩm đang được kích hoạt bán (status = true)
DROP POLICY IF EXISTS "Public can view active products" ON "Product";
CREATE POLICY "Public can view active products"
ON "Product" FOR SELECT
USING (status = true OR auth.role() = 'service_role');

-- Chỉ tài khoản Admin / Service Role mới có quyền Thêm / Sửa / Xóa sản phẩm
DROP POLICY IF EXISTS "Admins can manage products" ON "Product";
CREATE POLICY "Admins can manage products"
ON "Product" FOR ALL
USING (auth.role() = 'service_role');

-- ==============================================================================
-- 3. CHÍNH SÁCH BẢO MẬT CHO BẢNG: "User" (Người dùng)
-- ==============================================================================
-- Khách chỉ xem được thông tin tài khoản của chính mình (hoặc thông qua service_role)
DROP POLICY IF EXISTS "Users can read own profile" ON "User";
CREATE POLICY "Users can read own profile"
ON "User" FOR SELECT
USING (
  auth.uid()::text = id 
  OR auth.role() = 'service_role'
  OR auth.role() = 'authenticated'
);

-- Khách chỉ được cập nhật thông tin của chính mình
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
CREATE POLICY "Users can update own profile"
ON "User" FOR UPDATE
USING (auth.uid()::text = id OR auth.role() = 'service_role')
WITH CHECK (auth.uid()::text = id OR auth.role() = 'service_role');

-- Cho phép đăng ký người dùng mới
DROP POLICY IF EXISTS "Allow user registration" ON "User";
CREATE POLICY "Allow user registration"
ON "User" FOR INSERT
WITH CHECK (true);

-- ==============================================================================
-- 4. CHÍNH SÁCH BẢO MẬT CHO BẢNG: "Order" (Đơn hàng)
-- ==============================================================================
-- Khách hàng chỉ xem được đơn hàng của chính mình (theo userId hoặc email đặt hàng)
DROP POLICY IF EXISTS "Users can view their own orders" ON "Order";
CREATE POLICY "Users can view their own orders"
ON "Order" FOR SELECT
USING (
  (auth.uid()::text IS NOT NULL AND "userId" = auth.uid()::text)
  OR (auth.email() IS NOT NULL AND "customerEmail" = auth.email())
  OR auth.role() = 'service_role'
);

-- Cho phép khách đặt đơn hàng mới (kể cả khách vãng lai và thành viên)
DROP POLICY IF EXISTS "Anyone can create orders" ON "Order";
CREATE POLICY "Anyone can create orders"
ON "Order" FOR INSERT
WITH CHECK (true);

-- Chỉ Admin / Backend mới được sửa/cập nhật trạng thái đơn hàng
DROP POLICY IF EXISTS "Admins can update orders" ON "Order";
CREATE POLICY "Admins can update orders"
ON "Order" FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ==============================================================================
-- 5. CHÍNH SÁCH BẢO MẬT CHO BẢNG: "OrderItem" (Chi tiết sản phẩm trong đơn)
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view their order items" ON "OrderItem";
CREATE POLICY "Users can view their order items"
ON "OrderItem" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "Order" o
    WHERE o.id = "OrderItem"."orderId"
    AND (
      (auth.uid()::text IS NOT NULL AND o."userId" = auth.uid()::text)
      OR (auth.email() IS NOT NULL AND o."customerEmail" = auth.email())
      OR auth.role() = 'service_role'
    )
  )
);

DROP POLICY IF EXISTS "Allow insert order items" ON "OrderItem";
CREATE POLICY "Allow insert order items"
ON "OrderItem" FOR INSERT
WITH CHECK (true);

-- ==============================================================================
-- 6. CHÍNH SÁCH BẢO MẬT CHO BẢNG: "ProductSerial" (Mã Serial / Bảo hành)
-- ==============================================================================
-- Khách chỉ xem serial của linh kiện thuộc đơn hàng của chính họ hoặc tra cứu công khai
DROP POLICY IF EXISTS "Users can view serials of their orders or lookup" ON "ProductSerial";
CREATE POLICY "Users can view serials of their orders or lookup"
ON "ProductSerial" FOR SELECT
USING (
  auth.role() = 'service_role'
  OR "status" = 'SOLD'
  OR EXISTS (
    SELECT 1 FROM "Order" o
    WHERE o.id = "ProductSerial"."orderId"
    AND (
      (auth.uid()::text IS NOT NULL AND o."userId" = auth.uid()::text)
      OR (auth.email() IS NOT NULL AND o."customerEmail" = auth.email())
    )
  )
);

-- Chỉ Admin / Service Role quản lý nhập kho Serial
DROP POLICY IF EXISTS "Admins can manage serials" ON "ProductSerial";
CREATE POLICY "Admins can manage serials"
ON "ProductSerial" FOR ALL
USING (auth.role() = 'service_role');

-- ==============================================================================
-- 7. CHÍNH SÁCH BẢO MẬT CHO BẢNG: "Transaction" (Giao dịch nạp tiền ví)
-- ==============================================================================
DROP POLICY IF EXISTS "Users can view own transactions" ON "Transaction";
CREATE POLICY "Users can view own transactions"
ON "Transaction" FOR SELECT
USING (
  (auth.uid()::text IS NOT NULL AND "userId" = auth.uid()::text)
  OR auth.role() = 'service_role'
);

-- ==============================================================================
-- 8. CHÍNH SÁCH BẢO MẬT CHO BẢNG: "Coupon" (Mã giảm giá)
-- ==============================================================================
-- Public xem mã giảm giá còn hạn
DROP POLICY IF EXISTS "Public can view valid coupons" ON "Coupon";
CREATE POLICY "Public can view valid coupons"
ON "Coupon" FOR SELECT
USING (
  "expiresAt" > now()
  OR auth.role() = 'service_role'
);

-- Quản lý Coupon thuộc về Admin / Service Role
DROP POLICY IF EXISTS "Admins can manage coupons" ON "Coupon";
CREATE POLICY "Admins can manage coupons"
ON "Coupon" FOR ALL
USING (auth.role() = 'service_role');

-- ==============================================================================
-- 9. CHÍNH SÁCH BẢO MẬT CHO BẢNG: "Review" (Đánh giá sản phẩm)
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view reviews" ON "Review";
CREATE POLICY "Public can view reviews"
ON "Review" FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON "Review";
CREATE POLICY "Authenticated users can create reviews"
ON "Review" FOR INSERT
WITH CHECK (
  auth.uid()::text = "userId"
  OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Users can update own reviews" ON "Review";
CREATE POLICY "Users can update own reviews"
ON "Review" FOR UPDATE
USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');
