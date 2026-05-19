// import ฟังก์ชัน createClient สำหรับสร้าง supabase client
import { createClient } from "@supabase/supabase-js";

// อ่าน URL ของโปรเจกต์ Supabase จากไฟล์ .env
const supabaseUrl = process.env.SUPABASE_URL;
// อ่าน secret key ของ Supabase จากไฟล์ .env
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

// สร้าง supabase client กลางไว้ใช้ทั้งแอป
export const supabase = createClient(supabaseUrl, supabaseKey);

// ฟังก์ชันนี้ใช้ทดสอบการเชื่อมต่อ Supabase ตอน server เริ่มทำงาน
export async function connectSupabase() {
  try {
    // ลอง query เบา ๆ เพื่อตรวจสอบว่า key ใช้งานได้และเข้าถึงตาราง users ได้
    const { error } = await supabase.from("users").select("id").limit(1);
    // ถ้ามี error ให้โยนเข้า catch
    if (error) throw error;
    // แสดงข้อความเมื่อเชื่อมต่อสำเร็จ
    console.log("Supabase connected ✅");
  } catch (err) {
    // แสดงรายละเอียด error เพื่อช่วย debug
    console.error("Supabase connection error ❌", err);
    // โยน error ต่อ เพื่อไม่ให้ server รันต่อทั้งที่ Supabase ยังมีปัญหา
    throw err;
  }
}
