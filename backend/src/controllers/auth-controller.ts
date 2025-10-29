import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { signupSchema, loginSchema } from "../types/index.js";
import { eq } from "drizzle-orm";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// 📝 Signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validatedData = signupSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.gmail, validatedData.gmail))
    .limit(1);

  if (existingUser.length > 0) {
    res.status(400).json({ error: "User with this email already exists" });
    return;
  }

  // Password is required for regular signup
  if (!validatedData.password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      login: validatedData.login,
      gmail: validatedData.gmail,
      password: hashedPassword,
      googleId: null,
      profilePicture: null,
    })
    .returning();

  if (!newUser) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: newUser.id, gmail: newUser.gmail },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.status(201).json({
    message: "User created successfully",
    user: {
      id: newUser.id,
      login: newUser.login,
      gmail: newUser.gmail,
    },
    token,
  });
});

// 🔐 Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validatedData = loginSchema.parse(req.body);

  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.gmail, validatedData.gmail))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Check if user has a password (not a Google-only user)
  if (!user.password) {
    res.status(401).json({
      error: "This account uses Google Sign-In. Please login with Google.",
      useGoogle: true,
    });
    return;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(
    validatedData.password,
    user.password
  );

  if (!isValidPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id, gmail: user.gmail }, JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      login: user.login,
      gmail: user.gmail,
    },
    token,
  });
});

// 👤 Get current user
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        login: user.login,
        gmail: user.gmail,
        createdAt: user.createdAt,
      },
    });
  }
);
