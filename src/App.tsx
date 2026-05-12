import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { AppProvider } from "./context/AppContext";
import { DoctorDashboardPage } from "./pages/DoctorDashboardPage";
import { DoctorLoginPage } from "./pages/DoctorLoginPage";
import { LandingPage } from "./pages/LandingPage";
import { ManagerDashboardPage } from "./pages/ManagerDashboardPage";
import { ManagerLoginPage } from "./pages/ManagerLoginPage";
import { PatientPortalPage } from "./pages/PatientPortalPage";
import { PharmacyPortalPage } from "./pages/PharmacyPortalPage";
import { QueueStatusPage } from "./pages/QueueStatusPage";
import { TokenWindowPage } from "./pages/TokenWindowPage";

function AppShell() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/token/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient" element={<PatientPortalPage />} />
        <Route path="/queue-status" element={<QueueStatusPage />} />
        <Route path="/doctor-login" element={<DoctorLoginPage />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
        <Route path="/pharmacy" element={<PharmacyPortalPage />} />
        <Route path="/manager-login" element={<ManagerLoginPage />} />
        <Route path="/manager-dashboard" element={<ManagerDashboardPage />} />
        <Route path="/token/:tokenNumber" element={<TokenWindowPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
