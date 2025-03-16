// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.render('error', { message: 'کاربر یافت نشد', title: 'خطا', user: null });
        }
        res.render('user', { user, title: 'پنل کاربری' });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'خطا در دریافت اطلاعات کاربر', title: 'خطا', user: null });
    }
});

module.exports = router;
