import type { Request, Response, NextFunction } from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// 🔐 Initiate Google OAuth
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

// 🔄 Google OAuth Callback
export const googleAuthCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", { session: false }, (err: Error, user: any) => {
    if (err) {
      console.error("Google Auth Error:", err);
      return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, gmail: user.gmail },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  })(req, res, next);
};

// ✅ Success page (optional, for testing)
export const googleAuthSuccess = (req: Request, res: Response) => {
  res.json({
    message: "Google authentication successful",
    user: req.user,
  });
};

