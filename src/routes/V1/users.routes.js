import { Router } from "express";
import { users } from "../../fakeData/fakeUsers.js";

export const router = Router();

// find all users
router.get("/", (req, res) => {
  res.json(users);
});

// find user id
router.get("/:id", (req, res) => {
  const user = users.find((u) => String(u.id) === String(req.params.id));
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  res.json(user);
});

// Create new user
router.post("/", (req, res) => {
  const { username, email, passwrod } = req.body || {};

  if (!username || !email) {
    return res.status(400).json("username and email are required");
  }

  const nextId = String(
    (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
  );

  const newUser = { id: nextId, username, email, passwrod };

  users.push(newUser);
  return res.status(201).json(newUser);
});

//Update user
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
});

// delete user
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
});

//router.patch("");
