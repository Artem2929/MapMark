const express = require('express');
const router = express.Router();
const countries = require('../data/countries');

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: countries
  });
});

module.exports = router;