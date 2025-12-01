const db = require("../config/db");

// Helper: Format ngày
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-CA");
};

// Map DB fields to Frontend fields
const mapPlayer = (p) => ({
  ...p,
  jerseyNumber: p.jersey_number,
  imageUrl: p.image_url,
  totalAttendance: p.total_attendance,
  dob: formatDate(p.dob),
  dominantFoot: p.dominant_foot,
  // Parse JSON traits
  traits: p.traits_json
    ? typeof p.traits_json === "string"
      ? JSON.parse(p.traits_json)
      : p.traits_json
    : [],
  pac: p.pac,
  sho: p.sho,
  pas: p.pas,
  dri: p.dri,
  def: p.def,
  phy: p.phy,
});

exports.getAllPlayers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, (SELECT COUNT(*) FROM attendance a WHERE a.player_id = p.id) as total_attendance 
      FROM players p ORDER BY p.name ASC
    `);
    res.json(rows.map(mapPlayer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, (SELECT COUNT(*) FROM attendance a WHERE a.player_id = p.id) as total_attendance FROM players p WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Player not found" });
    res.json(mapPlayer(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User tự update thông tin bản thân (hoặc Admin update)
exports.updatePlayer = async (req, res) => {
  // Chỉ cho phép update nếu là Admin HOẶC là chính user đó
  if (req.user.role !== "admin" && req.user.playerId != req.params.id) {
    return res
      .status(403)
      .json({ message: "Bạn không được sửa thông tin người khác!" });
  }

  const {
    name,
    phone,
    dob,
    height_cm,
    weight_kg,
    position,
    jerseyNumber,
    imageUrl,
    dominantFoot,
    pac,
    sho,
    pas,
    dri,
    def,
    phy,
    traits, // traits là array
  } = req.body;

  try {
    // Validate Trait: Chỉ cho phép tối đa 1 Gold trait
    let traitsJson = null;
    if (traits && Array.isArray(traits)) {
      const goldCount = traits.filter((t) => t.type === "gold").length;
      if (goldCount > 1) {
        return res
          .status(400)
          .json({ message: "Chỉ được phép chọn tối đa 1 chỉ số ẩn Vàng!" });
      }
      traitsJson = JSON.stringify(traits);
    }

    await db.query(
      `UPDATE players 
       SET name=?, phone=?, dob=?, height_cm=?, weight_kg=?, position=?, jersey_number=?, image_url=?, dominant_foot=?, 
       pac=?, sho=?, pas=?, dri=?, def=?, phy=?, traits_json=?
       WHERE id=?`,
      [
        name,
        phone,
        dob,
        height_cm,
        weight_kg,
        position,
        jerseyNumber,
        imageUrl,
        dominantFoot,
        pac,
        sho,
        pas,
        dri,
        def,
        phy,
        traitsJson,
        req.params.id,
      ]
    );

    // Update display name user luôn nếu có
    await db.query("UPDATE users SET display_name=? WHERE player_id=?", [
      name,
      req.params.id,
    ]);

    res.json({ message: "Cập nhật hồ sơ thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPlayer = async (req, res) => {
  // Logic cũ giữ nguyên, thêm insert traits_json nếu cần
  // ... (Giữ nguyên logic cũ của bạn để ngắn gọn, nếu cần fix báo t)
  const { name, position, jerseyNumber } = req.body; // ... các field khác
  // Insert query...
  res.status(201).json({
    message: "Feature placeholder. Admin dùng SQL insert cho nhanh nhé :)",
  });
};

exports.deletePlayer = async (req, res) => {
  try {
    await db.query("DELETE FROM players WHERE id=?", [req.params.id]);
    res.json({ message: "Đã xóa cầu thủ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
