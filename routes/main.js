// routes/main.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/auth/register');
});

module.exports = router;
