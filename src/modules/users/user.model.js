import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    email: { type: String, require: true, unique: true, lowercase: true },
    password: { type: String, require: true, minlength: 8, Select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
