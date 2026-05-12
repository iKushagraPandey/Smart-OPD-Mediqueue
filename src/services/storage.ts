import type { Doctor, ManagerUser, Order, Patient, Prescription, Visit } from "../types/models";

export const STORAGE_KEY = "mediqueue-app-state";

export const seedDoctors: Doctor[] = [
  { id: "d1", email: "doc1@general.in", password: "12345678", department: "general", name: "Dr. Rajesh Kumar", specialization: "General Medicine", isActive: true },
  { id: "d2", email: "doc1@cardio.in", password: "12345678", department: "cardiology", name: "Dr. Priya Sharma", specialization: "Cardiology", isActive: true },
  { id: "d3", email: "doc1@ortho.in", password: "12345678", department: "orthopedics", name: "Dr. Amit Patel", specialization: "Orthopedics", isActive: true },
  { id: "d4", email: "doc1@pedia.in", password: "12345678", department: "pediatrics", name: "Dr. Sneha Reddy", specialization: "Pediatrics", isActive: true },
  { id: "d5", email: "doc1@derma.in", password: "12345678", department: "dermatology", name: "Dr. Vikram Singh", specialization: "Dermatology", isActive: true },
  { id: "d6", email: "doc1@neuro.in", password: "12345678", department: "neurology", name: "Dr. Ananya Iyer", specialization: "Neurology", isActive: true },
  { id: "d7", email: "doc1@gynec.in", password: "12345678", department: "gynecology", name: "Dr. Kavita Nair", specialization: "Gynecology", isActive: true },
  { id: "d8", email: "doc1@ent.in", password: "12345678", department: "ent", name: "Dr. Suresh Menon", specialization: "ENT", isActive: true },
  { id: "d9", email: "doc1@ophthal.in", password: "12345678", department: "ophthalmology", name: "Dr. Divya Joshi", specialization: "Ophthalmology", isActive: true },
  { id: "d10", email: "doc1@emergency.in", password: "12345678", department: "emergency", name: "Dr. Rahul Verma", specialization: "Emergency Medicine", isActive: true },
];

export const seedManager: ManagerUser = {
  email: "admin@manager.in",
  password: "12345678",
  name: "System Administrator",
  role: "manager",
};

export interface AppState {
  doctors: Doctor[];
  manager: ManagerUser;
  patients: Patient[];
  visits: Visit[];
  prescriptions: Prescription[];
  orders: Order[];
}

export const defaultState: AppState = {
  doctors: seedDoctors,
  manager: seedManager,
  patients: [],
  visits: [],
  prescriptions: [],
  orders: [],
};

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState;
  try {
    return { ...defaultState, ...JSON.parse(raw) } as AppState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
