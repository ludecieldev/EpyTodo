const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // Ensure the database configuration is correctly set up
const authenticateToken = require('../../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        console.log("Fetching todos for user ID:", userId);

        const [todos] = await db.query('SELECT * FROM todo WHERE user_id = ?', [userId]);
        console.log("Todos fetched:", todos);

        res.json(todos);
    } catch (error) {
        console.error("Database error during fetching todos:", error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    console.log("Fetching todo with ID:", id);
    try {
        const [results] = await db.query('SELECT * FROM todo WHERE id = ?', [id]);
        console.log("Database results:", results);
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ msg: "Todo not found" });
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { title, description, due_time, status } = req.body;
    const user_id = req.user.user_id;

    console.log("Received todo data:", { title, description, due_time, status, user_id });

    try {
        // Insertion de la nouvelle todo dans la base de données
        const result = await db.query(
            'INSERT INTO todo (title, description, due_time, status, user_id) VALUES (?, ?, ?, ?, ?)',
            [title, description, due_time, status, user_id]
        );
        console.log("Insert result:", result);
        if (result[0].affectedRows > 0) {
            const [newTodo] = await db.query('SELECT * FROM todo WHERE id = ?', [result[0].insertId]);
            console.log("New todo created successfully:", newTodo[0]);
            res.status(201).json(newTodo[0]);
        } else {
            console.log("Failed to create todo, no rows affected.");
            res.status(400).json({ msg: "Failed to create todo" });
        }
    } catch (error) {
        console.error("Database error during todo creation:", error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, due_time, status } = req.body;
    const userId = req.user.user_id;

    console.log("Attempting to update todo with ID:", id, "for user ID:", userId, "with data:", { title, description, due_time, status });

    try {
        const [result] = await db.query(
            'UPDATE todo SET title = ?, description = ?, due_time = ?, status = ? WHERE id = ? AND user_id = ?',
            [title, description, due_time, status, id, userId]
        );

        console.log("Update result:", result);

        if (result.affectedRows > 0) {
            const [updatedTodo] = await db.query('SELECT * FROM todo WHERE id = ?', [id]);
            res.json(updatedTodo[0]);
        } else {
            console.log("Failed to update todo with ID:", id, "for user ID:", userId);
            res.status(404).json({ msg: "No todo found to update" });
        }
    } catch (error) {
        console.error("Database error during todo update:", error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id; // Ensure user_id is correctly obtained from the token
    console.log("Attempting to delete todo with ID:", id, "for user ID:", userId);
    try {
        const [todos] = await db.query('SELECT * FROM todo WHERE id = ? AND user_id = ?', [id, userId]);
        if (todos.length === 0) {
            console.log("No todo found with ID:", id, "for user ID:", userId);
            return res.status(404).json({ msg: "No todo found to delete" });
        }
        const [result] = await db.query('DELETE FROM todo WHERE id = ? AND user_id = ?', [id, userId]);
        console.log("Delete result:", result);
        if (result.affectedRows > 0) {
            res.json({ msg: `Successfully deleted record number : ${id}` });
        } else {
            console.log("Failed to delete todo with ID:", id, "for user ID:", userId);
            res.status(404).json({ msg: "No todo found to delete" });
        }
    } catch (error) {
        console.error("Database error during todo deletion:", error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});

module.exports = router;
