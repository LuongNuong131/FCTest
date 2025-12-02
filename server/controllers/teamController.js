import db from "../config/db.js"; // FIXED PATH

export const getTeamsWithMembers = async (req, res) => {
  try {
    const [teams] = await db.query(`
      SELECT t.*, p.name as captain_name, p.jersey_number as captain_number, p.image_url as captain_image 
      FROM teams t 
      LEFT JOIN players p ON t.captain_id = p.id
    `);

    const [members] = await db.query(`
      SELECT tm.team_id, p.id, p.name, p.jersey_number, p.position, p.image_url 
      FROM team_members tm
      JOIN players p ON tm.player_id = p.id
      ORDER BY p.jersey_number ASC
    `);

    const result = teams.map((team) => ({
      ...team,
      members: members.filter((m) => m.team_id === team.id),
      memberCount: members.filter((m) => m.team_id === team.id).length,
    }));

    res.json(result);
  } catch (err) {
    console.error("Lỗi lấy danh sách đội:", err);
    res.status(500).json({ error: "Không thể lấy danh sách đội bóng" });
  }
};

export const updateTeamMembers = async (req, res) => {
  const { teamId, playerIds } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM team_members WHERE team_id = ?", [
      teamId,
    ]);

    if (playerIds && playerIds.length > 0) {
      const values = playerIds.map((pid) => [teamId, pid]);
      await connection.query(
        "INSERT INTO team_members (team_id, player_id) VALUES ?",
        [values]
      );
    }

    await connection.commit();
    res.json({ message: "Cập nhật đội hình thành công" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};
