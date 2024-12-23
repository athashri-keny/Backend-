import { Router } from "express";
import { HealthCheck } from "../controllers/health.js";

const router = Router()

router.route("/").get(HealthCheck)

export default router