import db from "../config/db.js"; // Đã sửa đường dẫn
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const SECRET_KEY = process.env.JWT_SECRET || "fallback_key";

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query(
      `SELECT u.*, p.image_url as avatar, p.name as player_name 
       FROM users u LEFT JOIN players p ON u.player_id = p.id 
       WHERE u.username = ?`,
      [username]
    );

    if (users.length === 0)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, playerId: user.player_id },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name || user.player_name,
        role: user.role,
        playerId: user.player_id,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
