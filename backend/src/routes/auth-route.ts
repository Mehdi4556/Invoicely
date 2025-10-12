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

// 👤 Get current user from session (for OAuth)
router.get("/user", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    const user = req.user as any;
    res.json({
      id: user.id,
      name: user.login,
      email: user.gmail,
      picture: user.profilePicture,
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// 🚪 Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        return res.status(500).json({ error: "Session destruction failed" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

export default router;

