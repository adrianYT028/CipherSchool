const mongoose = require("mongoose");

// -------------------------------------------------------------------
// Attempt schema
// Stores each SQL query attempt by a user for an assignment.
// -------------------------------------------------------------------

const attemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true,
        },
        sql: {
            type: String,
            required: true,
        },
        success: {
            type: Boolean,
            default: false,
        },
        error: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for fast lookup of user's attempts per assignment
attemptSchema.index({ user: 1, assignment: 1, createdAt: -1 });

module.exports = mongoose.model("Attempt", attemptSchema);
