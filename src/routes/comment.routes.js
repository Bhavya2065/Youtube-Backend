import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, editComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT)
router.route("/v/:id").post(addComment);
router.route("/c/:commentId")
    .patch(editComment)
    .delete(deleteComment);

export default router;