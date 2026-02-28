const mongoose = require("mongoose");

const sampleTableSchema = new mongoose.Schema(
    {
        tableName: { type: String, required: true },
        columns: [{ type: String, required: true }],
        rows: { type: [[mongoose.Schema.Types.Mixed]], default: [] },
    },
    { _id: false }
);

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        question: {
            type: String,
            required: true,
        },
        sampleTables: {
            type: [sampleTableSchema],
            default: [],
        },
        expectedOutput: {
            columns: [{ type: String }],
            rows: { type: [[mongoose.Schema.Types.Mixed]], default: [] },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
