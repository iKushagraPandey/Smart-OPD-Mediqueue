import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

type TokenDetails = {
  visit: {
    tokenNumber: string;
    department: string;
    severity: number;
    status: string;
    patientId: { name: string; age: number; phone: string; aadhaar: string };
    doctorId: { name: string };
  };
  position: number;
  etaMinutes: number;
  queueList: Array<{ token: string; status: string; position: number }>;
};

export function TokenWindowPage() {
  const { tokenNumber = "" } = useParams();
  const [details, setDetails] = useState<TokenDetails | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/patients/queue/${tokenNumber}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDetails(data));
  }, [tokenNumber]);

  if (!details) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <p className="text-2xl font-semibold text-slate-800">Token not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="border-b pb-6 text-center">
          <p className="text-xl text-slate-500">MEDIQUEUE OPD TOKEN</p>
          <h1 className="mt-2 text-5xl font-black">{details.visit.tokenNumber}</h1>
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Patient Info</h2>
              <p className="mt-2 text-lg">Name: {details.visit.patientId?.name ?? "N/A"}</p>
              <p className="text-lg">Age: {details.visit.patientId?.age ?? "N/A"}</p>
              <p className="text-lg">Phone: {details.visit.patientId?.phone ?? "N/A"}</p>
              <p className="text-lg">Aadhaar: {details.visit.patientId?.aadhaar ?? "N/A"}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold">Doctor Info</h2>
              <p className="mt-2 text-lg">Doctor: {details.visit.doctorId?.name ?? "N/A"}</p>
              <p className="text-lg">Department: {details.visit.department}</p>
              <p className="text-lg">Severity: {details.visit.severity}/10</p>
              <p className="text-lg">Queue Position: {details.position}</p>
              <p className="text-lg">Estimated Wait: {details.etaMinutes} min</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <QRCodeSVG value={details.visit.tokenNumber} size={220} />
            <p className="text-center text-base text-slate-600">Show this token QR at consultation and pharmacy.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold">Queue List</h2>
          <div className="space-y-2">
            {details.queueList.map((entry) => (
              <div key={entry.token} className="flex items-center justify-between border px-4 py-3">
                <p className="font-semibold">#{entry.position} {entry.token}</p>
                <p className="capitalize text-slate-600">{entry.status.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
