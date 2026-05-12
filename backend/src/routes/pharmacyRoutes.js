import { Router } from "express";
import { Visit } from "../models/Visit.js";
import { Patient } from "../models/Patient.js";
import { Prescription } from "../models/Prescription.js";
import { Order } from "../models/Order.js";

const router = Router();

router.post("/verify", async (req, res) => {
  const { tokenNumber, phone, otp } = req.body;
  if (otp !== "123456") return res.status(401).json({ message: "Invalid OTP" });

  const visit = await Visit.findOne({ tokenNumber }).populate("doctorId");
  if (!visit) return res.status(404).json({ message: "Visit not found" });
  const patient = await Patient.findById(visit.patientId);
  if (!patient || patient.phone !== phone) return res.status(401).json({ message: "Invalid patient details" });
  const prescription = await Prescription.findOne({ visitId: visit._id });
  if (!prescription) return res.status(404).json({ message: "Prescription not ready" });

  return res.json({
    visit,
    patient,
    prescription: {
      ...prescription.toObject(),
      doctorName: visit.doctorId?.name || "Doctor"
    }
  });
});

router.post("/order", async (req, res) => {
  const { prescriptionId, patientId, items = [] } = req.body;
  const order = await Order.create({ prescriptionId, patientId, items, totalAmount: items.reduce((sum, i) => sum + i.quantity * 12, 0) });
  return res.status(201).json(order);
});

export default router;
