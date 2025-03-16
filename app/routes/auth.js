// routes/auth.js
const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log("JWT_SECRET:", process.env.JWT_SECRET);

// نمایش فرم ثبت‌نام
router.get('/register', (req, res) => {
    res.render('register', { error: null, title: 'ثبت نام', user: null });
});

// پردازش ثبت‌نام
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, nationalCode, phone, password, confirmPassword } = req.body;
        if (!firstName || !lastName || !nationalCode || !phone || !password || !confirmPassword) {
            return res.render('register', { error: 'تمامی فیلدها الزامی است', title: 'ثبت نام', user: null });
        }
        if (password !== confirmPassword) {
            return res.render('register', { error: 'رمز عبور و تکرار آن یکسان نیست', title: 'ثبت نام', user: null });
        }
        const existingUser = await User.findOne({ where: { nationalCode } });
        if (existingUser) {
            return res.render('register', { error: 'کاربری با این کد ملی موجود است', title: 'ثبت نام', user: null });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName,
            lastName,
            nationalCode,
            phone,
            password: hashedPassword,
            isActive: false,
            isAdmin: false,
        });
        
        // ارسال رویداد Real-time پس از ثبت نام موفق
        if (req.io) {
            req.io.emit('update', { 
                message: 'کاربر جدید ثبت نام کرد', 
                user: { id: newUser.id, firstName, lastName, nationalCode, phone } 
            });
        }
        
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'خطای داخلی سرور در ثبت نام', title: 'خطا', user: null });
    }
});

// نمایش فرم ورود
router.get('/login', (req, res) => {
    res.render('login', { error: null, title: 'ورود', user: null });
});

// پردازش ورود
router.post('/login', async (req, res) => {
    try {
        const { nationalCode, password } = req.body;
        console.log("Login attempt:", nationalCode, password);
        if (!nationalCode || !password) {
            return res.render('login', { error: 'کد ملی و رمز عبور الزامی است', title: 'ورود', user: null });
        }
        const user = await User.findOne({ where: { nationalCode } });
        if (!user) {
            console.log("User not found for nationalCode:", nationalCode);
            return res.render('login', { error: 'کاربر یافت نشد', title: 'ورود', user: null });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch for user:", user.id);
            return res.render('login', { error: 'رمز عبور اشتباه است', title: 'ورود', user: null });
        }
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in .env");
            return res.render('error', { message: 'تنظیمات سرور به درستی پیکربندی نشده‌اند', title: 'خطا', user: null });
        }
        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        console.log("Login successful for user:", user.nationalCode);
        if (user.isAdmin) {
            res.redirect('/admin');
        } else {
            res.redirect('/user');
        }
    } catch (err) {
        console.error(err);
        res.render('error', { message: 'خطای داخلی سرور در ورود', title: 'خطا', user: null });
    }
});

// خروج
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
});

module.exports = router;
