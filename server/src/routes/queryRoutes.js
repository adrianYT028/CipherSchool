const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Assignment = require("../models/Assignment");
const UserProgress = require("../models/UserProgress");
const { sanitizeMiddleware } = require("../middleware/sanitize");
const { ensureSchema, loadTables, executeQuery } = require("../services/sandboxService");

const router = express.Router();

// -- POST /api/query/execute --------------------------------------------
// Accepts { assignmentId, sessionId (optional), sql }.
// Spins up a personal sandbox schema, loads the assignment's sample
// tables, and runs the user's query in read-only mode.

router.post("/execute", sanitizeMiddleware, async (req, res) => {
    try {
        const { assignmentId } = req.body;
        // If the client didn't send a sessionId, generate one on the fly.
        // The client should persist this to localStorage for subsequent calls.
        const sessionId = req.body.sessionId || uuidv4();
        const sql = req.cleanSQL; // set by the sanitize middleware

        if (!assignmentId) {
            return res.status(400).json({ error: "assignmentId is required." });
        }

        // Pull the assignment to get its sample data.
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found." });
        }

        // Make sure the user has a schema and the sample tables are loaded.
        await ensureSchema(sessionId);
        await loadTables(sessionId, assignment.sampleTables);

        // Run the query.
        const result = await executeQuery(sessionId, sql);

        // Track the attempt in Mongo (fire-and-forget so it doesn't slow
        // down the response).
        _trackAttempt(sessionId, assignmentId, sql).catch((err) => {
            console.error("[query] Failed to track attempt:", err.message);
        });

        res.json({ ...result, sessionId });
    } catch (err) {
        // PostgreSQL query errors have a "position" field pointing to the
        // part of the SQL that failed -- pass it along so the frontend can
        // highlight it.
        console.error("[query] Execution error:", err.message);
        res.status(400).json({
            error: err.message,
            position: err.position || null,
        });
    }
});

// -- Helper: upsert user progress --------------------------------------

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
