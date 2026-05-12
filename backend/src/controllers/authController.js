import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Doctor } from "../models/Doctor.js";
import { Manager } from "../models/Manager.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role || "doctor", email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d"
  });
}

export async function doctorLogin(req, res) {
  const { email, password } = req.body;
  const doctor = await Doctor.findOne({ email });
  if (!doctor) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, doctor.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  return res.json({ token: signToken(doctor), doctor });
}

export async function managerLogin(req, res) {
  const { email, password } = req.body;
  const manager = await Manager.findOne({ email });
  if (!manager) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, manager.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  return res.json({ token: signToken(manager), manager });
}
