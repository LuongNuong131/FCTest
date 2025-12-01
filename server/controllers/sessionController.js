const db = require("../config/db");

// Danh sách các Icon hệ thống (Passcode)
// Phải khớp với Frontend
const SYSTEM_ICONS = [
  "soccer-ball",
  "whistle",
  "red-card",
  "tshirt",
  "cleats",
  "trophy",
  "goal",
  "glove",
  "flag",
  "stadium",
];

// 1. Lấy danh sách session
exports.getAllSessions = async (req, res) => {
  try {
    // KHÔNG trả về secret_icon_id để user không soi được
    const [rows] = await db.query(
      "SELECT id, date, note, status, created_at FROM sessions ORDER BY date DESC"
    );

    // Lấy attendees
    const sessions = await Promise.all(
      rows.map(async (session) => {
        const [attendees] = await db.query(
          `SELECT p.id, p.name, p.image_url, p.jersey_number, p.position 
         FROM attendance a JOIN players p ON a.player_id = p.id 
         WHERE a.session_id = ?`,
          [session.id]
        );
        return { ...session, attendees };
      })
    );
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Tạo buổi tập (Admin chọn mật khẩu icon)
exports.createSession = async (req, res) => {
  const { date, note, secretIconId } = req.body;
  const id = "s" + Date.now().toString(36);
  try {
    await db.query(
      "INSERT INTO sessions (id, date, note, status, secret_icon_id) VALUES (?, ?, ?, 'OPEN', ?)",
      [id, date, note, secretIconId]
    );
    res.json({ message: "Tạo buổi tập thành công", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. User tự điểm danh (Có Verify)
exports.selfCheckIn = async (req, res) => {
  const playerId = req.user.playerId;
  const { sessionId, selectedIconId } = req.body;

  if (!playerId) return res.status(400).json({ message: "Lỗi user id" });

  try {
    // 1. Check Session Status & Secret
    const [sessions] = await db.query(
      "SELECT status, secret_icon_id FROM sessions WHERE id = ?",
      [sessionId]
    );
    if (sessions.length === 0)
      return res.status(404).json({ message: "Không thấy buổi tập" });

    const session = sessions[0];
    if (session.status !== "OPEN")
      return res.status(400).json({ message: "Buổi tập đã đóng!" });

    // 2. Check xem user có bị block không
    const [attempts] = await db.query(
      "SELECT blocked FROM attendance_attempts WHERE session_id=? AND player_id=?",
      [sessionId, playerId]
    );
    if (attempts.length > 0 && attempts[0].blocked) {
      return res.status(403).json({
        message: "Bạn đã bị chặn điểm danh do chọn sai icon! Liên hệ Admin.",
      });
    }

    // 3. Verify Icon
    // Nếu admin không set icon (secret_icon_id null) thì cho qua luôn (backward compatibility)
    if (session.secret_icon_id && session.secret_icon_id !== selectedIconId) {
      // SAI MẬT KHẨU -> BLOCK LUÔN
      await db.query(
        `INSERT INTO attendance_attempts (session_id, player_id, attempt_count, blocked) 
             VALUES (?, ?, 1, 1) 
             ON DUPLICATE KEY UPDATE attempt_count = attempt_count + 1, blocked = 1`,
        [sessionId, playerId]
      );
      return res.status(403).json({
        message:
          "SAI MẬT KHẨU! Bạn đã bị chặn báo danh. Hãy ra sân gặp Admin để giải trình :)",
      });
    }

    // 4. Đúng -> Điểm danh
    await db.query(
      "INSERT IGNORE INTO attendance (session_id, player_id) VALUES (?, ?)",
      [sessionId, playerId]
    );
    res.json({ success: true, message: "Điểm danh thành công chuẩn chỉ! ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ... Các hàm Admin khác giữ nguyên (adminCheckIn, adminRemoveCheckIn, deleteSession, updateSessionStatus)
// Giữ nguyên code cũ cho các hàm này để tiết kiệm token
exports.deleteSession = async (req, res) => {
  try {
    await db.query("DELETE FROM sessions WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
exports.updateSessionStatus = async (req, res) => {
  const { status } = req.body;
  try {
    await db.query("UPDATE sessions SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ message: "Updated" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
exports.adminCheckIn = async (req, res) => {
  const { sessionId, playerId } = req.body;
  try {
    await db.query(
      "INSERT IGNORE INTO attendance (session_id, player_id) VALUES (?, ?)",
      [sessionId, playerId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
exports.adminRemoveCheckIn = async (req, res) => {
  const { sessionId, playerId } = req.body;
  try {
    await db.query(
      "DELETE FROM attendance WHERE session_id = ? AND player_id = ?",
      [sessionId, playerId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
