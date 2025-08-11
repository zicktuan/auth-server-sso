const express = require('express');
const router = express.Router();
const { register, authorize, login, token, userinfo, getCerts, registerClient, getOpenIDConfig } = require('../controllers/authController');
const protect = require('../middleware/auth');

router.get('/authorize', authorize);
router.post('/login', login);
router.post('/token', token);
router.post('/register', register);
router.get('/userinfo', protect, userinfo);
router.get('/certs', getCerts);

router.post('/register-client', registerClient);
router.get('/.well-known/openid-configuration', getOpenIDConfig);


module.exports = router;