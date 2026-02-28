const express = require("express");
const Assignment = require("../models/Assignment");
const { generateHint } = require("../services/hintService");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { assignmentId, userQuery } = req.body;

        if (!assignmentId) {
            return res.status(400).json({ error: "assignmentId is required." });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found." });
        }

        const hint = await generateHint(
            assignment.question,
            userQuery || "",
            assignment.sampleTables
        );

        res.json({ hint });
    } catch (err) {
        console.error("[hint] Failed to generate hint:", err.message);
        res.status(500).json({
            error: "Could not generate a hint right now. Please try again later.",
        });
    }
});

module.exports = router;
