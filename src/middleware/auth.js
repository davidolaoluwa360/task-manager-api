const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  let token = req.get('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Please Authenticate' });
  }
  token = token.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, 'supersecret');
    const user = await User.findOne({
      _id: decodedToken.userId,
      'tokens.token': token,
    });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Please Authenticate' });
  }
};
