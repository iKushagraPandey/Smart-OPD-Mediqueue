import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { usePolling } from "../hooks/usePolling";

export function QueueStatusPage() {
  const { getQueueStatus } = useAppContext();
  const [token, setToken] = useState("");
  const [queryToken, setQueryToken] = useState("");
  const tick = usePolling(10000);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getQueueStatus>>>(null);

  useEffect(() => {
    if (!queryToken) return;
    getQueueStatus(queryToken).then(setStatus);
  }, [queryToken, tick]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Check Queue Status</h1>
        <div className="flex gap-3">
          <input className="flex-1 rounded-lg border bg-white p-3" placeholder="Enter token (TKN-1001)" value={token} onChange={(e) => setToken(e.target.value)} />
          <button
            onClick={() => {
              setQueryToken(token);
              getQueueStatus(token).then(setStatus);
            }}
            className="rounded-lg bg-blue-600 px-5 text-white"
          >
            Check
          </button>
        </div>

        {!status && queryToken && <p className="text-rose-600">No queue entry found for this token.</p>}

        {status && (
          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{status.visit.tokenNumber}</h2>
            <p>Doctor: {status.doctorName}</p>
            <p>Department: {status.visit.department}</p>
            <p>Status: {status.visit.status}</p>
            <p>Current Position: {status.position}</p>
            <p>Estimated Wait: {status.etaMinutes} minutes</p>
            <div>
              <div className="mb-2 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-gradient-to-r from-teal-500 to-blue-600" style={{ width: `${Math.max(10, 100 - status.position * 20)}%` }} />
              </div>
              <p className="text-sm text-slate-500">Auto refresh every 10 seconds</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
