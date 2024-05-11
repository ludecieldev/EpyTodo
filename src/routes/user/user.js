const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const authenticateToken = require('../../middleware/auth');

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await db.promise().query('SELECT id, email, name, firstname, created_at FROM user WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ msg: "User not found" });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { email, name, firstname, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        await db.promise().query('UPDATE user SET email = ?, name = ?, firstname = ?, password = ? WHERE id = ?', [email, name, firstname, hashedPassword, id]);
        res.json({ msg: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query('DELETE FROM user WHERE id = ?', [id]);
        res.json({ msg: `Successfully deleted user with ID: ${id}` });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" });
    }
});

module.exports = router;
