import type { Department, Doctor } from "../types/models";

const symptomMap: Array<{ terms: string[]; department: Department; weight: number }> = [
  { terms: ["chest pain", "heart", "bp", "palpitation"], department: "cardiology", weight: 9 },
  { terms: ["bone", "joint", "fracture", "back pain"], department: "orthopedics", weight: 7 },
  { terms: ["skin", "rash", "itch", "allergy"], department: "dermatology", weight: 5 },
  { terms: ["eye", "vision", "blur"], department: "ophthalmology", weight: 6 },
  { terms: ["ear", "nose", "throat", "sinus"], department: "ent", weight: 6 },
  { terms: ["seizure", "headache", "numb", "migraine"], department: "neurology", weight: 8 },
  { terms: ["pregnancy", "period", "uterus", "gyn"], department: "gynecology", weight: 7 },
  { terms: ["child", "baby", "infant", "pediatric"], department: "pediatrics", weight: 6 },
  { terms: ["accident", "bleeding", "unconscious"], department: "emergency", weight: 10 },
  { terms: ["fever", "cold", "cough", "weakness"], department: "general", weight: 4 },
];

export function normalizeSymptoms(input: string) {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

export function analyzeSymptoms(input: string): {
  symptomsEnglish: string;
  department: Department;
  severity: number;
} {
  const clean = normalizeSymptoms(input);
  const scores = new Map<Department, number>();

  symptomMap.forEach((item) => {
    const hasMatch = item.terms.some((term) => clean.includes(term));
    if (hasMatch) {
      scores.set(item.department, (scores.get(item.department) ?? 0) + item.weight);
    }
  });

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const department = ranked[0]?.[0] ?? "general";
  const topScore = ranked[0]?.[1] ?? 4;
  const severity = Math.max(1, Math.min(10, Math.round(topScore / 1.2)));

  return { symptomsEnglish: clean, department, severity };
}

export function assignDoctor(doctors: Doctor[], department: Department, queueCounts: Record<string, number>) {
  const candidates = doctors.filter((doctor) => doctor.department === department && doctor.isActive);
  return candidates.sort((a, b) => (queueCounts[a.id] ?? 0) - (queueCounts[b.id] ?? 0))[0];
}
