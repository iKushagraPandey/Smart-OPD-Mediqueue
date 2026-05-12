import { Stethoscope } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/patient", label: "Patient Portal" },
  { to: "/queue-status", label: "Check Queue" },
  { to: "/doctor-login", label: "Doctor" },
  { to: "/pharmacy", label: "Pharmacy" },
  { to: "/manager-login", label: "Manager" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 text-sm text-slate-100 md:px-8">
        <Link to="/" className="flex items-center gap-2 text-base font-semibold tracking-wide">
          <Stethoscope className="h-5 w-5 text-cyan-300" />
          MEDIQUEUE
        </Link>
        <div className="flex flex-wrap items-center gap-3 md:gap-5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "text-cyan-300" : "text-slate-200 transition hover:text-cyan-200"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
