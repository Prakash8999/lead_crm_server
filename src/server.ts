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


// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Lead CRM Server is running 🚀', status: 'ok', version: 'v1' });
});

//All Routes
const apiV1 = '/api/v1';
import CompanyRoutes from "./modules/companies/companies.routes";
app.use(`${apiV1}/companies`, CompanyRoutes);

import UserRoutes from "./modules/users/users.routes";
app.use(`${apiV1}/users`, UserRoutes);















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


