import { Router } from "express";
import { User } from "../../modules/users/user.model.js";

export const router = Router();

const userResponse = (doc) => {
  // Convert the Mongoose document to a plain object before hiding sensitive fields.
  const user = doc.toObject();
  delete user.password;
  return user;
};

// find all users
router.get("/", async (req, res) => {
  try {
    // Read all users from MongoDB.
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create new user
router.post("/", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    const err = new Error("username, email and password are required");

    err.name = "validationError";
    err.status = 400;
    return res.status(400).json({ success: false, error: err });
  }

  try {
    // Save the new user in MongoDB, then remove the password from the response.
    const doc = await User.create({ username, email, password, role });

    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/*Update user
router.put("/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  const { username, email, passwrod } = req.body;

  if (!username || !email || !passwrod) {
    return res
      .status(400)
      .json({ error: "username, email and passwrod not found" });
  }

  user.username = username;
  user.email = email;
  user.passwrod = passwrod;

  res.status(200).json(user);
});*/

/* delete user
router.delete("/:id", (req, res) => {
  // 1. หา "ตำแหน่ง index" ของ User ที่มี id ตรงกับที่ส่งมา
  // อย่าลืม u.id (ตัวเล็ก) ให้ตรงกับ Data นะคะเอม!
  const user = users.findIndex((u) => u.id === req.params.id);
  // 2. ถ้าหาไม่เจอ (findIndex จะคืนค่า -1) ให้ส่ง 404 กลับไป
  if (user === -1) {
    return res.status(404).json({ error: "user not found" });
  }
  // 3. ถ้าเจอ ให้ทำการลบออกจาก Array ด้วย .splice(ตำแหน่งที่เริ่ม, จำนวนที่จะลบ)
  const deleteUser = users.splice(user, 1);

  // 4. ส่งสถานะ 200 (หรือ 204 No Content) พร้อมข้อมูลคนที่โดนลบกลับไปเพื่อยืนยัน
  res.status(200).json({
    message: "User deleted successfully",
    deleteUser: deleteUser[0],
  });
});*/
