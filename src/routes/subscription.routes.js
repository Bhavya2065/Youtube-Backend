import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createSubscriberRecord, deleteSubscriberRecord } from "../controllers/subscription.controller.js";

const router = Router();
router.route("/c/:channelId").post(verifyJWT, createSubscriberRecord)
router.route("/c/:channelId").delete(verifyJWT, deleteSubscriberRecord)

export default router;