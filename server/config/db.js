import mysql from "mysql2";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Bắt buộc có SSL cho Aiven
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : null,
});

const promisePool = pool.promise();

// Test kết nối
promisePool
  .getConnection()
  .then((conn) => {
    console.log(`✅ Database Connected: ${process.env.DB_HOST}`);
    conn.release();
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
  });

export default promisePool;
