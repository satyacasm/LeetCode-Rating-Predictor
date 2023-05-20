const jwt = require('jsonwebtoken');
const config = require('config');
const User=require('../models/Admin')

// const adminAuthRoutes = require('./routes/adminAuth');
module.exports = async function(req, res, next) {
  // Get JWT token from cookie
  const token = req.cookies.jwt;

  // Check if JWT token exists
  if (!token) {
    return res.status(401).send('Login krle pehle');
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, config.get('jwtsecret'));

    // Add user ID to request object
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
// console.log("Decoded"+JSON.stringify(decoded))
    // Continue to next middleware or route handler
//     next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Unauthorized' });
  }
};