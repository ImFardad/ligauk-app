// models/seedAdmin.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('./User');
const { sequelize } = require('./index');

async function seedAdmin() {
  try {
    await sequelize.sync();
    const adminNationalCode = process.env.ADMIN_NATIONAL_CODE;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFirstName = process.env.ADMIN_FIRSTNAME;
    const adminLastName = process.env.ADMIN_LASTNAME;
    const adminPhone = process.env.ADMIN_PHONE;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminNationalCode || !adminPassword || !jwtSecret) {
      console.error("لطفاً مقادیر ADMIN_NATIONAL_CODE، ADMIN_PASSWORD و JWT_SECRET را در فایل .env تنظیم کنید.");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ where: { nationalCode: adminNationalCode } });
    if (existingAdmin) {
      console.log("admin exist");
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      firstName: adminFirstName || "ادمین",
      lastName: adminLastName || "ادمین",
      nationalCode: adminNationalCode,
      phone: adminPhone || "09123456789",
      password: hashedPassword,
      isActive: true,
      isAdmin: true
    });
    console.log("admin created:", adminNationalCode);
    process.exit(0);
  } catch (error) {
    console.error("error creating admin:", error);
    process.exit(1);
  }
}

seedAdmin();
