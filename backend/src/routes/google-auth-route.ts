import express from "express";
import { googleAuth, googleAuthCallback, googleAuthSuccess } from "../controllers/google-auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

// 🔐 Initiate Google OAuth login
router.get("/google", googleAuth);

// 🔄 Google OAuth callback
router.get("/google/callback", googleAuthCallback);

// ✅ Success route (optional, for testing)
router.get("/google/success", authMiddleware, googleAuthSuccess);

export default router;

