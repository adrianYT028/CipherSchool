const { pgPool } = require("../config/db");

// -- Sandbox service ----------------------------------------------------
// Manages per-session PostgreSQL schemas so every student gets their own
// isolated set of tables.  We lean on Postgres schemas rather than
// separate databases because schemas are lightweight and fast to create.

/**
 * Creates a schema for the given session if it doesn't already exist.
 * Schema names are sanitised to only allow alphanumerics and underscores.
 */
const ensureSchema = async (sessionId) => {
    const schemaName = _safeSchemaName(sessionId);
    const client = await pgPool.connect();
    try {
        await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    } finally {
        client.release();
    }
    return schemaName;
};

/**
 * Populates the given schema with the sample tables for an assignment.
 * Skips tables that already exist so repeated calls are idempotent.
 */
const loadTables = async (sessionId, sampleTables) => {
    if (!sampleTables || sampleTables.length === 0) return;

    const schemaName = _safeSchemaName(sessionId);
    const client = await pgPool.connect();

    try {
        for (const table of sampleTables) {
            const fullTableName = `${schemaName}.${_sanitizeIdentifier(table.tableName)}`;

            // Check whether the table exists already -- avoids duplicate inserts.
            const exists = await client.query(
                `SELECT to_regclass($1) AS oid`,
                [fullTableName]
            );

            if (exists.rows[0].oid !== null) {
                continue; // table already set up, nothing to do
            }

            // Infer column types from sample data
            const colTypes = _inferColumnTypes(table.columns, table.rows);
            const colDefs = table.columns
                .map((col, idx) => `${_sanitizeIdentifier(col)} ${colTypes[idx]}`)
                .join(", ");

            await client.query(`CREATE TABLE ${fullTableName} (${colDefs})`);

            // Insert sample rows if we have them.
            if (table.rows && table.rows.length > 0) {
                const colNames = table.columns
                    .map((c) => _sanitizeIdentifier(c))
                    .join(", ");

                for (const row of table.rows) {
                    const placeholders = row.map((_, i) => `$${i + 1}`).join(", ");
                    // Cast everything to string so the columns accept it.
                    const values = row.map((v) => (v === null ? null : String(v)));
                    await client.query(
                        `INSERT INTO ${fullTableName} (${colNames}) VALUES (${placeholders})`,
                        values
                    );
                }
            }
        }
    } finally {
        client.release();
    }
};

/**
 * Runs a user query inside the session's schema.  We set search_path
 * before executing so the student can write simple table names like
 * "SELECT * FROM users" instead of "SELECT * FROM workspace_xyz.users".
 *
 * The query runs inside a READ-ONLY transaction as an extra safety net.
 */
const executeQuery = async (sessionId, sql) => {
    const schemaName = _safeSchemaName(sessionId);
    const client = await pgPool.connect();

    try {
        await client.query("BEGIN READ ONLY");
        await client.query(`SET search_path TO ${schemaName}`);

        const result = await client.query(sql);

        await client.query("COMMIT");

        return {
            columns: result.fields.map((f) => f.name),
            rows: result.rows,
        };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

/**
 * Tears down a session's schema and all its tables.
 * Useful for cleanup or "reset assignment" functionality.
 */
const cleanupSchema = async (sessionId) => {
    const schemaName = _safeSchemaName(sessionId);
    const client = await pgPool.connect();
    try {
        await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    } finally {
        client.release();
    }
};

// -- Helpers ------------------------------------------------------------

// Turns a session ID into a valid schema name.  We prefix with
// "workspace_" so it never collides with built-in schemas (public, etc).
function _safeSchemaName(sessionId) {
    return "workspace_" + sessionId.replace(/[^a-zA-Z0-9_]/g, "_");
}

// Strips anything that isn't a letter, digit, or underscore from a
// SQL identifier.  This is NOT meant to handle every edge case --
// it's a quick guard because our sample data is admin-controlled.
function _sanitizeIdentifier(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, "_");
}

// Infer PostgreSQL column types from sample data.
// Checks all rows to determine if a column is numeric.
function _inferColumnTypes(columns, rows) {
    if (!rows || rows.length === 0) {
        return columns.map(() => "TEXT");
    }

    return columns.map((_, colIdx) => {
        const allNumeric = rows.every((row) => {
            const val = row[colIdx];
            if (val === null || val === undefined || val === "") return true;
            const str = String(val).trim();
            // Check if it's a valid number (integer or decimal)
            return /^-?\d+(\.\d+)?$/.test(str);
        });
        return allNumeric ? "NUMERIC" : "TEXT";
    });
}

module.exports = {
    ensureSchema,
    loadTables,
    executeQuery,
    cleanupSchema,
};
