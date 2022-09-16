const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/signup', authController.signUpUser);
router.post('/login', authController.login);
router.post('/logout/:email', authController.logout);
router.get('/get-otp/:contact', authController.getOtp);
router.post('/delete/:userId', authController.deleteUser);
//delete your account(delete incoes,expensesand budgets)

module.exports = router;
