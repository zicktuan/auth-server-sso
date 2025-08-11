const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH, 'utf8');

// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: '1h', // Access Token hết hạn sau 1 giờ
//     });
// };
const generateToken = (payload) => {
    return jwt.sign(payload, privateKey, {
        expiresIn: '1h',
        algorithm: 'RS256'
    });
};

// const generateRefreshToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: '7d', // Refresh Token hết hạn sau 7 ngày
//     });
// };
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, privateKey, {
        expiresIn: '7d',
        algorithm: 'RS256'
    });
};

// const verifyToken = (token) => {
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         return decoded;
//     } catch (error) {
//         return null;
//     }
// };
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, publicKey, {
            algorithms: ['RS256']
        });
        return decoded;
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, generateRefreshToken, verifyToken, publicKey };