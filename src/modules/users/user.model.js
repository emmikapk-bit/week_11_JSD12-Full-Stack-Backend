// import Mongoose เพื่อใช้สร้าง schema และ model ของ MongoDB
import mongoose from "mongoose";

// กำหนดโครงสร้างของข้อมูล user 1 รายการใน MongoDB
const userSchema = new mongoose.Schema(
  {
    // trim จะช่วยตัดช่องว่างหน้า-หลังของ username ก่อนบันทึก
    username: { type: String, required: true, trim: true },
    // role อนุญาตได้แค่ user หรือ admin และถ้าไม่ส่งมาจะใช้ user
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // ต้องสะกด required ให้ถูก ไม่งั้น Mongoose จะไม่เช็กฟิลด์นี้
    email: { type: String, required: true, unique: true, lowercase: true },
    // select: false จะซ่อน password จากผลลัพธ์ query ปกติโดยอัตโนมัติ
    password: { type: String, required: true, minlength: 8, select: false },
  },
  // timestamps: true จะสร้าง createdAt และ updatedAt ให้อัตโนมัติ
  { timestamps: true },
);

// export model ออกไปเพื่อให้ route เรียกใช้ เช่น User.find() หรือ User.create()
export const User = mongoose.model("User", userSchema);
