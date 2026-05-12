import { Router } from "express";
import { checkQueue, registerPatient } from "../controllers/patientController.js";

const router = Router();

router.post("/register", registerPatient);
router.get("/queue/:token", checkQueue);

export default router;
