import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { MedicineItem } from "../types/models";

export function PharmacyPortalPage() {
  const { verifyPharmacyAccess, placeOrder, orders, fetchOrdersByToken } = useAppContext();
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("123456");
  const [error, setError] = useState("");
  const [session, setSession] = useState<Awaited<ReturnType<typeof verifyPharmacyAccess>>>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [remoteOrders, setRemoteOrders] = useState(orders);

  const patientOrders = useMemo(() => remoteOrders.filter((order) => order.tokenNumber.toLowerCase() === token.toLowerCase()), [remoteOrders, token]);

  const verify = async () => {
    const result = await verifyPharmacyAccess(token, phone, otp);
    if (!result) {
      setError("Invalid token/phone/otp or prescription unavailable.");
      return;
    }
    setError("");
    setSession(result);
    setQuantities(Object.fromEntries((result.prescription.medicines as MedicineItem[]).map((item) => [item.name, 0])));
    const existing = await fetchOrdersByToken(token);
    setRemoteOrders(existing);
  };

  const submitOrder = async () => {
    if (!session) return;
    const items = Object.entries(quantities).map(([name, quantity]) => ({ name, quantity }));
    const response = await placeOrder(session.prescription.id, session.visit.patientId, items);
    setMessage(response.message);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 md:p-8">
        <h1 className="text-3xl font-bold text-slate-900">Pharmacy Portal</h1>
        <p className="text-slate-600">Access prescription using token number + phone + OTP (123456).</p>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
          <input className="rounded-lg border p-3" placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
          <input className="rounded-lg border p-3" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="rounded-lg border p-3" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button className="rounded-lg bg-slate-900 p-3 font-semibold text-white" onClick={verify}>
            Verify
          </button>
        </div>
        {error && <p className="mt-3 text-rose-600">{error}</p>}

        {session && (
          <div className="mt-8 space-y-4">
            <p className="font-semibold">Diagnosis: {session.prescription.diagnosis}</p>
            <p>Doctor: {session.prescription.doctorName}</p>
            {session.prescription.medicines.map((item) => {
              const remaining = item.totalQuantity - item.orderedQuantity;
              return (
                <div key={item.name} className="grid grid-cols-1 items-center gap-2 rounded-lg border p-3 md:grid-cols-4">
                  <p className="font-medium">{item.name}</p>
                  <p>Prescribed: {item.totalQuantity}</p>
                  <p>Remaining: {remaining}</p>
                  <input
                    type="number"
                    min={0}
                    max={remaining}
                    className="rounded border p-2"
                    value={quantities[item.name] ?? 0}
                    onChange={(e) => setQuantities((prev) => ({ ...prev, [item.name]: Number(e.target.value) }))}
                  />
                </div>
              );
            })}
            <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white" onClick={submitOrder}>
              Place Order
            </button>
            {message && <p className="text-emerald-600">{message}</p>}
          </div>
        )}

        {patientOrders.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold">Order History</h2>
            {patientOrders.map((order) => (
              <div key={order.id} className="rounded-lg border p-3">
                <p>Status: {order.status}</p>
                <p>Total: Rs {order.totalAmount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
