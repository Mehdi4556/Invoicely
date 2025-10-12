import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import passport, { initializePassport } from "./config/passport.js";

// Initialize passport with env vars
initializePassport();

// Import routes
import authRoutes from "./routes/auth-route.js";
import googleAuthRoutes from "./routes/google-auth-route.js";
import invoiceRoutes from "./routes/invoice-routes.js";
import assetRoutes from "./routes/asset-routes.js";
import { sessionAuthMiddleware } from "./middlewares/session-auth-middleware.js";
import { getInvoices } from "./controllers/invoice-controller.js";

// Import middlewares
import { errorMiddleware } from "./middlewares/error-middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Session configuration (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "invoicely-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Invoicely API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/google-auth", googleAuthRoutes);

// Session-based invoice route for Google Auth users (must come before JWT routes)
app.get("/api/invoices", sessionAuthMiddleware, getInvoices);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/assets", assetRoutes);

// Error handling middleware
app.use(errorMiddleware);

export default app;

