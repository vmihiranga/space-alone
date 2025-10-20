require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const sql = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.set("trust proxy", true);

const performanceTracker = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - startTime;
    res.set("X-Response-Time", `${duration}ms`);
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${duration}ms - ${res.statusCode}`,
    );
    originalSend.call(this, data);
  };

  next();
};

const uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Upload directory created:", uploadDir);
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com",
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],
        imgSrc: ["'self'", "data:", "https:", "blob:", "http:"],
        mediaSrc: ["'self'", "https://cdn.pixabay.com", "data:", "blob:"],
        connectSrc: [
          "'self'",
          "https://images.unsplash.com",
          "https://api.pexels.com",
          "https://api.nasa.gov",
          "http://api.open-notify.org",
          "https://exoplanetarchive.ipac.caltech.edu",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net",
        ],
        workerSrc: ["'self'", "blob:"],
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: "./backend",
    }),
    secret:
      process.env.SESSION_SECRET ||
      "space-alone-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(performanceTracker);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many login attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3000,
  message: {
    error: "API rate limit exceeded",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/nasa", apiLimiter);
app.use("/api/spacex", apiLimiter);
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../frontend")));

const authRoutes = require("./routes/auth")(sql);
const postsRoutes = require("./routes/posts")(sql);
const uploadsRoutes = require("./routes/uploads")(sql);
const solarRoutes = require("./routes/solar")(sql);
const nasaRoutes = require("./routes/nasa");
const spacexRoutes = require("./routes/spacex");

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/solar-config", solarRoutes);
app.use("/api/nasa", nasaRoutes);
app.use("/api/spacex", spacexRoutes);
app.get("/api/health", (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: "ok",
    service: "Space Alone API",
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    },
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    },
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    authMethod: "session",
    database: "PostgreSQL",
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    service: "Space Alone API Gateway",
    version: "1.0.0",
    status: "operational",
    authMethod: "session-based",
    database: "PostgreSQL",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
      uploads: "/api/uploads",
      solar: "/api/solar-config",
      nasa: "/api/nasa",
       spacex: "/api/spacex",
      health: "/api/health",
      docs: "/api/docs",
    },
    resources: [
      { name: "NASA API", status: "active", rateLimit: "30 req/min" },
      { name: "Database", status: "connected", type: "PostgreSQL" },
      { name: "File Storage", status: "active", path: uploadDir },
      { name: "Session Store", status: "active", type: "SQLite" },
    ],
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/api.html"));
});

app.get("/api", (req, res) => {
  res.json({
    message: "Space Alone API",
    version: "1.0.0",
    authMethod: "session-based (no JWT)",
    documentation: "/api/docs",
    endpoints: [
      {
        path: "/api/health",
        method: "GET",
        description: "Health check endpoint",
        resource: "System",
      },
      {
        path: "/api/status",
        method: "GET",
        description: "API status and resources",
        resource: "System",
      },
      {
        path: "/api/auth/login",
        method: "POST",
        description: "User authentication (session-based)",
        resource: "Auth",
      },
      {
        path: "/api/auth/logout",
        method: "POST",
        description: "User logout (destroy session)",
        resource: "Auth",
      },
      {
        path: "/api/auth/verify",
        method: "GET",
        description: "Verify current session",
        resource: "Auth",
      },
      {
        path: "/api/auth/change-password",
        method: "POST",
        description: "Change user password",
        resource: "Auth",
      },
      {
        path: "/api/posts",
        method: "GET/POST",
        description: "Blog posts management",
        resource: "Posts",
      },
      {
        path: "/api/nasa/*",
        method: "GET",
        description: "NASA API endpoints",
        resource: "NASA",
      },
      {
        path: "/api/spacex/*",
        method: "GET",
        description: "SpaceX API endpoints",
        resource: "SpaceX",
      },
      {
        path: "/api/solar-config",
        method: "GET/PUT",
        description: "Solar system configuration",
        resource: "Solar",
      },
      {
        path: "/api/uploads",
        method: "POST",
        description: "File upload endpoint",
        resource: "Uploads",
      },
    ],
    rateLimits: {
      general: "10000 requests per 15 minutes",
      auth: "10 requests per 15 minutes",
      nasa: "30 requests per minute",
      spacex: "30 requests per minute",
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.get("/blog", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/blog.html"));
});

app.get("/post", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/post.html"));
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: "Check /api for available endpoints",
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

async function ensureDatabaseInitialized() {
  try {
    const schemaPath = path.join(__dirname, "models", "schema-postgres.sql");
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await sql.unsafe(schemaSql);
      console.log("✅ PostgreSQL schema ensured");
    } else {
      console.warn("⚠️  PostgreSQL schema file not found at", schemaPath);
    }

    const adminUsers = await sql`SELECT id FROM users WHERE username = 'admin'`;
    if (adminUsers.length === 0) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      await sql`
        INSERT INTO users (username, password, email, role)
        VALUES ('admin', ${passwordHash}, 'admin@spacealone.com', 'admin')
      `;
      console.log("✅ Seeded default admin (admin / admin123)");
    }
  } catch (e) {
    console.error("❌ Failed to initialize database:", e);
    throw e;
  }
}

let server;

async function start() {
  await ensureDatabaseInitialized();
  server = app.listen(PORT, HOST, () => {
    console.log("\n🚀 ═══════════════════════════════════════════════════════");
    console.log("   Space Alone Server Started Successfully");
    console.log("   ═══════════════════════════════════════════════════════");
    console.log(`   🌐 Frontend:    http://${HOST}:${PORT}`);
    console.log(`   🔐 Admin:       http://${HOST}:${PORT}/admin`);
    console.log(`   🔑 Login:       http://${HOST}:${PORT}/login`);
    console.log(`   📡 API Docs:    http://${HOST}:${PORT}/api/docs`);
    console.log(`   🏥 Health:      http://${HOST}:${PORT}/api/health`);
    console.log(`   📊 Status:      http://${HOST}:${PORT}/api/status`);
    console.log(`   🔐 Auth Method: Session-based (No JWT)`);
    console.log(`   💾 Database:    PostgreSQL (Koyeb)`);
    console.log(`   🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   ⚡ Node:        ${process.version}`);
    console.log("   ═══════════════════════════════════════════════════════\n");
  });
}

start().catch((err) => {
  console.error("❌ Server failed to start due to initialization error", err);
  process.exit(1);
});

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} signal received: closing HTTP server`);
  server.close(async () => {
    console.log("✅ HTTP server closed");
    try {
      await sql.end();
      console.log("✅ Database connection closed");
      console.log("👋 Goodbye!\n");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error closing database:", err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("⚠️  Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
