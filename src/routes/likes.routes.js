import { Router } from "express";
import { GetLikeVideos, ToggleCommentsLikes, ToggleTweetlikes, ToggleVideoLike } from "../controllers/like.controllers.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
const router = Router();


router.route("/c/:VideoId").get(verifyjwt , ToggleVideoLike)
router.route("/liketweet/c/:tweetId").get(verifyjwt , ToggleTweetlikes)
router.route("/likecomment/c/:commentId").get(verifyjwt , ToggleCommentsLikes)
router.route("/GetLikedVideos").get(verifyjwt , GetLikeVideos)

export default router;