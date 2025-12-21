const express = require('express');
const authController = require('./auth.controller');
const { loginSchema, registerSchema } = require('./auth.schema');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', loginSchema, authController.login);
router.post('/register', registerSchema, authController.register);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;