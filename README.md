# MixTrip Summer

MixTrip Summer เป็นแอปพลิเคชันวางแผนและแชร์ทริปการท่องเที่ยว ที่ช่วยให้ผู้ใช้สามารถสร้าง แชร์ และค้นหาแผนการเดินทางได้อย่างสะดวก

## สถานะโครงการ

โครงการนี้กำลังอยู่ระหว่างการพัฒนา โดยแบ่งการพัฒนาออกเป็น 7 เฟส ตามแผนงานที่กำหนดไว้ใน Kanban Board

**สถานะปัจจุบัน**: กำลังพัฒนา Phase 2 - ระบบผู้ใช้และการยืนยันตัวตน

### ความคืบหน้า

#### เฟส 1: โครงสร้างพื้นฐาน (เสร็จสมบูรณ์)
- ✅ สร้าง GitHub Repository และโครงสร้างโฟลเดอร์ MVC
- ✅ ติดตั้ง Node.js, Express และ dependencies หลัก
- ✅ ตั้งค่า Environment Variables และระบบ Configuration
- ✅ ตั้งค่า MongoDB และเชื่อมต่อกับแอปพลิเคชัน
- ✅ ออกแบบและสร้างโครงสร้างฐานข้อมูลพื้นฐาน
- ✅ สร้าง Mongoose models ตาม schema ที่ออกแบบไว้
- ✅ วางระบบจัดการการเชื่อมต่อฐานข้อมูลและ connection pooling
- ✅ สร้างโครงสร้าง RESTful API พื้นฐาน และ route handlers
- ✅ พัฒนา Error Handling Middleware สำหรับ API
- ✅ สร้างระบบ API Documentation พื้นฐาน (Swagger/OpenAPI)
- ✅ วางระบบ API Versioning เพื่อความยืดหยุ่นในอนาคต
- ✅ สร้างโครงสร้าง View Engine (EJS) และ Template พื้นฐาน
- ✅ ออกแบบและสร้าง Layout พื้นฐาน (Header, Footer, Navigation)
- ✅ สร้างหน้า Home แบบพื้นฐานและ Error Pages

#### เฟส 2: ระบบผู้ใช้และการยืนยันตัวตน (กำลังพัฒนา)
- ✅ พัฒนาโมเดล User ตามโครงสร้างที่ออกแบบไว้
- ✅ สร้าง API Endpoints สำหรับการจัดการผู้ใช้
- ✅ พัฒนาระบบการเข้ารหัสรหัสผ่านและความปลอดภัย
- 🔄 สร้างระบบ Role-based Access Control
- 🔄 พัฒนาหน้าลงทะเบียนผู้ใช้ (Frontend)
- 🔄 สร้างระบบตรวจสอบข้อมูลการลงทะเบียน (Validation)
- 🔄 พัฒนาหน้าเข้าสู่ระบบ (Frontend)
- 🔄 วางระบบ Session/JWT Authentication
- ⬜ พัฒนาหน้าโปรไฟล์ผู้ใช้ (Frontend)
- ⬜ สร้างระบบการแก้ไขข้อมูลส่วนตัว
- ⬜ พัฒนาระบบการอัปโหลดและจัดการรูปโปรไฟล์
- ⬜ สร้างระบบตั้งค่าความปลอดภัยและความเป็นส่วนตัว
- ⬜ พัฒนาระบบยืนยันอีเมล
- ⬜ สร้างระบบลืมรหัสผ่านและการรีเซ็ตรหัสผ่าน
- ⬜ พัฒนาระบบป้องกันการโจมตี (Rate Limiting, CSRF Protection)
- ⬜ วางระบบการล็อกเอาต์อัตโนมัติและความปลอดภัยของเซสชัน

## คุณสมบัติหลัก

- สร้างและจัดการทริปการเดินทาง
- เพิ่มสถานที่และกิจกรรมในทริป
- วางแผนกิจกรรมรายวัน (Itinerary)
- แชร์ทริปกับผู้อื่น
- ค้นหาทริปที่น่าสนใจ
- แสดงเส้นทางบนแผนที่

## การติดตั้ง

```bash
# Clone repository
git clone <github-repository-url>
cd Mixtrip_Summer

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env (ดูตัวอย่างจาก .env.example)

# รันในโหมด development
npm run dev

# รันในโหมด production
npm start
```

## โครงสร้างโปรเจค

```
Mixtrip_Summer/
├── src/
│   ├── controllers/      # Logic controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── views/            # EJS templates
│   ├── middlewares/      # Express middlewares
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── public/
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side scripts
│   └── images/           # Images
├── logs/                 # Application logs
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

## การพัฒนา

โปรเจคนี้ถูกพัฒนาด้วย:

- Node.js และ Express
- MongoDB และ Mongoose
- EJS templates
- RESTful API architecture
- JWT และ Session-based Authentication

## แนวทางการพัฒนาต่อไป

### แผนงานระยะสั้น (Short-term)
1. **เสร็จสิ้น Phase 2** - ระบบผู้ใช้และการยืนยันตัวตน
   - พัฒนาหน้าโปรไฟล์ผู้ใช้และการแก้ไขข้อมูลส่วนตัว
   - ทำระบบอัปโหลดรูปโปรไฟล์ให้สมบูรณ์
   - พัฒนาระบบตั้งค่าความปลอดภัยและความเป็นส่วนตัว
   - สร้างระบบยืนยันอีเมลและลืมรหัสผ่าน
   - เพิ่มการป้องกันการโจมตี (Rate Limiting, CSRF)

2. **เริ่ม Phase 3** - ระบบทริปและสถานที่
   - พัฒนาโมเดล Trip และ Location
   - สร้างความสัมพันธ์ระหว่าง User, Trip และ Location
   - พัฒนา API Endpoints สำหรับจัดการทริปและสถานที่
   - พัฒนาหน้าสร้างทริปใหม่และระบบอัปโหลดรูปภาพปกทริป

### แผนงานระยะกลาง (Medium-term)
1. **Phase 4** - ระบบความเป็นส่วนตัวและการแชร์
2. **Phase 5** - ระบบปฏิสัมพันธ์ระหว่างผู้ใช้ (คอมเมนต์, การแจ้งเตือน)

### แผนงานระยะยาว (Long-term)
1. **Phase 6** - ระบบค้นหาและกรอง
2. **Phase 7** - ระบบโซเชียลและการปรับแต่ง UI

## การติดตามความคืบหน้า

โครงการนี้ใช้ Kanban Board ในการติดตามความคืบหน้า โดยแบ่งงานออกเป็น:
- **To Do**: งานที่รอดำเนินการ
- **In Progress**: งานที่กำลังดำเนินการ
- **Done**: งานที่เสร็จสมบูรณ์แล้ว
- **Block or Future Features**: คุณลักษณะที่จะพัฒนาในอนาคตหรืองานที่ติดขัด

## ผู้พัฒนา

MixTrip Team
