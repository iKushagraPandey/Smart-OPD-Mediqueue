import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { seedDoctors } from "../services/storage";
import type { Department, MedicineItem, Order, Patient, Prescription, Visit } from "../types/models";

const API_BASE = "http://localhost:5000/api";

type QueueStatus = { visit: Visit; position: number; etaMinutes: number; doctorName: string };

type DoctorProfile = {
  id: string;
  name: string;
  email: string;
  department: Department;
};

type ManagerAnalytics = {
  totalPatients: number;
  activeConsultations: number;
  completedConsultations: number;
  byDepartment: Array<{ department: string; patients: number; avgSeverity: number }>;
};

interface AppContextShape {
  doctors: DoctorProfile[];
  patients: Patient[];
  visits: Visit[];
  orders: Order[];
  managerAuthed: boolean;
  currentDoctor: DoctorProfile | null;
  doctorLogin: (email: string, password: string) => Promise<boolean>;
  managerLogin: (email: string, password: string) => Promise<boolean>;
  logoutDoctor: () => void;
  logoutManager: () => void;
  registerPatient: (input: { name: string; age: number; phone: string; aadhaar: string; language: string; symptoms: string }) => Promise<{ token: string; doctorName: string; department: Department; severity: number }>;
  fetchDoctorQueue: () => Promise<Array<Visit & { patient?: Patient }>>;
  callNextPatient: () => Promise<(Visit & { patient?: Patient }) | null>;
  completeConsultation: (visitId: string, diagnosis: string, medicines: MedicineItem[], notes: string) => Promise<void>;
  getQueueStatus: (token: string) => Promise<QueueStatus | null>;
  verifyPharmacyAccess: (token: string, phone: string, otp: string) => Promise<{ prescription: Prescription; visit: Visit } | null>;
  placeOrder: (prescriptionId: string, patientId: string, items: Array<{ name: string; quantity: number }>) => Promise<{ ok: boolean; message: string }>;
  fetchOrdersByToken: (token: string) => Promise<Order[]>;
  fetchManagerAnalytics: () => Promise<ManagerAnalytics | null>;
}

const AppContext = createContext<AppContextShape | null>(null);

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "API request failed");
  }
  return payload;
}

