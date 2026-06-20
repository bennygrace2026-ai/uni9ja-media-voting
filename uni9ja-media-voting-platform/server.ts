import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initDb } from "./src/server/db.js";
import authRoutes from "./src/server/routes/auth.js";
import contestantRoutes from "./src/server/routes/contestants.js";
import voteRoutes from "./src/server/routes/votes.js";
import adminRoutes from "./src/server/routes/admin.js";
import competitionRoutes from "./src/server/routes/competitions.js";
import uploadRoutes from "./src/server/routes/upload.js";
import cmsRoutes from "./src/server/routes/cms.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize database
  await initDb();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files statically
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/contestants", contestantRoutes);
  app.use("/api/votes", voteRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/competitions", competitionRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api", cmsRoutes);

  // Health check for deployment verification
  app.get("/health", (req, res) => res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }));

  // 404 fallback for API routes to prevent falling back to index.html
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Global error handler for API routes (4 arguments required for error handler)
  app.use("/api", (err: any, req: any, res: any, next: any) => {
    console.error("[API Error]", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
