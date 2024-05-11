const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Ensure the database configuration is correctly set up
const authenticateToken = require('../../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const [todos] = await db.query('SELECT * FROM todo WHERE user_id = ?', [req.user.id]);
        res.json(todos);
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [todo] = await db.query('SELECT * FROM todo WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (todo.length === 0) {
            return res.status(404).json({ msg: "Todo not found" });
        }
        res.json(todo[0]);
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { title, description, due_time } = req.body;
    try {
        const result = await db.query('INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, "not started")', [title, description, due_time, req.user.id]);
        res.status(201).json({ msg: "Todo created successfully", todoId: result.insertId });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, due_time, status } = req.body;
    try {
        await db.query('UPDATE todo SET title = ?, description = ?, due_time = ?, status = ? WHERE id = ? AND user_id = ?', [title, description, due_time, status, id, req.user.id]);
        res.json({ msg: "Todo updated successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM todo WHERE id = ? AND user_id = ?', [id, req.user.id]);
        res.json({ msg: "Todo deleted successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error });
    }
});

module.exports = router;
