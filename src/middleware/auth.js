const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'No token provided' });
    }
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            console.error("JWT verification error:", err);
            return res.status(403).json({ msg: 'Token is invalid' });
        }
        req.user = { user_id: user.user_id, email: user.email };
        next();
    });
}

module.exports = authenticateToken;
