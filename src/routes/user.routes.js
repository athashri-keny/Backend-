import { Router } from "express";
import { loginUser, logoutUser, registerUser , refreshTokenAccessToken, changerCurrentUserPassword, getcurrentUser , updateUserAvatar, updateUserCoverImg , getUserChannelProfile , GetWatchHistory, updateAccountDetails} from "../controllers/user.controllers.js";  // export higger order function from user controllers
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
    name: "coverImage",
    maxCount: 1
 }
    ]),
    registerUser
);

  router.route("/login").post(loginUser)

   // securred routes
   router.route("/logout").post( verifyjwt, logoutUser)

   router.route("refresh-token").post(refreshTokenAccessToken)

   router.route("/change-password").post(verifyjwt , changerCurrentUserPassword)

   router.route("/current-user").get(verifyjwt , getcurrentUser)

   router.route("/update-account").patch(verifyjwt , updateAccountDetails)

   router.route("/avatar").patch(verifyjwt , upload.single("avatar") , updateUserAvatar)

router.route("/cover-image").patch(verifyjwt , upload.single("coverImage" , updateUserCoverImg))

   router.route("/c/:username").get(verifyjwt , getUserChannelProfile)

   router.route("/history").get(verifyjwt , GetWatchHistory)


export default router;
