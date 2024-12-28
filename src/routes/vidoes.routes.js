import { Router } from "express";
import { publishVideo , getallVidoes } from "../controllers/videos.controlles.js";
import { upload } from "../middlewares/multer.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/").get(getallVidoes);

// Route to publish a video (POST request with file upload)
router.route("/upload").post( verifyjwt,
    upload.fields([
        { name: "VideoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishVideo // After the upload middleware, call the publishVideo function
);

export default router;