import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosagePerDay: { type: Number, required: true },
    days: { type: Number, required: true },
    totalQuantity: { type: Number, required: true },
    orderedQuantity: { type: Number, default: 0 }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true, unique: true, index: true },
    diagnosis: { type: String, required: true },
    medicines: { type: [medicineSchema], default: [] },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
