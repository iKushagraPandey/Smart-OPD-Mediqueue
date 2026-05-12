import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppContext } from "../context/AppContext";
import { usePolling } from "../hooks/usePolling";

export function ManagerDashboardPage() {
  const { managerAuthed, logoutManager, fetchManagerAnalytics } = useAppContext();
  const tick = usePolling(10000);
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof fetchManagerAnalytics>>>(null);

  if (!managerAuthed) return <Navigate to="/manager-login" replace />;

  useEffect(() => {
    fetchManagerAnalytics().then(setAnalytics);
  }, [tick]);

  const departmentData = analytics?.byDepartment ?? [];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Manager Analytics Dashboard</h1>
          <button onClick={logoutManager} className="rounded-lg bg-slate-900 px-4 py-2 text-white">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-slate-500">Total Patients</p><p className="text-3xl font-bold">{analytics?.totalPatients ?? 0}</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-slate-500">Active Consultations</p><p className="text-3xl font-bold">{analytics?.activeConsultations ?? 0}</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-slate-500">Completed</p><p className="text-3xl font-bold">{analytics?.completedConsultations ?? 0}</p></div>
          <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-slate-500">Avg Severity</p><p className="text-3xl font-bold">{departmentData.length ? (departmentData.reduce((sum, item) => sum + item.avgSeverity, 0) / departmentData.length).toFixed(1) : "0.0"}</p></div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Department Load</h2>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500">Auto refresh every 10 seconds</p>
        </div>
      </div>
    </main>
  );
}
