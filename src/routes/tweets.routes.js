import { Router } from "express";
import { GetCurrentUserTweets, tweetCreate, updatetweet} from "../controllers/tweets.controllers.js";
import {verifyjwt} from "../middlewares/auth.middleware.js"
const router = Router();

router.use(verifyjwt)

router.route("/").post( tweetCreate);
router.route("/user").get(GetCurrentUserTweets);
router.route("/update/:tweetId").put(verifyjwt , updatetweet)
export default router;