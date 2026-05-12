import { motion } from "framer-motion";
import { Activity, Languages, Mic, Pill, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Mic, title: "Voice Registration", desc: "Hindi-first voice capture with fallback manual form." },
  { icon: Languages, title: "10+ Languages", desc: "Built for multilingual OPD workflows across India." },
  { icon: UserRound, title: "Smart Doctor Assignment", desc: "Patients routed to least-busy department doctor." },
  { icon: Pill, title: "Token to Pharmacy", desc: "Prescription and order flow linked by a single token." },
  { icon: Activity, title: "Live Queue Tracking", desc: "Doctor and patient screens refresh in real time." },
  { icon: ShieldCheck, title: "Manager Analytics", desc: "Queue health, wait-time trends, and doctor performance." },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#2563eb_0%,transparent_35%),radial-gradient(circle_at_80%_15%,#8b5cf6_0%,transparent_30%),radial-gradient(circle_at_60%_70%,#14b8a6_0%,transparent_35%),radial-gradient(circle_at_30%_85%,#f97316_0%,transparent_30%)]" />
        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col justify-center px-4 py-20 md:px-8">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-semibold text-cyan-200">
            MEDIQUEUE Hospital OS
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl"
          >
            MEDIQUEUE powers OPD, queueing, consultation, and pharmacy in one live system.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-5 max-w-2xl text-base text-slate-100/90 md:text-lg"
          >
            AI triage, token-based care journey, and role-ready dashboards for doctors, patients, pharmacy, and managers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/patient" className="rounded-lg bg-white px-5 py-3 font-semibold text-slate-900 transition hover:opacity-90">
              Register Patient
            </Link>
            <Link to="/queue-status" className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">
              Check Queue Status
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-16 md:grid-cols-3 md:px-8">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            className="space-y-3"
          >
            <feature.icon className="h-8 w-8 text-cyan-300" />
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-slate-300">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
