import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    aadhaar: { type: String, required: true, unique: true, index: true },
    age: { type: Number, required: true },
    language: { type: String, default: "Hindi" },
    familyMembers: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
