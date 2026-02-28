const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// JWT secret - in production use a proper secret from env
const JWT_SECRET = process.env.JWT_SECRET || "ciphersql_secret_key_2026";
const JWT_EXPIRES_IN = "7d";

// -------------------------------------------------------------------
// POST /api/auth/register
// Create a new user account
// -------------------------------------------------------------------
router.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({
                error: "Email, password, and name are required.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters.",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: "An account with this email already exists.",
            });
        }

        // Create user
        const user = new User({ email, password, name });
        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        res.status(201).json({
            message: "Account created successfully.",
            token,
            user: user.toJSON(),
        });
    } catch (err) {
        console.error("[auth/register]", err);
        res.status(500).json({ error: "Failed to create account." });
    }
});

// -------------------------------------------------------------------
// POST /api/auth/login
// Authenticate user and return JWT
// -------------------------------------------------------------------
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required.",
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password.",
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                error: "Invalid email or password.",
            });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        res.json({
            message: "Login successful.",
            token,
            user: user.toJSON(),
        });
    } catch (err) {
        console.error("[auth/login]", err);
        res.status(500).json({ error: "Failed to log in." });
    }
});

// -------------------------------------------------------------------
// GET /api/auth/me
// Get current user from token
// -------------------------------------------------------------------
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found." });
        }

        res.json({ user: user.toJSON() });
    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Invalid or expired token." });
        }
        console.error("[auth/me]", err);
        res.status(500).json({ error: "Failed to get user." });
    }
});

module.exports = router;
