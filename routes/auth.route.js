const router = require('express').Router();
const authController = require('../controllers/auth.controller');
var TwoFactor = require('node-2fa');
const speakeasy=require('speakeasy')


router.post('/signup', authController.signUpUser);
router.post('/login', authController.login);
router.post('/logout/:email', authController.logout);
router.get('/get-otp/:contact', authController.getOtp);





module.exports = router;
