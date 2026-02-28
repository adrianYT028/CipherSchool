const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "ciphersql_secret_key_2026";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authentication required." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found." });
        }

        req.user = user;
        req.userId = user._id;

        next();
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token." });
        }
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired." });
        }
        console.error("[authMiddleware]", err);
        res.status(500).json({ error: "Authentication failed." });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (user) {
            req.user = user;
            req.userId = user._id;
        }

        next();
    } catch (err) {
        next();
    }
};

module.exports = { authMiddleware, optionalAuth };
