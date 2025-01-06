import { Router } from "express";
import { getUserChannelSubscribers, ToggleSubcription , getSubscribedChannels } from "../controllers/subcription.controllers.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/substochannel/c/:channelId").get(verifyjwt , ToggleSubcription)
router.route("/getchannelsubs/c/:channelId").get(verifyjwt , getUserChannelSubscribers)
router.route("/subschannel/c/:subcriberId").get(verifyjwt , getSubscribedChannels)

export default router