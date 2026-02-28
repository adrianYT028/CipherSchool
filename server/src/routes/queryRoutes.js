const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Assignment = require("../models/Assignment");
const UserProgress = require("../models/UserProgress");
const { sanitizeMiddleware } = require("../middleware/sanitize");
const { ensureSchema, loadTables, executeQuery } = require("../services/sandboxService");

const router = express.Router();

router.post("/execute", sanitizeMiddleware, async (req, res) => {
    try {
        const { assignmentId } = req.body;
        const sessionId = req.body.sessionId || uuidv4();
        const sql = req.cleanSQL;

        if (!assignmentId) {
            return res.status(400).json({ error: "assignmentId is required." });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found." });
        }

        await ensureSchema(sessionId);
        await loadTables(sessionId, assignment.sampleTables);

        const result = await executeQuery(sessionId, sql);

        _trackAttempt(sessionId, assignmentId, sql).catch((err) => {
            console.error("[query] Failed to track attempt:", err.message);
        });

        res.json({ ...result, sessionId });
    } catch (err) {
        console.error("[query] Execution error:", err.message);
        res.status(400).json({
            error: err.message,
            position: err.position || null,
        });
    }
});

async function _trackAttempt(sessionId, assignmentId, sqlQuery) {
    await UserProgress.findOneAndUpdate(
        { sessionId, assignmentId },
        {
            $set: { sqlQuery, lastAttempt: new Date() },
            $inc: { attemptCount: 1 },
        },
        { upsert: true, new: true }
    );
}

module.exports = router;
