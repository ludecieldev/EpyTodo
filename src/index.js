require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const userRoutes = require('./routes/user/user');
const todoRoutes = require('./routes/todos/todos');
const authRoutes = require('./routes/auth/auth');

app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found on this server.'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something broke on the server!'
    });
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
