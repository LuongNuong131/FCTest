import "dotenv/config";
import db from "./config/db.js"; // Đảm bảo đường dẫn đúng tới file config/db.js

const testConnection = async () => {
  console.log("🔍 Đang kiểm tra kết nối database...\n");
  try {
    const [rows] = await db.query("SELECT 1+1 as result");
    console.log("✅ Kết nối thành công! Kết quả test:", rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi kết nối:", err.message);
    process.exit(1);
  }
};

testConnection();
