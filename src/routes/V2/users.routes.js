// import Router มาจาก Express เพื่อใช้สร้างชุดเส้นทางของ API
import { Router } from "express";
// import ตัวช่วยเช็กว่า id ของ MongoDB อยู่ในรูปแบบ ObjectId ที่ถูกต้องหรือไม่
import { isValidObjectId } from "mongoose";
// import model User สำหรับใช้ query ข้อมูลจาก MongoDB ผ่าน Mongoose
import { User } from "../../modules/users/user.model.js";
// import supabase client กลาง สำหรับ query ข้อมูลจาก PostgreSQL
import { supabase } from "../../config/supabase.js";

// สร้าง router สำหรับ endpoint ใต้ `/api/v2/users`
export const router = Router();

// ส่วนนี้คือ route ของ MongoDB ที่อยู่ใต้ `/api/v2/users`
// ฟังก์ชันนี้เอาไว้ลบข้อมูลสำคัญก่อนส่งกลับไปให้ client
const userResponse = (doc) => {
  // แปลง Mongoose document ให้เป็น object ปกติก่อนแก้ไขข้อมูล
  const user = doc.toObject();
  // ไม่ควรส่ง password กลับไปใน response
  delete user.password;
  // ส่ง object ที่ปลอดภัยกลับออกไป
  return user;
};

// ฟังก์ชันนี้ใช้สร้าง object สำหรับ update เฉพาะฟิลด์ที่ผู้ใช้ส่งเข้ามาจริง
const buildUpdatePayload = ({ username, email, password, role }) => {
  // เริ่มจาก object ว่างก่อน
  const payload = {};

  // ถ้ามี username ค่อยเพิ่มเข้า payload
  if (username !== undefined) payload.username = username;
  // ถ้ามี email ค่อยเพิ่มเข้า payload
  if (email !== undefined) payload.email = email;
  // ถ้ามี password ค่อยเพิ่มเข้า payload
  if (password !== undefined) payload.password = password;
  // ถ้ามี role ค่อยเพิ่มเข้า payload
  if (role !== undefined) payload.role = role;

  // ส่ง object ที่จะใช้สำหรับ update กลับไป
  return payload;
};

