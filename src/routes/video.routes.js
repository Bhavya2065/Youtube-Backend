import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, editVideoDetail, searchVideo, uploadVideo, watchVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/upload-video").post(verifyJWT, upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), uploadVideo);
router.route("/watch/:id").get(verifyJWT, watchVideo);
router.route("/update-video/:id").post(verifyJWT, upload.single('thumbnail'), editVideoDetail);
router.route("/search-query/:query").get(verifyJWT, searchVideo);
router.route("/delete-video/:id").get(verifyJWT, deleteVideo);

export default router;