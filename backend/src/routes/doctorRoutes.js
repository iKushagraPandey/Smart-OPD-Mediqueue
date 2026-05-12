import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { Visit } from "../models/Visit.js";
import { Prescription } from "../models/Prescription.js";

const router = Router();

router.get("/queue", auth("doctor"), async (req, res) => {
  const queue = await Visit.find({ doctorId: req.user.id, status: { $in: ["in_queue", "in_consultation"] } })
    .populate("patientId")
    .sort({ priority: -1, createdAt: 1 });
  res.json(queue);
});

router.post("/call-next", auth("doctor"), async (req, res) => {
  const next = await Visit.findOneAndUpdate(
    { doctorId: req.user.id, status: "in_queue" },
    { status: "in_consultation" },
    { sort: { priority: -1, createdAt: 1 }, new: true }
  ).populate("patientId");

  if (!next) return res.status(404).json({ message: "No queued patient found" });
  return res.json(next);
});

router.post("/complete/:visitId", auth("doctor"), async (req, res) => {
  const { diagnosis, medicines = [], notes = "" } = req.body;
  const visit = await Visit.findByIdAndUpdate(req.params.visitId, { status: "completed" }, { new: true });
  if (!visit) return res.status(404).json({ message: "Visit not found" });

  const prescription = await Prescription.findOneAndUpdate(
    { visitId: visit._id },
    { diagnosis, medicines, notes },
    { upsert: true, new: true }
  );
  return res.json({ visit, prescription });
});

export default router;
