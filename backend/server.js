const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const sql = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;


app.set("trust proxy", 1);


app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);


app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10000, 
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: __dirname,
    }),
    secret:
      process.env.SESSION_SECRET ||
      "space-alone-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, 
    },
  }),
);


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


const authRoutes = require("./routes/auth")(sql);
const postsRoutes = require("./routes/posts")(sql);
const solarRoutes = require("./routes/solar")(sql);
const nasaRoutes = require("./routes/nasa");
const spacexRoutes = require("./routes/spacex");
const uploadsRoutes = require("./routes/uploads");
const newsRoutes = require("./routes/news"); 

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/solar-config", solarRoutes);
app.use("/api/nasa", nasaRoutes);
app.use("/api/spacex", spacexRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/news", newsRoutes); 


app.use(express.static(path.join(__dirname, "../frontend")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/blog", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/blog.html"));
});

app.get("/post", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/post.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin.html"));
});
app.get("/news", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/news.html"));
});
app.get("/api/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/api.html"));
});


app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});


app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});


app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});


process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await sql.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  await sql.end();
  process.exit(0);
});



app.listen(PORT, "0.0.0.0", () => {
  console.log("\n🚀 ═══════════════════════════════════════════════════════");
  console.log("   Space Alone Server Started Successfully");
  console.log("   ═══════════════════════════════════════════════════════");
  console.log(`   🌐 Frontend:    http://localhost:${PORT}`);
  console.log(`   🔐 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`   🔑 Login:       http://localhost:${PORT}/login`);
  console.log(`   📡 API Docs:    http://localhost:${PORT}/api/docs`);
  console.log(`   🏥 Health:      http://localhost:${PORT}/api/health`);
  console.log(`   📊 Status:      http://localhost:${PORT}/api/status`);
  console.log(`   📰 News API:    http://localhost:${PORT}/api/news`);
  console.log(`   🔐 Auth Method: Session-based (No JWT)`);
  console.log(`   💾 Database:    PostgreSQL (Koyeb)`);
  console.log(`   🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   ⚡ Node:        ${process.version}`);
  console.log("   ═══════════════════════════════════════════════════════\n");
});
