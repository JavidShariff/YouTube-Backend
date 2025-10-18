import { Router } from "express";
import {loggedOutUser, loginUser, registerUser,refreshAccessToken,changeCurrentPassword, getUser, uploadAvatar, uploadCoverImage, getUserChannelProfile, getUserWatchHistory} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import verifyJWT from "../controllers/auth.middleware.js";
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ])
    ,
    registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT,loggedOutUser);

router.route("/refreshaccesstoken").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT,changeCurrentPassword);

router.route("/current-user").post(verifyJWT,getUser);

router.route("/avatar").patch(verifyJWT,upload.single(avatar),uploadAvatar);

router.route("/cover-image").patch(verifyJWT,upload.single(coverImage),uploadCoverImage);

router.route("/c/:username").get(verifyJWT,getUserChannelProfile);

router.route("/history").get(verifyJWT,getUserWatchHistory);

export default router;