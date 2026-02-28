const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), override: true });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectMongo } = require("./config/db");

const assignmentRoutes = require("./routes/assignmentRoutes");
const queryRoutes = require("./routes/queryRoutes");
const hintRoutes = require("./routes/hintRoutes");
const authRoutes = require("./routes/authRoutes");
const attemptRoutes = require("./routes/attemptRoutes");

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || "*",
        methods: ["GET", "POST"],
    })
);

app.use(express.json({ limit: "1mb" }));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests, please slow down." },
});
app.use(generalLimiter);

const hintLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Hint rate limit reached. Wait a moment before asking again." },
});

app.use("/api/assignments", assignmentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/hint", hintLimiter, hintRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/attempts", attemptRoutes);

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

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
