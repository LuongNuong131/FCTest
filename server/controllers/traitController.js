const db = require('../config/db');

exports.getAllCustomTraits = async (req, res) => {
  try {
    const [traits] = await db.query('SELECT * FROM custom_traits ORDER BY created_at DESC');
    res.json(traits);
  } catch (error) {
    console.error('Get custom traits error:', error);
    res.status(500).json({ error: 'Failed to fetch custom traits' });
  }
};

exports.createCustomTrait = async (req, res) => {
  try {
    const { id, name, image_url, description } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'ID and name are required' });
    }

    await db.query(
      'INSERT INTO custom_traits (id, name, image_url, description) VALUES (?, ?, ?, ?)',
      [id, name, image_url, description]
    );

    res.status(201).json({ message: 'Custom trait created successfully', id });
  } catch (error) {
    console.error('Create custom trait error:', error);
    res.status(500).json({ error: 'Failed to create custom trait' });
  }
};

exports.updateCustomTrait = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image_url, description } = req.body;

    await db.query(
      'UPDATE custom_traits SET name = ?, image_url = ?, description = ? WHERE id = ?',
      [name, image_url, description, id]
    );

    res.json({ message: 'Custom trait updated successfully' });
  } catch (error) {
    console.error('Update custom trait error:', error);
    res.status(500).json({ error: 'Failed to update custom trait' });
  }
};

exports.deleteCustomTrait = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM custom_traits WHERE id = ?', [id]);
    res.json({ message: 'Custom trait deleted successfully' });
  } catch (error) {
    console.error('Delete custom trait error:', error);
    res.status(500).json({ error: 'Failed to delete custom trait' });
  }
};
