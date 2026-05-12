import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export function ManagerLoginPage() {
  const { managerLogin } = useAppContext();
  const [email, setEmail] = useState("admin@manager.in");
  const [password, setPassword] = useState("12345678");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await managerLogin(email, password);
    if (!ok) {
      setError("Invalid manager credentials.");
      return;
    }
    navigate("/manager-dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-600 px-4 py-10">
      <form onSubmit={submit} className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Manager Login</h1>
        <input className="w-full rounded-lg border p-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded-lg border p-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="w-full rounded-lg bg-slate-900 p-3 font-semibold text-white">Login</button>
      </form>
    </main>
  );
}
