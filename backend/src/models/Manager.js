import mongoose from "mongoose";

const managerSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["manager"], default: "manager" }
  },
  { timestamps: true }
);

export const Manager = mongoose.model("Manager", managerSchema);
