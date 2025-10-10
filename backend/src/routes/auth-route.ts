import express from "express";
import { signup, login, getCurrentUser } from "../controllers/auth-controller.js";
import { googleAuth, googleAuthCallback, googleAuthSuccess } from "../controllers/google-auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

// 📝 Signup
router.post("/signup", signup);

// 🔐 Login
router.post("/login", login);

// 👤 Get current user (protected)
router.get("/me", authMiddleware, getCurrentUser);

// 🔐 Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);
router.get("/google/success", authMiddleware, googleAuthSuccess);

export default router;

