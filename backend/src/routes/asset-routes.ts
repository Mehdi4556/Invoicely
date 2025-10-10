import express from "express";
import { upload, uploadLogo, deleteAsset } from "../controllers/asset-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

// All asset routes are protected
router.use(authMiddleware);

// 📤 Upload logo
router.post("/upload", upload.single("logo"), uploadLogo);

// 🗑️ Delete asset
router.delete("/:filename", deleteAsset);

export default router;

