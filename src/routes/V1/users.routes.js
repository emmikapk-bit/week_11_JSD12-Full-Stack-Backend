import { Router } from "express";
import { users } from "../../fakeData/fakeUsers.js";

export const router = Router();

router.get("/users", (req, res) => {
  res.json(users);
});

router.get("/users/:id", (req, res) => {
  const user = users.find((u) => String(u.ID) === String(req.params.id));
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  res.json(user);
});

router.post("/users", (req, res) => {
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

router.put("/users/:id", (req, res) => {
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

/*router.delete("/users/:id", (req, res) => {
    // 1. หา "ตำแหน่ง index" ของ User ที่มี id ตรงกับที่ส่งมา
    // อย่าลืม u.id (ตัวเล็ก) ให้ตรงกับ Data นะคะเอม!
    const user = users.find((u) => u.id === req.params.id);

    if(user === -1){

    
});*/

//router.patch("");
