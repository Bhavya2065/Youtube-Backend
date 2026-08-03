import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, editComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/v/:id").post(verifyJWT, addComment);
router.route("/c/:commentId")
    .patch(verifyJWT, editComment)
    .delete(verifyJWT, deleteComment);

export default router;