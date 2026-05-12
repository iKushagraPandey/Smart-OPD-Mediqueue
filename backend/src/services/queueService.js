import { Doctor } from "../models/Doctor.js";
import { Visit } from "../models/Visit.js";

export async function assignLeastBusyDoctor(department) {
  const doctors = await Doctor.find({ department, isActive: true }).lean();
  if (!doctors.length) return null;

  const counts = await Visit.aggregate([
    { $match: { status: { $in: ["in_queue", "in_consultation"] }, department } },
    { $group: { _id: "$doctorId", count: { $sum: 1 } } }
  ]);

  const map = new Map(counts.map((entry) => [String(entry._id), entry.count]));
  return doctors.sort((a, b) => (map.get(String(a._id)) || 0) - (map.get(String(b._id)) || 0))[0];
}
