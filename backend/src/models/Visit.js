import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    tokenNumber: { type: String, required: true, unique: true, index: true },
    symptoms_original: { type: String, required: true },
    symptoms_english: { type: String, required: true },
    severity: { type: Number, min: 1, max: 10, required: true },
    department: { type: String, required: true, index: true },
    status: { type: String, enum: ["registered", "in_queue", "in_consultation", "completed"], default: "registered", index: true },
    priority: { type: Number, required: true },
    qrCode: { type: String }
  },
  { timestamps: true }
);

visitSchema.index({ department: 1, status: 1, priority: -1, createdAt: 1 });

export const Visit = mongoose.model("Visit", visitSchema);
