import db from "../config/db.js";

const sanitizeInt = (val) => (isNaN(parseInt(val)) ? 0 : parseInt(val));

export const getAllPlayers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM players ORDER BY jersey_number ASC"
    );
    // Lấy stats attendance động
    const players = await Promise.all(
      rows.map(async (p) => {
        const [att] = await db.query(
          "SELECT COUNT(*) as total FROM attendance WHERE player_id = ?",
          [p.id]
        );
        return { ...p, totalAttendance: att[0].total };
      })
    );
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM players WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Not found" });
    const [att] = await db.query(
      "SELECT COUNT(*) as total FROM attendance WHERE player_id = ?",
      [req.params.id]
    );
    res.json({ ...rows[0], totalAttendance: att[0].total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createPlayer = async (req, res) => {
  const body = req.body;
  try {
    let traitsJson = "[]";
    try {
      traitsJson = JSON.stringify(body.traits || []);
    } catch (e) {}
    const validDob = body.dob || null;

    const [result] = await db.query(
      `INSERT INTO players (name, phone, dob, height_cm, weight_kg, position, jersey_number, image_url, dominant_foot, pac, sho, pas, dri, def, phy, traits_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.phone,
        validDob,
        sanitizeInt(body.height_cm),
        sanitizeInt(body.weight_kg),
        body.position,
        sanitizeInt(body.jerseyNumber),
        body.imageUrl,
        body.dominantFoot,
        sanitizeInt(body.pac),
        sanitizeInt(body.sho),
        sanitizeInt(body.pas),
        sanitizeInt(body.dri),
        sanitizeInt(body.def),
        sanitizeInt(body.phy),
        traitsJson,
      ]
    );
    res.json({ success: true, message: "Created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePlayer = async (req, res) => {
  const body = req.body;
  try {
    let traitsJson = "[]";
    try {
      traitsJson =
        typeof body.traits === "object"
          ? JSON.stringify(body.traits)
          : body.traits;
    } catch (e) {}

    await db.query(
      `UPDATE players SET name=?, phone=?, dob=?, height_cm=?, weight_kg=?, position=?, jersey_number=?, image_url=?, dominant_foot=?, pac=?, sho=?, pas=?, dri=?, def=?, phy=?, traits_json=? WHERE id=?`,
      [
        body.name,
        body.phone,
        body.dob || null,
        sanitizeInt(body.height_cm),
        sanitizeInt(body.weight_kg),
        body.position,
        sanitizeInt(body.jerseyNumber),
        body.imageUrl,
        body.dominantFoot,
        sanitizeInt(body.pac),
        sanitizeInt(body.sho),
        sanitizeInt(body.pas),
        sanitizeInt(body.dri),
        sanitizeInt(body.def),
        sanitizeInt(body.phy),
        traitsJson,
        req.params.id,
      ]
    );
    await db.query("UPDATE users SET display_name=? WHERE player_id=?", [
      body.name,
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    await db.query("DELETE FROM players WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
