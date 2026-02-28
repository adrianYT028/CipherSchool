// -- SQL sanitization middleware -----------------------------------------
// Blocks queries that could modify schema or data.  We only allow SELECT
// statements in the sandbox so students can't break the sample tables.

// Keywords that signal destructive or schema-altering operations.
const BLOCKED_KEYWORDS = [
    "DROP",
    "ALTER",
    "TRUNCATE",
    "DELETE",
    "UPDATE",
    "INSERT",
    "CREATE",
    "GRANT",
    "REVOKE",
    "COPY",
    "\\\\",        // backslash commands in psql
];

/**
 * Checks whether a raw SQL string contains anything we don't want to run
 * inside the student sandbox.  Returns an object with { safe, reason }.
 */
const validateSQL = (rawSQL) => {
    if (!rawSQL || typeof rawSQL !== "string") {
        return { safe: false, reason: "Query cannot be empty." };
    }

    const trimmed = rawSQL.trim();
    if (trimmed.length === 0) {
        return { safe: false, reason: "Query cannot be empty." };
    }

    // Normalise to uppercase for keyword matching but keep the
    // original string for execution.
    const upper = trimmed.toUpperCase();

    for (const keyword of BLOCKED_KEYWORDS) {
        // Use word-boundary check so we don't accidentally block column
        // names that happen to contain a keyword (e.g. "updated_at").
        const pattern = new RegExp(`\\b${keyword}\\b`);
        if (pattern.test(upper)) {
            return {
                safe: false,
                reason: `Queries containing "${keyword}" are not allowed in the sandbox.`,
            };
        }
    }

    // Make sure the statement actually starts with SELECT or WITH (for CTEs).
    if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
        return {
            safe: false,
            reason: "Only SELECT queries (and CTEs starting with WITH) are permitted.",
        };
    }

    return { safe: true, reason: null };
};

/**
 * Express middleware that validates the `sql` field on the request body.
 * Attaches the cleaned SQL to req.cleanSQL on success.
 */
const sanitizeMiddleware = (req, res, next) => {
    const { sql } = req.body;
    const result = validateSQL(sql);

    if (!result.safe) {
        return res.status(400).json({ error: result.reason });
    }

    // Strip trailing semicolons -- pg will complain about multiple
    // statements if we leave them in and the user accidentally typed two.
    req.cleanSQL = sql.trim().replace(/;+\s*$/, "");
    next();
};

module.exports = { validateSQL, sanitizeMiddleware };
