const { pgPool } = require("../config/db");

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

const loadTables = async (sessionId, sampleTables) => {
    if (!sampleTables || sampleTables.length === 0) return;

    const schemaName = _safeSchemaName(sessionId);
    const client = await pgPool.connect();

    try {
        for (const table of sampleTables) {
            const fullTableName = `${schemaName}.${_sanitizeIdentifier(table.tableName)}`;

            const exists = await client.query(
                `SELECT to_regclass($1) AS oid`,
                [fullTableName]
            );

            if (exists.rows[0].oid !== null) {
                continue;
            }

            const colTypes = _inferColumnTypes(table.columns, table.rows);
            const colDefs = table.columns
                .map((col, idx) => `${_sanitizeIdentifier(col)} ${colTypes[idx]}`)
                .join(", ");

            await client.query(`CREATE TABLE ${fullTableName} (${colDefs})`);

            if (table.rows && table.rows.length > 0) {
                const colNames = table.columns
                    .map((c) => _sanitizeIdentifier(c))
                    .join(", ");

                for (const row of table.rows) {
                    const placeholders = row.map((_, i) => `$${i + 1}`).join(", ");
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

const cleanupSchema = async (sessionId) => {
    const schemaName = _safeSchemaName(sessionId);
    const client = await pgPool.connect();
    try {
        await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    } finally {
        client.release();
    }
};

function _safeSchemaName(sessionId) {
    return "workspace_" + sessionId.replace(/[^a-zA-Z0-9_]/g, "_");
}

function _sanitizeIdentifier(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, "_");
}

function _inferColumnTypes(columns, rows) {
    if (!rows || rows.length === 0) {
        return columns.map(() => "TEXT");
    }

    return columns.map((_, colIdx) => {
        const allNumeric = rows.every((row) => {
            const val = row[colIdx];
            if (val === null || val === undefined || val === "") return true;
            const str = String(val).trim();
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
