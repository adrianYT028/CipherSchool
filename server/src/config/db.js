const mongoose = require("mongoose");
const { Pool } = require("pg");

// -- MongoDB connection -------------------------------------------------
// Uses the Mongoose driver to connect once at server startup.
// The connection string comes from .env so we can swap between local
// and Atlas without touching code.

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { directConnection: true });
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// -- PostgreSQL pool ----------------------------------------------------
// A shared pool keeps a handful of connections open so we don't pay the
// TCP handshake cost on every query.  Each request borrows a client from
// the pool and returns it when done.

const pgPool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT, 10),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 20,           // max connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Quick smoke test on first use so we know the credentials are right.
pgPool.on("connect", () => {
  console.log("[db] PostgreSQL client connected");
});

pgPool.on("error", (err) => {
  console.error("[db] Unexpected PostgreSQL error:", err.message);
});

module.exports = { connectMongo, pgPool };
