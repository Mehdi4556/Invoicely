import type { Request, Response, NextFunction } from "express";

export const sessionAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    // Attach user info to request for consistency with JWT middleware
    const user = req.user as any;
    (req as any).userId = user.id;
    (req as any).userEmail = user.gmail;
    next();
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
};
