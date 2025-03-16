// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const { sequelize } = require('./models');
const http = require('http');
const socketIo = require('socket.io');

const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

const app = express();

// تنظیم view engine و express-ejs-layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// middleware‌ها
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ایجاد سرور HTTP و راه‌اندازی Socket.io
const server = http.createServer(app);
const io = socketIo(server);

// اضافه کردن io به درخواست‌ها (این middleware باید قبل از روت‌ها قرار بگیرد)
app.use((req, res, next) => {
    req.io = io;
    next();
});

// تعریف روت‌ها
app.use('/', mainRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// مدیریت خطای 404
app.use((req, res, next) => {
    res.status(404).render('error', { message: 'صفحه مورد نظر یافت نشد', title: 'خطا', user: null });
});

// مدیریت خطای داخلی سرور
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'خطای داخلی سرور', title: 'خطا', user: null });
});

// همگام‌سازی مدل‌ها و راه‌اندازی سرور
sequelize.sync().then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('Error syncing database:', err));
