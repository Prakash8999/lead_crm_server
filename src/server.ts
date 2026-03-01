import express, { Request, Response, NextFunction } from "express";
import { env } from "./config/env";
import { setupSwagger } from "./config/docs/swagger";

const app = express();
const PORT = env.PORT;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Docs (Swagger UI — auto-generated from Zod schemas) ───────────────────
setupSwagger(app);

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
    res.json({ message: "Lead CRM Server is running 🚀", status: "ok" });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err.message);
    res.status(500).json({ error: "Internal server error" });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

console.log("envs ", env)

export default app;
