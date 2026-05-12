import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { Visit } from "../models/Visit.js";

const router = Router();

router.get("/analytics", auth("manager"), async (_req, res) => {
  const totalPatients = await Visit.countDocuments();
  const activeConsultations = await Visit.countDocuments({ status: "in_consultation" });
  const completedConsultations = await Visit.countDocuments({ status: "completed" });
  const byDepartment = await Visit.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 }, avgSeverity: { $avg: "$severity" } } }
  ]);

  res.json({ totalPatients, activeConsultations, completedConsultations, byDepartment });
});

export default router;
