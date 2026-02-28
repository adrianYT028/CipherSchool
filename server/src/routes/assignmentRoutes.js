const express = require("express");
const Assignment = require("../models/Assignment");

const router = express.Router();

// -- GET /api/assignments -----------------------------------------------
// Returns a trimmed list for the listing page (no sample data, no
// expected output -- those are only needed on the attempt page).

router.get("/", async (_req, res) => {
    try {
        const assignments = await Assignment.find(
            {},
            "title difficulty description"
        ).sort({ difficulty: 1, title: 1 });

        res.json(assignments);
    } catch (err) {
        console.error("[assignments] Failed to fetch list:", err.message);
        res.status(500).json({ error: "Could not retrieve assignments." });
    }
});

// -- GET /api/assignments/:id -------------------------------------------
// Returns the full document including sample tables and expected output.

router.get("/:id", async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found." });
        }

        res.json(assignment);
    } catch (err) {
        // Mongoose throws a CastError when the id format is invalid
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid assignment ID format." });
        }
        console.error("[assignments] Failed to fetch detail:", err.message);
        res.status(500).json({ error: "Could not retrieve assignment." });
    }
});

module.exports = router;
