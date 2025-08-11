const {verifyToken} = require('../utils/jwt');
const User = require('../models/user');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).send('Not authorized, no token');
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).send('Not authorized, token failed');
        }
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401).send('Not authorized, token failed');
    }
};

module.exports = protect;