import { Router } from "express";
import {loggedOutUser, loginUser, registerUser,refreshAccessToken,changeCurrentPassword} from "../controllers/user.controller.js"
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

router.route("/changepassword").post(verifyJWT,changeCurrentPassword);

export default router;