const express = require("express");
const Attempt = require("../models/Attempt");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { assignmentId, sql, success, error } = req.body;

        if (!assignmentId || !sql) {
            return res.status(400).json({
                error: "Assignment ID and SQL are required.",
            });
        }

        const attempt = new Attempt({
            user: req.userId,
            assignment: assignmentId,
            sql,
            success: success || false,
            error: error || null,
        });

        await attempt.save();

        res.status(201).json({
            message: "Attempt saved.",
            attempt,
        });
    } catch (err) {
        console.error("[attempts/save]", err);
        res.status(500).json({ error: "Failed to save attempt." });
    }
});

router.get("/:assignmentId", authMiddleware, async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const attempts = await Attempt.find({
            user: req.userId,
            assignment: assignmentId,
        })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ attempts });
    } catch (err) {
        console.error("[attempts/get]", err);
        res.status(500).json({ error: "Failed to get attempts." });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const attempts = await Attempt.find({ user: req.userId })
            .populate("assignment", "title difficulty")
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ attempts });
    } catch (err) {
        console.error("[attempts/getAll]", err);
        res.status(500).json({ error: "Failed to get attempts." });
    }
});

module.exports = router;
