// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config');
const { jwtDecode } = require('jwt-decode');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwtDecode(token);
    const user = await User.findOne(
      { 
        _id: decoded._id, 
        username: decoded.username,
        name: decoded.name,
        role: decoded.role,
        type: decoded.type,
        domain: decoded.domain,
        'tokens.token': token,
      }
    );

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

module.exports = auth;