// GET /api/v2/users
// ต้องใช้ async เพราะ `User.find()` ทำงานแบบ promise
router.get("/", async (req, res) => {
  try {
    // ดึงข้อมูลผู้ใช้ทั้งหมดจาก MongoDB
    const users = await User.find();
    // ส่งข้อมูลกลับด้วยสถานะ 200
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    // ถ้า query ไม่สำเร็จ ให้ส่ง error กลับไป
    return res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/v2/users
// ต้องใช้ async เพราะ `User.create()` ทำงานแบบ promise
router.post("/", async (req, res) => {
  // ดึงค่าที่ส่งเข้ามาจาก request body
  const { username, email, password, role } = req.body || {};

  // ถ้าข้อมูลจำเป็นไม่ครบ ให้หยุดและส่ง error กลับทันที
  if (!username || !email || !password) {
    // สร้าง error สำหรับอธิบายว่าข้อมูลไม่ครบ
    const err = new Error("username, email and password are required");

    // ตั้งชื่อประเภท error เพื่อให้ debug ง่ายขึ้น
    err.name = "validationError";
    // เก็บสถานะ HTTP ที่สอดคล้องไว้ใน object error
    err.status = 400;
    // ส่ง error กลับไปให้ client
    return res.status(400).json({ success: false, error: err });
  }

  try {
    // บันทึก user ใหม่ลง MongoDB
    const doc = await User.create({ username, email, password, role });

    // ส่งข้อมูลที่บันทึกแล้วกลับไป โดยตัด password ออกก่อน
    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    // error จาก validation เช่น email ซ้ำ มักจะเข้ามาที่จุดนี้
    return res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/v2/users/:id
// ใช้สำหรับแก้ไขข้อมูล user ใน MongoDB แบบบางฟิลด์หรือทั้งก้อนก็ได้
router.put("/:id", async (req, res) => {
  // อ่าน id จาก URL parameter
  const { id } = req.params;
  // สร้าง payload สำหรับ update จาก request body
  const updates = buildUpdatePayload(req.body || {});

  // ถ้า id ไม่ใช่รูปแบบ ObjectId ที่ถูกต้อง ให้หยุดทันที
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      error: "รูปแบบ id ของ MongoDB ไม่ถูกต้อง",
    });
  }

  // ถ้าไม่มีฟิลด์ใดถูกส่งมาเลย ก็ยังไม่ควร update
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "กรุณาส่งข้อมูลอย่างน้อย 1 ฟิลด์เพื่ออัปเดต",
    });
  }

  try {
    // ค้นหา user ตาม id แล้วอัปเดตข้อมูล พร้อมคืนค่าเอกสารใหม่หลังอัปเดต
    const doc = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    // ถ้าไม่พบ user ตาม id ที่ส่งมา ให้ตอบกลับ 404
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบ user ที่ต้องการแก้ไขใน MongoDB",
      });
    }

    // ส่งข้อมูลที่อัปเดตสำเร็จกลับไป โดยไม่ส่ง password
    return res.status(200).json({ success: true, data: userResponse(doc) });
  } catch (error) {
    // ส่ง error จาก validation หรือฐานข้อมูลกลับไป
    return res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/v2/users/:id
// ใช้สำหรับลบ user ออกจาก MongoDB
router.delete("/:id", async (req, res) => {
  // อ่าน id จาก URL parameter
  const { id } = req.params;

  // ถ้า id ไม่ใช่รูปแบบ ObjectId ที่ถูกต้อง ให้หยุดทันที
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      error: "รูปแบบ id ของ MongoDB ไม่ถูกต้อง",
    });
  }

  try {
    // ค้นหาและลบ user ออกจาก MongoDB
    const doc = await User.findByIdAndDelete(id);

    // ถ้าไม่พบ user ที่ต้องการลบ ให้ตอบกลับ 404
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบ user ที่ต้องการลบใน MongoDB",
      });
    }

    // ส่งข้อมูลที่ถูกลบกลับไปยืนยัน โดยไม่ส่ง password
    return res.status(200).json({
      success: true,
      message: "ลบ user จาก MongoDB สำเร็จ",
      data: userResponse(doc),
    });
  } catch (error) {
    // ส่ง error จากฐานข้อมูลกลับไป
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Supabase
// ส่วนนี้คือ route ของ Supabase ที่อยู่ใต้ `/api/v2/users/pg`
// ชื่อคอลัมน์ต้องตรงกับ schema จริงในตาราง users ของ Supabase
// ตัวแปรนี้กำหนดว่าต้องการให้ Supabase ส่งคอลัมน์ไหนกลับมาบ้าง
const PG_SELECT = "id, username, email, role, created_at, updated_at";

// GET /api/v2/users/pg
// ต้องใช้ async เพราะคำสั่ง query ของ Supabase ทำงานแบบ asynchronous
router.get("/pg", async (req, res) => {
  try {
    // ดึงข้อมูลผู้ใช้ทั้งหมดจากตาราง users ใน Supabase
    const { data, error } = await supabase.from("users").select(PG_SELECT);

    // ถ้า Supabase ส่ง error กลับมา ให้โยนเข้า catch ทันที
    if (error) throw error;
    // ส่งข้อมูลกลับด้วยสถานะ 200
    return res.status(200).json({ success: true, data });
  } catch (error) {
    // ส่งข้อความ error ของฐานข้อมูลกลับไป
    return res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/v2/users/pg
// ต้องใช้ async เพราะคำสั่ง insert ของ Supabase คืนค่าเป็น promise
router.post("/pg", async (req, res) => {
  // ดึงค่าที่ส่งเข้ามาจาก request body
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    // ถ้าข้อมูลจำเป็นไม่ครบ ให้หยุดและส่ง error กลับทันที
    return res.status(400).json({
      success: false,
      error: "username, email, and password are required",
    });
  }

  try {
    // เพิ่มข้อมูลใหม่ลงตาราง users ของ Supabase
    const { data, error } = await supabase
      // เลือกตาราง users
      .from("users")
      // เพิ่มข้อมูลใหม่ โดยถ้าไม่ได้ส่ง role มา จะใช้ค่า user
      .insert({ username, email, password, role: role || "user" })
      // ให้ Supabase ส่งกลับเฉพาะคอลัมน์ที่ระบุใน PG_SELECT
      .select(PG_SELECT)
      // เพราะเพิ่มเพียง 1 แถว จึงแปลงผลลัพธ์ให้เป็น object เดียว
      .single();

    // ถ้า Supabase รายงาน error ให้โยนเข้า catch
    if (error) throw error;
    // ส่งข้อมูลที่เพิ่มสำเร็จกลับไปด้วยสถานะ 201
    return res.status(201).json({ success: true, data });
  } catch (error) {
    // ส่ง error จากการเพิ่มข้อมูลกลับไป
    return res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/v2/users/pg/:id
// ใช้สำหรับแก้ไขข้อมูล user ใน Supabase แบบบางฟิลด์หรือทั้งก้อนก็ได้
router.put("/pg/:id", async (req, res) => {
  // อ่าน id จาก URL parameter
  const { id } = req.params;
  // สร้าง payload สำหรับ update จาก request body
  const updates = buildUpdatePayload(req.body || {});

  // ถ้าไม่มีฟิลด์ใดถูกส่งมาเลย ก็ยังไม่ควร update
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "กรุณาส่งข้อมูลอย่างน้อย 1 ฟิลด์เพื่ออัปเดต",
    });
  }

  try {
    // ค้นหาแถวตาม id แล้วอัปเดตข้อมูลในตาราง users ของ Supabase
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select(PG_SELECT)
      .single();

    // ถ้า Supabase รายงาน error ให้โยนเข้า catch
    if (error) throw error;
    // ถ้าไม่พบข้อมูลหลัง update แปลว่าไม่มี user id นี้
    if (!data) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบ user ที่ต้องการแก้ไขใน Supabase",
      });
    }

    // ส่งข้อมูลที่อัปเดตสำเร็จกลับไป
    return res.status(200).json({ success: true, data });
  } catch (error) {
    // ส่ง error จากการอัปเดตกลับไป
    return res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/v2/users/pg/:id
// ใช้สำหรับลบ user ออกจาก Supabase
router.delete("/pg/:id", async (req, res) => {
  // อ่าน id จาก URL parameter
  const { id } = req.params;

  try {
    // ค้นหาแถวตาม id แล้วลบออกจากตาราง users
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select(PG_SELECT)
      .single();

    // ถ้า Supabase รายงาน error ให้โยนเข้า catch
    if (error) throw error;
    // ถ้าไม่พบข้อมูลที่ถูกลบ แปลว่าไม่มี user id นี้
    if (!data) {
      return res.status(404).json({
        success: false,
        error: "ไม่พบ user ที่ต้องการลบใน Supabase",
      });
    }

    // ส่งข้อมูลที่ถูกลบกลับไปยืนยัน
    return res.status(200).json({
      success: true,
      message: "ลบ user จาก Supabase สำเร็จ",
      data,
    });
  } catch (error) {
    // ส่ง error จากการลบกลับไป
    return res.status(400).json({ success: false, error: error.message });
  }
});
