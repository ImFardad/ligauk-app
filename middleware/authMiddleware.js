// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // دریافت توکن از هدر یا کوکی
    const token = req.headers['authorization']
        ? req.headers['authorization'].split(' ')[1]
        : req.cookies.token;
    if (!token) {
        return res.redirect('/auth/login');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect('/auth/login');
    }
};

module.exports = authMiddleware;
