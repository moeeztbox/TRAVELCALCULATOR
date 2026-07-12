// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes
import authRoutes from "./Routes/auth.js";
import hotelRoutes from "./Routes/hotel.js";
import transportRoutes from "./Routes/transport.js";
import visaRoutes from "./Routes/visa.js";
import ticketRoutes from "./Routes/ticket.js";
import packageRoutes from "./Routes/package.js";

const app = express();

// Middleware
// credentials: true + an explicit origin are required for the browser to
// send/receive the httpOnly session cookie (a wildcard origin won't work).
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Connect MongoDB
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", hotelRoutes);
app.use("/api", transportRoutes);
app.use("/api", visaRoutes);
app.use("/api", ticketRoutes);
app.use("/api", packageRoutes);

// Serve the built React frontend (Frontend/dist) when it exists — this is
// what lets the Electron desktop build load everything from one origin
// (same host/port as the API), which normal `npm run dev` never triggers
// since Frontend/dist isn't built during day-to-day web development.
const frontendDistPath = path.join(__dirname, "..", "Frontend", "dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // SPA fallback so React Router's client-side routes work on refresh —
  // anything not under /api falls back to index.html.
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
