const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const { errorMiddleware } = require('../middleware/error');

//* POST|Create user
router.post('/users', userController.createUser, errorMiddleware);

//* POST|Login User
router.post('/users/login', userController.login, errorMiddleware);

//* POST|Logout User
router.post('/users/logout', auth, userController.logout, errorMiddleware);

//* POST|Logout from all device
router.post(
  '/users/logoutall',
  auth,
  userController.logoutAll,
  errorMiddleware
);

//* GET|Get all users
router.get('/users/profile', auth, userController.getProfile, errorMiddleware);

//* PATCH|Update a user
router.patch('/users/me', auth, userController.updateUser, errorMiddleware);

//* DELETE|Delete a user
router.delete('/users/me', auth, userController.deleteUser, errorMiddleware);

const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('Please upload an image'), false);
    }
    cb(null, true);
  },
});

//* POST|Upload Avatar
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  userController.uploadUserAvatar,
  errorMiddleware
);

//* Delete|Delete Avatar Avatar
router.delete(
  '/users/me/avatar',
  auth,
  userController.deleteUserAvatar,
  errorMiddleware
);

//* GET|Get URL for User Avatar
router.get('/users/:id/avatar', userController.getUserAvatar);

module.exports = router;
