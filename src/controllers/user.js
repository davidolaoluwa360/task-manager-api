//* require user model
const User = require('../models/user');

//* require mailling
const { welcomeEmail, cancelationEmail } = require('../email/account');

//* POST/CreateUser
const createUser = async (req, res, next) => {
  let user = new User(req.body);

  try {
    const newUser = await user.save();
    welcomeEmail(newUser);
    const token = await newUser.generateAuthToken(newUser);
    res.status(201).json({ user, token });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//* POST|Login User
const login = async (req, res, next) => {
  try {
    const user = await User.findByCredentials(req.body);
    const token = await user.generateAuthToken();
    res.status(200).json({ user: user, token: token });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    return res.status(200).send('Logout successful');
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Could not save user to the database' });
  }
};

const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    return res.status(200).send('User logged out of all device successfully');
  } catch (err) {
    return res.status(500).json('Could not save user to the database');
  }
};

//* Get/GetUsers
const getProfile = async (req, res) => {
  return res.status(200).json(req.user);
};

const updateUser = async (req, res, next) => {
  const allowedUpdate = ['name', 'email', 'password'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => {
    return allowedUpdate.includes(update);
  });

  if (!isValidOperation) {
    return res.status(422).json({ error: 'Invalid Update' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();
    res.status(200).json({
      user: req.user,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Could not save update user' });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await req.user.remove();
    cancelationEmail(req.user);
    res.status(200).send('User deleted');
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const uploadUserAvatar = async (req, res, next) => {
  try {
    req.user.avatar = req.file.buffer;
    const user = await req.user.save();
    return res.status(200).send('uploaded');
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const deleteUserAvatar = async (req, res, next) => {
  try {
    req.user.avatar = null;
    const user = await req.user.save();
    res.status(200).send('Avatar deleted');
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const getUserAvatar = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const user = await User.findOne({ _id: _id });
    if (!user) {
      const error = new Error('User do not exist in our record');
      error.statusCode = 404;
      throw error;
    }

    if (!user.avatar) {
      const error = new Error('Avatar do not exist on the user');
      error.statusCode = 404;
      throw error;
    }

    res.set('Content-Type', 'image/jpg');
    res.send(user.avatar);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//* export users controller
module.exports = {
  createUser: createUser,
  getProfile: getProfile,
  updateUser: updateUser,
  deleteUser: deleteUser,
  login: login,
  logout: logout,
  logoutAll: logoutAll,
  uploadUserAvatar: uploadUserAvatar,
  deleteUserAvatar: deleteUserAvatar,
  getUserAvatar: getUserAvatar,
};
