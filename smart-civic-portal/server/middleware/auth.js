require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.startsWith('Bearer') && authHeader.split(' ')[1]) ||
      req.cookies?.token;

    if (!token) {
      const error = new Error('Not authorized, token missing');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      const error = new Error('Not authorized, user not found');
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.message = 'Invalid token';
    }
    next(error);
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error('Forbidden: insufficient permissions');
    error.statusCode = 403;
    return next(error);
  }
  return next();
};

module.exports = {
  protect,
  authorizeRoles,
};

