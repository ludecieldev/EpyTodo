const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: "Bad parameter" });
    }
    try {
        const [user] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
        if (user.length > 0) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query('INSERT INTO user (email, password) VALUES (?, ?)', [email, hashedPassword]);
        if (result[0].affectedRows > 0) {
            res.status(201).json({ msg: "User created successfully" });
        } else {
            res.status(400).json({ msg: "Failed to create user" });
        }
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: "Bad parameter" });
    }
    try {
        const [user] = await db.query('SELECT id, email, password FROM user WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ msg: "User not found" });
        }

        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(401).json({ msg: "Invalid password" });
        }

        const token = jwt.sign({ user_id: user[0].id, email }, process.env.SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error });
    }
});

module.exports = router;
