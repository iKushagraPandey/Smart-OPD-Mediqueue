import { Router } from "express";
import { doctorLogin, managerLogin } from "../controllers/authController.js";

const router = Router();

router.post("/doctor-login", doctorLogin);
router.post("/manager-login", managerLogin);

export default router;
