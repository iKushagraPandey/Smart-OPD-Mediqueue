import { Patient } from "../models/Patient.js";
import { Visit } from "../models/Visit.js";
import { analyzeSymptoms } from "../utils/symptomEngine.js";
import { assignLeastBusyDoctor } from "../services/queueService.js";

export async function registerPatient(req, res) {
  const { name, phone, aadhaar, age, language, symptoms } = req.body;
  const patient = await Patient.findOneAndUpdate(
    { aadhaar },
    { name, phone, aadhaar, age, language },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const analysis = analyzeSymptoms(symptoms);
  const doctor = await assignLeastBusyDoctor(analysis.department);
  if (!doctor) return res.status(400).json({ message: "No doctor available" });

  const count = await Visit.countDocuments();
  const tokenNumber = `TKN-${1001 + count}`;
  const visit = await Visit.create({
    patientId: patient._id,
    doctorId: doctor._id,
    tokenNumber,
    symptoms_original: symptoms,
    symptoms_english: analysis.symptomsEnglish,
    severity: analysis.severity,
    department: analysis.department,
    status: "in_queue",
    priority: analysis.severity,
    qrCode: tokenNumber
  });

  return res.status(201).json({ tokenNumber, doctor, patient, visit });
}

export async function checkQueue(req, res) {
  const token = req.params.token;
  const visit = await Visit.findOne({ tokenNumber: token }).populate("doctorId").populate("patientId");
  if (!visit) return res.status(404).json({ message: "Token not found" });

  const queue = await Visit.find({ doctorId: visit.doctorId, status: { $in: ["in_queue", "in_consultation"] } }).sort({ priority: -1, createdAt: 1 });
  const position = queue.findIndex((item) => item.tokenNumber === token) + 1;
  return res.json({
    visit,
    position,
    etaMinutes: Math.max(5, (position - 1) * 8),
    doctorName: visit.doctorId?.name || "Assigned Doctor",
    queueList: queue.map((item, index) => ({ token: item.tokenNumber, status: item.status, position: index + 1 }))
  });
}
