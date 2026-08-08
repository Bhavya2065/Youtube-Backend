import { Router } from "express";
import { addPost, deletePost, editPost, getAllPost, viewPost } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)

// Tweet Routes
router.route("/create-post").post(addPost)
router.route("/view-post/:postId").get(viewPost)
router.route("/get-all-post").get(getAllPost)
router.route("/edit-post/:postId").patch(editPost)
router.route("/delete-post/:postId").delete(deletePost)

export default router;