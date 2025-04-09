# MixTrip Summer

MixTrip Summer เป็นแอปพลิเคชันวางแผนและแชร์ทริปการท่องเที่ยว ที่ช่วยให้ผู้ใช้สามารถสร้าง แชร์ และค้นหาแผนการเดินทางได้อย่างสะดวก

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
- MongoDB and Mongoose
- EJS templates
- RESTful API architecture

## ผู้พัฒนา

MixTrip Team
