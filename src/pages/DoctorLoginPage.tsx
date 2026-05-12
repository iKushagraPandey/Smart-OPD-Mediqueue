import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export function DoctorLoginPage() {
  const { doctorLogin } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await doctorLogin(email, password);
    if (!ok) {
      setError("Invalid doctor credentials.");
      return;
    }
    navigate("/doctor-dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-700 to-cyan-600 px-4 py-10">
      <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Doctor Login</h1>
        <input className="w-full rounded-lg border p-3" placeholder="doc1@general.in" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-lg border p-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="w-full rounded-lg bg-slate-900 p-3 font-semibold text-white">Login</button>
      </form>
    </main>
  );
}
