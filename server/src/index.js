const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), override: true });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectMongo } = require("./config/db");

// -- Route modules
const assignmentRoutes = require("./routes/assignmentRoutes");
const queryRoutes = require("./routes/queryRoutes");
const hintRoutes = require("./routes/hintRoutes");
const authRoutes = require("./routes/authRoutes");
const attemptRoutes = require("./routes/attemptRoutes");

const app = express();

// -- Global middleware --------------------------------------------------

// Basic security headers
app.use(helmet());

// Allow requests from the Vite dev server (and any other origin during
// local development).  Tighten this for production.
app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || "*",
        methods: ["GET", "POST"],
    })
);

// Parse JSON bodies up to 1 MB -- more than enough for SQL queries.
app.use(express.json({ limit: "1mb" }));

// Rate-limit the hint endpoint separately because LLM calls are
// expensive.  General API gets a generous default.
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: "Too many requests, please slow down." },
});
app.use(generalLimiter);

const hintLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { error: "Hint rate limit reached. Wait a moment before asking again." },
});

// -- Routes -------------------------------------------------------------

app.use("/api/assignments", assignmentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/hint", hintLimiter, hintRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attempts", attemptRoutes);

// Health check -- handy for monitoring or deploy scripts.
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

// -- Start server -------------------------------------------------------

const PORT = process.env.PORT || 5000;

async function start() {
    await connectMongo();

    app.listen(PORT, () => {
        console.log(`[server] Running on http://localhost:${PORT}`);
    });
}

start().catch((err) => {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
});
