const db = require("../config/db");

// Lấy danh sách custom traits
exports.getAllTraits = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM custom_traits ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Lỗi lấy danh sách traits:", err);
    res.status(500).json({ error: "Không thể lấy danh sách chỉ số ẩn." });
  }
};

// Tạo custom trait mới
exports.createTrait = async (req, res) => {
  const { name, type, image_url, description } = req.body;

  if (!name || !image_url) {
    return res
      .status(400)
      .json({ message: "Thiếu thông tin (Tên hoặc Hình ảnh)." });
  }

  const id = "ct_" + Date.now(); // Tạo ID đơn giản
  try {
    await db.query(
      "INSERT INTO custom_traits (id, name, type, image_url, description) VALUES (?, ?, ?, ?, ?)",
      [id, name, type || "normal", image_url, description]
    );
    res.json({ message: "Tạo chỉ số ẩn thành công", id });
  } catch (err) {
    console.error("Lỗi tạo trait:", err);
    res.status(500).json({ error: err.message });
  }
};
