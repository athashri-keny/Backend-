import { Router } from "express";
import { GetChannelStats, GetChannelTotalVideo } from "../controllers/dashboard.controllers.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/ChannelStats").get( verifyjwt ,GetChannelStats)
router.route("/totalVideos").get(verifyjwt , GetChannelTotalVideo)

export default router