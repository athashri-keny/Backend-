import { Router } from "express";
import { ADDComments, UpdateComment  , DeleteComment} from "../controllers/comments.controllers.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/c/:VideoId").get( verifyjwt , ADDComments)
router.route("/update/c/:CommentId/c/:VideoId").patch(verifyjwt , UpdateComment)
router.route("/delete/c/:CommentId/c/:VideoId").delete(DeleteComment)


export default router