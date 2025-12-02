const db = require("../config/db");

// 1. Lấy danh sách session
exports.getAllSessions = async (req, res) => {
  try {
    const userRole = req.user.role;
    const playerId = req.user.playerId;

    const [rows] = await db.query(
      "SELECT id, date, note, status, created_at, secret_icon_id FROM sessions ORDER BY date DESC"
    );

    const sessions = await Promise.all(
      rows.map(async (session) => {
        const [attendees] = await db.query(
          `SELECT p.id, p.name, p.image_url, p.jersey_number, p.position 
           FROM attendance a JOIN players p ON a.player_id = p.id 
           WHERE a.session_id = ?`,
          [session.id]
        );

        if (userRole === "admin") {
          return { ...session, attendees, attendeeCount: attendees.length };
        } else {
          // User thường: Chỉ thấy bản thân và tổng số
          const myCheckIn = attendees.find((p) => p.id === playerId);
          return {
            ...session,
            secret_icon_id: null, // Ẩn mật khẩu
            attendees: myCheckIn ? [myCheckIn] : [],
            attendeeCount: attendees.length,
          };
        }
      })
    );
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ... giữ nguyên createSession ...
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

// 3. FIX: Self Check-in
exports.selfCheckIn = async (req, res) => {
  const playerId = req.user.playerId;
  const { sessionId, selectedIconId } = req.body;

  if (!playerId)
    return res.status(400).json({ message: "Lỗi: Không tìm thấy Player ID." });

  try {
    // Check Session
    const [sessions] = await db.query(
      "SELECT status, secret_icon_id FROM sessions WHERE id = ?",
      [sessionId]
    );
    if (sessions.length === 0)
      return res.status(404).json({ message: "Buổi tập không tồn tại." });
    const session = sessions[0];

    if (session.status !== "OPEN")
      return res.status(400).json({ message: "Buổi tập đã đóng sổ!" });

    // Check Block
    const [attempts] = await db.query(
      "SELECT blocked FROM attendance_attempts WHERE session_id=? AND player_id=?",
      [sessionId, playerId]
    );
    if (attempts.length > 0 && attempts[0].blocked) {
      return res
        .status(403)
        .json({ message: "Bạn đã bị CHẶN do chọn sai Icon! Hãy gặp Admin." });
    }

    // Verify Icon (Nếu session có đặt pass)
    if (session.secret_icon_id && session.secret_icon_id !== selectedIconId) {
      // Sai => Log attempt => Block
      await db.query(
        `INSERT INTO attendance_attempts (session_id, player_id, attempt_count, blocked) 
         VALUES (?, ?, 1, 1) 
         ON DUPLICATE KEY UPDATE attempt_count = attempt_count + 1, blocked = 1`,
        [sessionId, playerId]
      );
      return res
        .status(403)
        .json({ message: "SAI BIỂU TƯỢNG! Bạn đã bị chặn." });
    }

    // Đúng => Điểm danh
    await db.query(
      "INSERT IGNORE INTO attendance (session_id, player_id) VALUES (?, ?)",
      [sessionId, playerId]
    );
    res.json({ success: true, message: "Điểm danh thành công!" });
  } catch (err) {
    console.error("Check-in Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ... Các hàm admin khác giữ nguyên ...
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
