import db from "./config/db.js";
import bcrypt from "bcryptjs";

const resetPasswords = async () => {
  try {
    console.log("🔄 Đang reset mật khẩu toàn bộ user về '123'...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123", salt);

    await db.query("UPDATE users SET password = ?", [hashedPassword]);
    console.log("✅ Thành công!");
    process.exit();
  } catch (err) {
    console.error("❌ Lỗi:", err);
    process.exit(1);
  }
};

resetPasswords();
