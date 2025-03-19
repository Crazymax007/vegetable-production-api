const express = require('express');
const router = express.Router();

// Welcome route
router.get("/", (req, res) => {
    res.render('welcome', {
        title: 'สวัสดีครับ เรายินดีต้อนรับ'
    });
});

module.exports = router;