import { Router } from "express";
import { loginUser, logoutUser, refreshAcessToken, registerUser, updateUserAvatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar", // These name must be same as the name attribute that use in frontend
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

// secured Routes
router.route("/logout").post(verifyJWT, logoutUser) // Here verifyJWT run first after logoutUser So that In auth middleware we use the next().
router.route("/refresh-token").post(refreshAcessToken)
router.route("/update-avatar").post(verifyJWT, upload.single('avatar'), updateUserAvatar)
export default router;