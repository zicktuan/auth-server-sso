const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Client = require('../models/client');
const Code = require('../models/code');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const fs = require('fs');
const {validateEmail} = require('../utils/validators');

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');

const register = async (req, res) => {
    const { username, password, email, fullName, dateOfBirth, gender, phoneNumber, address, role } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ 
            success: false,
            message: 'Please enter all fields'
        });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: {
                email: 'Please enter a valid email address'
            }
        });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: {
                    username: 'User already exists'
                }
            });
        }

        user = new User({
            username,
            password,
            email,
            fullName, 
            dateOfBirth, 
            gender, 
            phoneNumber, 
            address,
            role
        });

        await user.save();

        res.status(201).json({ success: true, message: 'User registered successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// GET /authorize
const authorize = async (req, res) => {
    try {
        const { client_id, redirect_uri, response_type, scope } = req.query;

        if (!client_id || !redirect_uri || response_type !== 'code' || scope !== 'openid profile') {
            return res.status(400).json({ success: false, message: 'Invalid request parameters.' });
        }

        const client = await Client.findOne({ client_id, redirect_uri });
        if (!client) {
            return res.status(403).json({ success: false, message: 'Invalid client_id or redirect_uri.' });
        }

        // Kiểm tra xem người dùng đã đăng nhập chưa, nếu chưa thì chuyển hướng đến trang đăng nhập
        // For simplicity, we assume no session management, so we always show the login page
        res.render('login', { client_id, redirect_uri, scope });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

// POST /login
const login = async (req, res) => {
    const { email, password, client_id, redirect_uri, scope } = req.body;

    if (!validateEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: {
                email: 'Please enter a valid email address'
            }
        });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const client = await Client.findOne({ client_id, redirect_uri });
    if (!client) {
        return res.status(400).json({ success: false, message: 'Invalid client_id or redirect_uri.' });
    }

    // Tạo Authorization Code
    const code = crypto.randomBytes(16).toString('hex');
    const newCode = new Code({
        code,
        client_id,
        redirect_uri,
        user_id: user._id,
        scope,
    });
    await newCode.save();

    // Chuyển hướng về Client với code
    const redirectUrlWithCode = `${redirect_uri}?code=${code}`;
    res.status(200).json({
        code,
        redirect_uri: redirectUrlWithCode
    })
    // res.redirect(redirectUrlWithCode);
};

// POST /token
const token = async (req, res) => {
    const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

    if (grant_type !== 'authorization_code') {
        return res.status(400).json({ success: false, message: 'unsupported_grant_type' });
    }

    const authCode = await Code.findOne({ code, client_id, redirect_uri });
    if (!authCode) {
        return res.status(400).json({ success: false, message: 'invalid_grant' });
    }

    const client = await Client.findOne({ client_id, client_secret, redirect_uri });
    if (!client) {
        return res.status(400).json({ success: false, message: 'invalid_client' });
    }

    // Lấy thông tin người dùng
    const user = await User.findById(authCode.user_id);
    if (!user) {
        return res.status(400).json({ success: false, message: 'invalid_user' });
    }

    // Tạo các token
    const payload = {id: user._id, role: user.role};
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    // ID Token (theo chuẩn OpenID Connect)
    const idToken = jwt.sign(
      {
        sub: user._id,
        aud: client.client_id,
        iss: 'http://localhost:5403', // Issuer của Auth Server
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // Hết hạn 1 giờ
        iat: Math.floor(Date.now() / 1000),
      },
    //   process.env.JWT_SECRET,
      privateKey,
      { algorithm: 'RS256' }
    );

    // Xóa code đã dùng
    await Code.deleteOne({ _id: authCode._id });

    res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        id_token: idToken,
    });
};

const userinfo = async (req, res) => {
    // req.user đã được gán bởi middleware 'protect'
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
        success: true,
        user: {
            sub: req.user._id,
            username: req.user.username,
            email: req.user.email,
            fullName: req.user.fullName,
            dateOfBirth: req.user.dateOfBirth,
            gender: req.user.gender,
            phoneNumber: req.user.phoneNumber,
            address: req.user.address,
            role: req.user.role
        }
    });
}

const registerClient = async (req, res) => {
    const { client_name, redirect_uri } = req.body;

    if (!client_name || !redirect_uri) {
        return res.status(400).json({
            success: false,
            message: 'Client name and redirect URI are required.'
        });
    }

    try {
        const existingClient = await Client.findOne({ redirect_uri });
        if (existingClient) {
            return res.status(400).json({
                success: false,
                message: 'A client with this redirect URI already exists.'
            });
        }

        const client_id = crypto.randomBytes(16).toString('hex');
        const client_secret = crypto.randomBytes(32).toString('hex');

        const newClient = new Client({
            client_id,
            client_secret,
            redirect_uri,
            client_name,
        });

        await newClient.save();

        res.status(201).json({
            success: true,
            message: 'Client registered successfully.',
            // client_id: newClient.client_id,
            // client_secret: newClient.client_secret,
            client: newClient
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getCerts = (req, res) => {
    res.send(publicKey);
};

module.exports = { register, authorize, login, token, userinfo, getCerts, registerClient };