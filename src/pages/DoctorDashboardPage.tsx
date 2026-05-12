import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext, useCurrentDoctor } from "../context/AppContext";
import { usePolling } from "../hooks/usePolling";
import type { MedicineItem, Patient, Visit } from "../types/models";

type QueueEntry = Visit & { patient?: Patient };

export function DoctorDashboardPage() {
  const doctor = useCurrentDoctor();
  const { fetchDoctorQueue, callNextPatient, completeConsultation, logoutDoctor } = useAppContext();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosagePerDay: 1, days: 3 }]);
  const tick = usePolling(5000);

  useEffect(() => {
    if (!doctor) return;
    fetchDoctorQueue().then(setQueue);
  }, [doctor, tick]);

  const selected = useMemo(() => queue.find((visit) => visit.id === selectedVisitId), [queue, selectedVisitId]);

  if (!doctor) return <Navigate to="/doctor-login" replace />;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{doctor.name}</h1>
            <p className="text-slate-300">{doctor.department} queue | backend live refresh 5 seconds</p>
          </div>
          <button className="rounded-lg border border-white/30 px-4 py-2" onClick={logoutDoctor}>
            Logout
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={async () => {
              const next = await callNextPatient();
              if (next) {
                setSelectedVisitId(next.id);
                const latest = await fetchDoctorQueue();
                setQueue(latest);
              }
            }}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold"
          >
            Call Next Patient
          </button>
          <p className="rounded-lg bg-white/10 px-4 py-2">Active Queue: {queue.length}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {queue.map((visit) => (
              <button key={visit.id} onClick={() => setSelectedVisitId(visit.id)} className="w-full rounded-xl border border-white/20 bg-white/5 p-4 text-left">
                <p className="font-semibold">{visit.tokenNumber} | {visit.patient?.name ?? "Patient"}</p>
                <p className="text-sm text-slate-300">Severity {visit.severity}/10 | {visit.status}</p>
                <p className="text-sm text-slate-300">Symptoms: {visit.symptomsOriginal}</p>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-white/20 bg-white/5 p-4">
            {!selected && <p>Select a patient to add diagnosis and prescription.</p>}
            {selected && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Complete Consultation</h2>
                <input className="w-full rounded-lg border border-white/20 bg-slate-900 p-2" placeholder="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                {medicines.map((med, idx) => (
                  <div key={`${idx}-${med.name}`} className="grid grid-cols-3 gap-2">
                    <input
                      className="rounded-lg border border-white/20 bg-slate-900 p-2"
                      placeholder="Medicine"
                      value={med.name}
                      onChange={(e) => setMedicines((prev) => prev.map((item, index) => (index === idx ? { ...item, name: e.target.value } : item)))}
                    />
                    <input
                      className="rounded-lg border border-white/20 bg-slate-900 p-2"
                      type="number"
                      min={1}
                      value={med.dosagePerDay}
                      onChange={(e) => setMedicines((prev) => prev.map((item, index) => (index === idx ? { ...item, dosagePerDay: Number(e.target.value) } : item)))}
                    />
                    <input
                      className="rounded-lg border border-white/20 bg-slate-900 p-2"
                      type="number"
                      min={1}
                      value={med.days}
                      onChange={(e) => setMedicines((prev) => prev.map((item, index) => (index === idx ? { ...item, days: Number(e.target.value) } : item)))}
                    />
                  </div>
                ))}
                <button className="rounded-lg border border-white/30 px-3 py-2 text-sm" onClick={() => setMedicines((prev) => [...prev, { name: "", dosagePerDay: 1, days: 3 }])}>
                  Add Medicine
                </button>
                <textarea className="w-full rounded-lg border border-white/20 bg-slate-900 p-2" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <button
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950"
                  onClick={async () => {
                    const cleaned: MedicineItem[] = medicines
                      .filter((med) => med.name.trim())
                      .map((med) => ({ ...med, totalQuantity: med.dosagePerDay * med.days, orderedQuantity: 0 }));
                    await completeConsultation(selected.id, diagnosis, cleaned, notes);
                    setSelectedVisitId("");
                    setDiagnosis("");
                    setNotes("");
                    setMedicines([{ name: "", dosagePerDay: 1, days: 3 }]);
                    const latest = await fetchDoctorQueue();
                    setQueue(latest);
                  }}
                >
                  Save & Complete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
