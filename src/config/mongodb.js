// import Mongoose เพื่อใช้เชื่อมต่อ MongoDB Atlas
import mongoose from "mongoose";

// ฟังก์ชันนี้ใช้เปิดการเชื่อมต่อ MongoDB ตอน server เริ่มทำงาน
export async function connectDB() {
  // ชื่อตัวแปรนี้ต้องตรงกับที่ตั้งไว้ในไฟล์ .env
  const uri = process.env.MONGODB_URI;

  try {
    // เชื่อมต่อ MongoDB ก่อนที่ server จะเริ่มรับ request
    await mongoose.connect(uri, { dbName: "jsd12-express-app" });
    // แสดงข้อความเมื่อเชื่อมต่อสำเร็จ
    console.log("MongoDB connected ✅");
  } catch (err) {
    // แสดง error เต็มเพื่อช่วย debug กรณี URI ผิด auth ผิด หรือ network มีปัญหา
    console.log("MongoDB connection error ❌", err);

    // โยน error ต่อ เพื่อไม่ให้ server รันต่อทั้งที่ฐานข้อมูลยังต่อไม่ได้
    throw err;
  }
}
