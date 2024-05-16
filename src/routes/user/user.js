const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const authenticateToken = require('../../middleware/auth');

router.get('/todos', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        console.log("Fetching todos for user ID:", userId);

        const [todos] = await db.query('SELECT * FROM todo WHERE user_id = ?', [userId]);
        console.log("Todos fetched:", todos);

        if (todos.length === 0) {
            return res.status(404).json({ msg: "Not found" });
        }

        res.json(todos);
    } catch (error) {
        console.error("Database error during fetching todos:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ msg: "Not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, firstname, email } = req.body;
    if (!name || !firstname || !email) {
        return res.status(400).json({ msg: "Bad parameter" });
    }
    try {
        const [results] = await db.query('UPDATE user SET name = ?, firstname = ?, email = ? WHERE id = ?', [name, firstname, email, id]);
        if (results.affectedRows > 0) {
            res.json({ msg: "User updated successfully" });
        } else {
            res.status(404).json({ msg: "Not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM todo WHERE user_id = ?', [id]);
        const [result] = await db.query('DELETE FROM user WHERE id = ?', [id]);

        if (result.affectedRows > 0) {
            res.json({ msg: "User deleted successfully" });
        } else {
            res.status(404).json({ msg: "Not found" });
        }
    } catch (error) {
        console.error("Database error during user deletion:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

module.exports = router;
