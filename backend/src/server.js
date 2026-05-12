import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import pharmacyRoutes from "./routes/pharmacyRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "MEDIQUEUE API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/manager", managerRoutes);

app.use((err, _req, res, _next) => {
  return res.status(500).json({ message: err.message || "Internal Server Error" });
});

const port = Number(process.env.PORT || 5000);

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      process.stdout.write(`MEDIQUEUE API running on port ${port}\n`);
    });
  })
  .catch((error) => {
    process.stderr.write(`MongoDB connection failed: ${error.message}\n`);
    process.exit(1);
  });
