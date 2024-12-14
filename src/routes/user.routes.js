import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";  // export higger order function from user controllers
import { upload } from "../middlewares/multer.js"; // for storaging files eg pdf , photos , avatar imgs
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([ // middleware 
 {
    name: "avatar",
    maxCount: 1
 },
 {
    name: "coverimage",
    maxCount: 1
 }
    ]),
    registerUser
);

  router.route("/login").post(loginUser)

   // securred routes
   router.route("/logout").post( verifyjwt, logoutUser)

export default router;
