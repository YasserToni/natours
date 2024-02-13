const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimter = require('express-rate-limit');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
// const loginLimirate = require('../utils/BruteForceAttacks');
const router = express.Router();

const loginLimter = rateLimter({
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requestes from this IP, Please try again in an hour',
});

router.post('/signup', authController.signUp);
router.get('/verification/:token', authController.verification);
router.post('/login', loginLimter, authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// protect all routes after this middleware
router.use(authController.protect);
//  اللي تحت route قبل كل ال  authController.protect كنأني حطيت
router.patch('/updateMyPassword', authController.updatePassword);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

router.route('/me').get(userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin'));
router
  .route(`/`)
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route(`/:id`)
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
