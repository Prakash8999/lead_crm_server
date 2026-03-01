import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env["PORT"] ?? 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

export default app;
