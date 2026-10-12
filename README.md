# salapaew ♡ shop starter

เว็บหน้าร้านโทน pastel pink / mint จากภาพอ้างอิง มีสินค้าเดโม ตะกร้า หน้าขอบคุณ และหน้าตัวอย่างหลังบ้าน

## สิ่งที่มีในชุดนี้
- `index.html` หน้าร้านและ checkout แบบตัวอย่าง
- `style.css` ธีม responsive สำหรับมือถือและคอมพิวเตอร์
- `app.js` สินค้าตัวอย่าง / ตะกร้า / หน้าขอบคุณ
- `admin.html` โครงหน้าเข้าสู่ระบบและภาพรวมหลังบ้าน (ยังไม่เชื่อม Auth)
- `supabase-schema.sql` โครงสร้างฐานข้อมูลที่ควรใช้กับระบบจริง

## ข้อจำกัดสำคัญ
**นี่คือ frontend starter ไม่ใช่ระบบขายของ production ที่เชื่อมฐานข้อมูลแล้ว** การสั่งซื้อในตอนนี้เป็นเดโม และเลข SLPxxxx ใช้ `sessionStorage` จึงไม่ใช่เลขออเดอร์กลางที่ปลอดภัยหรือรันต่อข้ามอุปกรณ์ได้ ห้ามใช้รับออเดอร์จริงจนกว่าจะเชื่อม backend ตามขั้นตอนด้านล่าง

## Deploy หน้าเว็บด้วย GitHub Pages
1. สร้าง repository ใหม่ชื่อ `salapaew-shop` ใน GitHub
2. อัปโหลด `index.html`, `admin.html`, `style.css`, `app.js` และไฟล์นี้
3. เปิด **Settings → Pages** เลือก Deploy from a branch → `main` → `/ (root)` → Save
4. GitHub Pages ให้บริการเฉพาะ frontend แบบ static ไม่สามารถเก็บความลับหรือรัน backend ได้

## เตรียม Supabase สำหรับระบบจริง
1. สร้างโปรเจกต์ใน Supabase
2. เปิด SQL Editor แล้วรัน `supabase-schema.sql`
3. ใน Authentication สร้างผู้ใช้แอดมิน แล้วเพิ่ม UUID ของผู้ใช้ในตาราง `admins` ตาม SQL comment
4. เปิด Storage สร้าง bucket ชื่อ `payment-slips` แบบ **private** และตั้ง policy ให้ลูกค้าส่งไฟล์ได้เฉพาะโฟลเดอร์ของออเดอร์ที่ตนกำลังสร้าง (ควรใช้ Edge Function เพื่อออก signed upload URL)
5. เพิ่ม Supabase URL และ **publishable/anon key เท่านั้น** ใน frontend config (ห้ามใช้ service_role key)
6. ย้ายการสร้างออเดอร์ไป Supabase RPC/Edge Function เพื่อจัดสรรเลขออเดอร์แบบ atomic, ตรวจราคาจากตาราง products ฝั่ง server, และจำกัดความถี่การสั่งซื้อ
7. สร้าง Edge Function สำหรับแอดมิน: ตรวจสิทธิ์จาก Supabase Auth + ตาราง admins ทุกครั้งก่อนเปลี่ยนสถานะออเดอร์/จัดการสินค้า
8. เพิ่ม RLS policies ให้ตาราง orders, order_items, products และ storage เป็น private-by-default และทดสอบด้วยบัญชีลูกค้ากับบัญชีที่ไม่ใช่แอดมิน

## เลขออเดอร์ SLP0001, SLP0002…
ต้องสร้างเลขจาก sequence ใน PostgreSQL เท่านั้น ไม่ใช้เลขที่คำนวณใน browser เพราะลูกค้าแก้ไขได้และอาจซ้ำกันได้ SQL starter ด้านล่างเตรียม sequence ไว้ให้ แต่ควรเรียกผ่านฟังก์ชันที่ตรวจสอบข้อมูล/ราคาในฝั่ง server เท่านั้น

## ก่อนเปิดขายจริง
- เพิ่มข้อมูลบัญชีรับโอนในหน้า checkout
- เพิ่มขั้นตอนแนบสลิปโดยใช้ private storage และตรวจสอบ MIME/type/ขนาดไฟล์
- สร้างหน้า track order โดยใช้ token สุ่มที่คาดเดาไม่ได้ ไม่เปิดดูด้วยเลขออเดอร์อย่างเดียว
- ทดสอบยอดรวม, สต็อก, เลขออเดอร์, สิทธิ์แอดมิน, การอัปโหลดไฟล์ และการปฏิเสธผู้ใช้ที่ไม่ได้รับอนุญาต