function mapVisit(raw: Record<string, unknown>): Visit {
  return {
    id: String(raw._id),
    patientId: String(raw.patientId),
    doctorId: String(raw.doctorId),
    tokenNumber: String(raw.tokenNumber),
    symptomsOriginal: String(raw.symptoms_original ?? ""),
    symptomsEnglish: String(raw.symptoms_english ?? ""),
    severity: Number(raw.severity ?? 1),
    department: String(raw.department) as Department,
    status: String(raw.status) as Visit["status"],
    priority: Number(raw.priority ?? 1),
    createdAt: new Date(String(raw.createdAt ?? new Date().toISOString())).getTime(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [managerAuthed, setManagerAuthed] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(null);
  const [doctorToken, setDoctorToken] = useState<string | null>(() => sessionStorage.getItem("mediqueue-doctor-token"));
  const [managerToken, setManagerToken] = useState<string | null>(() => sessionStorage.getItem("mediqueue-manager-token"));

  const doctors: DoctorProfile[] = seedDoctors.map((doctor) => ({ id: doctor.id, name: doctor.name, email: doctor.email, department: doctor.department }));

  const doctorLogin: AppContextShape["doctorLogin"] = async (email, password) => {
    try {
      const response = await apiRequest<{ token: string; doctor: Record<string, unknown> }>("/auth/doctor-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setDoctorToken(response.token);
      sessionStorage.setItem("mediqueue-doctor-token", response.token);
      setCurrentDoctor({
        id: String(response.doctor._id),
        name: String(response.doctor.name),
        email: String(response.doctor.email),
        department: String(response.doctor.department) as Department,
      });
      return true;
    } catch {
      return false;
    }
  };

  const managerLogin: AppContextShape["managerLogin"] = async (email, password) => {
    try {
      const response = await apiRequest<{ token: string }>("/auth/manager-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setManagerToken(response.token);
      sessionStorage.setItem("mediqueue-manager-token", response.token);
      setManagerAuthed(true);
      return true;
    } catch {
      return false;
    }
  };

  const registerPatient: AppContextShape["registerPatient"] = async (input) => {
    const response = await apiRequest<{ tokenNumber: string; doctor: Record<string, unknown>; patient: Record<string, unknown>; visit: Record<string, unknown> }>(
      "/patients/register",
      { method: "POST", body: JSON.stringify(input) },
    );

    const patient: Patient = {
      id: String(response.patient._id),
      name: String(response.patient.name),
      age: Number(response.patient.age),
      phone: String(response.patient.phone),
      aadhaar: String(response.patient.aadhaar),
      language: String(response.patient.language),
    };
    const visit = mapVisit({ ...response.visit, patientId: response.patient._id, doctorId: response.doctor._id });

    setPatients((prev) => [...prev.filter((item) => item.id !== patient.id), patient]);
    setVisits((prev) => [...prev, visit]);

    return {
      token: response.tokenNumber,
      doctorName: String(response.doctor.name),
      department: String(response.visit.department) as Department,
      severity: Number(response.visit.severity),
    };
  };

  const fetchDoctorQueue: AppContextShape["fetchDoctorQueue"] = async () => {
    if (!doctorToken) return [];
    const response = await apiRequest<Array<Record<string, unknown>>>("/doctors/queue", { method: "GET" }, doctorToken);
    const normalized = response.map((entry) => {
      const visit = mapVisit({ ...entry, patientId: typeof entry.patientId === "object" ? (entry.patientId as Record<string, unknown>)._id : entry.patientId });
      const patientObj = entry.patientId as Record<string, unknown> | undefined;
      const patient = patientObj
        ? {
            id: String(patientObj._id),
            name: String(patientObj.name),
            age: Number(patientObj.age),
            phone: String(patientObj.phone),
            aadhaar: String(patientObj.aadhaar),
            language: String(patientObj.language ?? "Hindi"),
          }
        : undefined;
      return { ...visit, patient };
    });
    setVisits((prev) => [...prev.filter((item) => !normalized.some((queueItem) => queueItem.id === item.id)), ...normalized]);
    setPatients((prev) => {
      const incoming = normalized.flatMap((item) => (item.patient ? [item.patient] : []));
      return [...prev.filter((item) => !incoming.some((newItem) => newItem.id === item.id)), ...incoming];
    });
    return normalized;
  };

  const callNextPatient: AppContextShape["callNextPatient"] = async () => {
    if (!doctorToken) return null;
    try {
      const response = await apiRequest<Record<string, unknown>>("/doctors/call-next", { method: "POST" }, doctorToken);
      const visit = mapVisit({ ...response, patientId: typeof response.patientId === "object" ? (response.patientId as Record<string, unknown>)._id : response.patientId });
      setVisits((prev) => prev.map((entry) => (entry.id === visit.id ? visit : entry)));
      return visit;
    } catch {
      return null;
    }
  };

  const completeConsultation: AppContextShape["completeConsultation"] = async (visitId, diagnosis, medicines, notes) => {
    if (!doctorToken) return;
    await apiRequest(`/doctors/complete/${visitId}`, {
      method: "POST",
      body: JSON.stringify({ diagnosis, medicines, notes }),
    }, doctorToken);
    setVisits((prev) => prev.map((entry) => (entry.id === visitId ? { ...entry, status: "completed" } : entry)));
  };

  const getQueueStatus: AppContextShape["getQueueStatus"] = async (token) => {
    try {
      const response = await apiRequest<{ visit: Record<string, unknown>; position: number; etaMinutes: number; doctorName: string }>(`/patients/queue/${token}`);
      return { visit: mapVisit({ ...response.visit, patientId: (response.visit.patientId as Record<string, unknown>)._id, doctorId: (response.visit.doctorId as Record<string, unknown>)._id }), position: response.position, etaMinutes: response.etaMinutes, doctorName: response.doctorName };
    } catch {
      return null;
    }
  };

  const verifyPharmacyAccess: AppContextShape["verifyPharmacyAccess"] = async (token, phone, otp) => {
    try {
      const response = await apiRequest<{ prescription: Record<string, unknown>; visit: Record<string, unknown> }>("/pharmacy/verify", {
        method: "POST",
        body: JSON.stringify({ tokenNumber: token, phone, otp }),
      });
      const prescription: Prescription = {
        id: String(response.prescription._id),
        visitId: String(response.prescription.visitId),
        diagnosis: String(response.prescription.diagnosis),
        medicines: (response.prescription.medicines as MedicineItem[]) ?? [],
        notes: String(response.prescription.notes ?? ""),
        doctorName: String(response.prescription.doctorName ?? "Doctor"),
        createdAt: Date.now(),
      };
      const visit = mapVisit({ ...response.visit, patientId: (response.visit.patientId as Record<string, unknown>)._id, doctorId: (response.visit.doctorId as Record<string, unknown>)._id });
      return { prescription, visit };
    } catch {
      return null;
    }
  };

  const placeOrder: AppContextShape["placeOrder"] = async (prescriptionId, patientId, items) => {
    try {
      const response = await apiRequest<Record<string, unknown>>("/pharmacy/order", {
        method: "POST",
        body: JSON.stringify({ prescriptionId, patientId, items }),
      });
      const order: Order = {
        id: String(response._id),
        prescriptionId: String(response.prescriptionId),
        patientId: String(response.patientId),
        tokenNumber: "",
        items: items,
        totalAmount: Number(response.totalAmount ?? 0),
        status: String(response.status) as Order["status"],
        createdAt: Date.now(),
      };
      setOrders((prev) => [...prev, order]);
      return { ok: true, message: "Order placed successfully." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Order failed." };
    }
  };

  const fetchOrdersByToken: AppContextShape["fetchOrdersByToken"] = async (token) => {
    return orders.filter((item) => item.tokenNumber.toLowerCase() === token.toLowerCase());
  };

  const fetchManagerAnalytics: AppContextShape["fetchManagerAnalytics"] = async () => {
    if (!managerToken) return null;
    try {
      const response = await apiRequest<{ totalPatients: number; activeConsultations: number; completedConsultations: number; byDepartment: Array<{ _id: string; count: number; avgSeverity: number }> }>(
        "/manager/analytics",
        { method: "GET" },
        managerToken,
      );
      return {
        totalPatients: response.totalPatients,
        activeConsultations: response.activeConsultations,
        completedConsultations: response.completedConsultations,
        byDepartment: response.byDepartment.map((item) => ({ department: item._id, patients: item.count, avgSeverity: Number(item.avgSeverity ?? 0) })),
      };
    } catch {
      return null;
    }
  };

  const value = useMemo<AppContextShape>(
    () => ({
      doctors,
      patients,
      visits,
      orders,
      managerAuthed,
      currentDoctor,
      doctorLogin,
      managerLogin,
      logoutDoctor: () => {
        setCurrentDoctor(null);
        setDoctorToken(null);
        sessionStorage.removeItem("mediqueue-doctor-token");
      },
      logoutManager: () => {
        setManagerAuthed(false);
        setManagerToken(null);
        sessionStorage.removeItem("mediqueue-manager-token");
      },
      registerPatient,
      fetchDoctorQueue,
      callNextPatient,
      completeConsultation,
      getQueueStatus,
      verifyPharmacyAccess,
      placeOrder,
      fetchOrdersByToken,
      fetchManagerAnalytics,
    }),
    [patients, visits, orders, managerAuthed, currentDoctor, doctorToken, managerToken],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}

export function useCurrentDoctor() {
  const { currentDoctor } = useAppContext();
  return currentDoctor;
}
