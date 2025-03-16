// routes/admin.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware برای بررسی ادمین
const adminMiddleware = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).render('error', { message: 'دسترسی غیرمجاز', title: 'خطا', user: null });
    }
    next();
};

// نمایش داشبورد ادمین
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('admin', { users, error: null, title: 'پنل ادمین', user: { isAdmin: true } });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'خطا در دریافت اطلاعات کاربران', title: 'خطا', user: null });
    }
});

// جستجو در کاربران
router.get('/search', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        let whereClause = {};
        if (query) {
            whereClause = {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${query}%` } },
                    { lastName: { [Op.like]: `%${query}%` } },
                    { nationalCode: { [Op.like]: `%${query}%` } },
                    { phone: { [Op.like]: `%${query}%` } }
                ]
            };
        }
        const users = await User.findAll({ where: whereClause });
        res.render('admin', { users, error: null, title: 'پنل ادمین', user: { isAdmin: true } });
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'خطا در جستجو', title: 'خطا', user: null });
    }
});

// تغییر وضعیت کاربر
router.post('/edit/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, nationalCode, phone, isActive } = req.body;
        const user = await User.findByPk(id);
        if (!user) {
            return res.render('error', { message: 'کاربر یافت نشد', title: 'خطا', user: null });
        }
        user.firstName = firstName;
        user.lastName = lastName;
        user.nationalCode = nationalCode;
        user.phone = phone;
        user.isActive = isActive === 'true' || isActive === true;
        await user.save();

        // ارسال رویداد Real-time پس از ویرایش
        req.io.emit('update', { message: 'کاربر به روز رسانی شد', userId: id });
        
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'خطا در ویرایش کاربر', title: 'خطا', user: null });
    }
});

module.exports = router;
