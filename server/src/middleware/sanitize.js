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
    "\\\\",
];

const validateSQL = (rawSQL) => {
    if (!rawSQL || typeof rawSQL !== "string") {
        return { safe: false, reason: "Query cannot be empty." };
    }

    const trimmed = rawSQL.trim();
    if (trimmed.length === 0) {
        return { safe: false, reason: "Query cannot be empty." };
    }

    const upper = trimmed.toUpperCase();

    for (const keyword of BLOCKED_KEYWORDS) {
        const pattern = new RegExp(`\\b${keyword}\\b`);
        if (pattern.test(upper)) {
            return {
                safe: false,
                reason: `Queries containing "${keyword}" are not allowed in the sandbox.`,
            };
        }
    }

    if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
        return {
            safe: false,
            reason: "Only SELECT queries (and CTEs starting with WITH) are permitted.",
        };
    }

    return { safe: true, reason: null };
};

const sanitizeMiddleware = (req, res, next) => {
    const { sql } = req.body;
    const result = validateSQL(sql);

    if (!result.safe) {
        return res.status(400).json({ error: result.reason });
    }

    req.cleanSQL = sql.trim().replace(/;+\s*$/, "");
    next();
};

module.exports = { validateSQL, sanitizeMiddleware };
