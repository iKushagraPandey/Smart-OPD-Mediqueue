export type Department =
  | "general"
  | "cardiology"
  | "orthopedics"
  | "pediatrics"
  | "dermatology"
  | "neurology"
  | "gynecology"
  | "ent"
  | "ophthalmology"
  | "emergency";

export type VisitStatus = "registered" | "in_queue" | "in_consultation" | "completed";

export interface Doctor {
  id: string;
  name: string;
  email: string;
  password: string;
  department: Department;
  specialization: string;
  isActive: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  aadhaar: string;
  language: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  tokenNumber: string;
  symptomsOriginal: string;
  symptomsEnglish: string;
  severity: number;
  department: Department;
  status: VisitStatus;
  priority: number;
  createdAt: number;
  calledAt?: number;
  completedAt?: number;
}

export interface MedicineItem {
  name: string;
  dosagePerDay: number;
  days: number;
  totalQuantity: number;
  orderedQuantity: number;
}

export interface Prescription {
  id: string;
  visitId: string;
  diagnosis: string;
  medicines: MedicineItem[];
  notes: string;
  doctorName: string;
  createdAt: number;
}

export interface Order {
  id: string;
  prescriptionId: string;
  patientId: string;
  tokenNumber: string;
  items: Array<{ name: string; quantity: number }>;
  totalAmount: number;
  status: "placed" | "approved" | "packed" | "out_for_delivery" | "delivered";
  createdAt: number;
}

export interface ManagerUser {
  email: string;
  password: string;
  name: string;
  role: "manager";
}
