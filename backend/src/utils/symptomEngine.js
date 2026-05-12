const symptomMap = [
  { terms: ["chest pain", "heart", "bp"], department: "cardiology", score: 9 },
  { terms: ["joint", "bone", "fracture"], department: "orthopedics", score: 7 },
  { terms: ["skin", "rash", "allergy"], department: "dermatology", score: 5 },
  { terms: ["eye", "vision"], department: "ophthalmology", score: 6 },
  { terms: ["ear", "nose", "throat"], department: "ent", score: 6 },
  { terms: ["headache", "seizure"], department: "neurology", score: 8 },
  { terms: ["pregnancy", "period"], department: "gynecology", score: 7 },
  { terms: ["child", "baby"], department: "pediatrics", score: 6 },
  { terms: ["accident", "bleeding"], department: "emergency", score: 10 },
  { terms: ["fever", "cold", "cough"], department: "general", score: 4 }
];

export function analyzeSymptoms(text = "") {
  const clean = text.toLowerCase().trim();
  let selected = { department: "general", score: 4 };

  for (const item of symptomMap) {
    if (item.terms.some((term) => clean.includes(term)) && item.score > selected.score) {
      selected = item;
    }
  }

  return {
    symptomsEnglish: clean,
    department: selected.department,
    severity: Math.min(10, Math.max(1, Math.round(selected.score)))
  };
}
