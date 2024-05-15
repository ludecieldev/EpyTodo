const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(express.json());

const userRoutes = require('./routes/user/user');
const todoRoutes = require('./routes/todos/todos');
const authRoutes = require('./routes/auth/auth');

app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/user', userRoutes);
app.use('/todos', todoRoutes);

app.get('/', (req, res) => {
    res.status(200).send('Welcome to the API!');
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
