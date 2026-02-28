const mongoose = require("mongoose");

// -- User progress schema -----------------------------------------------
// Tracks each student's latest attempt per assignment.  We key off
// sessionId rather than a full auth user so the app works without login.

const userProgressSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        assignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: true,
        },
        sqlQuery: {
            type: String,
            default: "",
        },
        lastAttempt: {
            type: Date,
            default: Date.now,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        attemptCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Compound index so we can quickly look up "has this session attempted
// this assignment before?"
userProgressSchema.index({ sessionId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model("UserProgress", userProgressSchema);
