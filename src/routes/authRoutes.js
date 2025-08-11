const express = require('express');
const router = express.Router();
const { register, authorize, login, token, userinfo, getCerts, registerClient } = require('../controllers/authController');
const protect = require('../middleware/auth');

router.get('/authorize', authorize);
router.post('/login', login);
router.post('/token', token);
router.post('/register', register);
router.get('/userinfo', protect, userinfo);
router.get('/certs', getCerts);

router.post('/register-client', registerClient);


module.exports = router;