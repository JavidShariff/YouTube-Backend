import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoid").get(getVideoComments).post(addComment);
router.route("/c/:commentid").delete(deleteComment).patch(updateComment);

export default router