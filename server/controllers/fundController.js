import db from "../config/db.js"; // FIXED PATH

export const getAllFunds = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM funds ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createFund = async (req, res) => {
  const { contributorName, amount, note } = req.body;
  const id = "f" + Date.now().toString(36);
  try {
    await db.query(
      "INSERT INTO funds (id, contributor_name, amount, note) VALUES (?, ?, ?, ?)",
      [id, contributorName, amount, note]
    );
    res.json({ message: "Đã thêm quỹ thành công", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFund = async (req, res) => {
  try {
    await db.query("DELETE FROM funds WHERE id = ?", [req.params.id]);
    res.json({ message: "Đã xóa quỹ thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
