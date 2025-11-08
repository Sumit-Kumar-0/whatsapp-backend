import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import vendorRoutes from "./routes/vendor.js";
import facebookRoutes from "./routes/facebook.js";

dotenv.config();

const app = express();

/* ✅ Fix: Required for NGROK, Cloudflare, Vercel, Render */
app.set("trust proxy", 1);

/* ✅ Fix: Helmet CSP disabled (otherwise Next.js + Ngrok breaks GET API) */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ✅ Fix: CORS for both dev ngrok URLs */
app.use(
  cors({
    origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL,   // Ngrok frontend
    "https://*.ngrok-free.dev"  // Allow any ngrok subdomain
  ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

/* ✅ Required for OPTIONS preflight */
app.options(
  "*",
  cors({
    origin: [
      process.env.FRONTEND_URL,
      "https://*.ngrok-free.dev",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(cookieParser());

/* ✅ Rate limiting */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/", generalLimiter);

/* ✅ Body Parser */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ✅ MongoDB connect */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

mongoose.connection.on("connected", () =>
  console.log("📊 DB:", mongoose.connection.db.databaseName)
);

/* ✅ Health */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server healthy ✅",
    time: new Date().toISOString(),
  });
});

/* ✅ API ROOT */
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "WANotifier API Running ✅",
  });
});

/* ✅ Root */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Live ✅",
  });
});

/* ✅ ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/facebook", facebookRoutes);

/* ✅ Global Error Handler */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* ✅ 404 Route */
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ✅ Start Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
