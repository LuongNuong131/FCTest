const mysql = require("mysql2");
require("dotenv").config();

console.log("🔌 Đang thử kết nối tới Aiven MySQL...");
console.log(`   - Host: ${process.env.DB_HOST}`);
console.log(`   - User: ${process.env.DB_USER}`);
console.log(`   - Port: ${process.env.DB_PORT}`);
// KHÔNG log password ra console để bảo mật

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
  // Thêm connectTimeout để tránh treo quá lâu nếu mạng lag
  connectTimeout: 20000,
});

const promisePool = pool.promise();

// Test connection ngay khi start server
promisePool
  .getConnection()
  .then((conn) => {
    console.log("✅ KẾT NỐI THÀNH CÔNG TỚI AIVEN DATABASE!");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ LỖI KẾT NỐI DATABASE:");
    console.error(`   - Code: ${err.code}`);
    console.error(`   - Errno: ${err.errno}`);
    console.error(`   - SqlState: ${err.sqlState}`);
    console.error(`   - Message: ${err.message}`);
    // Gợi ý fix lỗi phổ biến
    if (err.code === "ECONNREFUSED")
      console.log("👉 Gợi ý: Kiểm tra Host/Port hoặc Firewall chặn kết nối.");
    if (err.code === "ER_ACCESS_DENIED_ERROR")
      console.log("👉 Gợi ý: Sai Username hoặc Password.");
    if (err.code === "ENOTFOUND")
      console.log("👉 Gợi ý: Host không tồn tại (DNS Error).");
    if (err.code === "HANDSHAKE_SSL_ERROR")
      console.log("👉 Gợi ý: Lỗi SSL. Kiểm tra cấu hình SSL.");
  });

module.exports = promisePool;
