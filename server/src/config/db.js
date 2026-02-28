const mongoose = require("mongoose");
const { Pool } = require("pg");

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { directConnection: true });
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

const pgPool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT, 10),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pgPool.on("connect", () => {
  console.log("[db] PostgreSQL client connected");
});

pgPool.on("error", (err) => {
  console.error("[db] Unexpected PostgreSQL error:", err.message);
});

module.exports = { connectMongo, pgPool };
