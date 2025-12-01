// server/config/db.js
const mysql = require("mysql2");
require("dotenv").config();

// Tạo pool kết nối (Callback based)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false, // Bắt buộc cho Aiven
  },
});

// Chuyển đổi sang Promise wrapper để dùng async/await
const promisePool = pool.promise();

// Test kết nối (Dùng promisePool thay vì pool thường)
promisePool
  .getConnection()
  .then((conn) => {
    console.log("✅ Connected to Aiven MySQL successfully!");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

module.exports = promisePool;
