const router = require('express').Router();
const authController = require('../controllers/auth.controller');

router.post('/', authController.signUpUser);
router.post('/login', authController.login);
router.post('/logout/:email', authController.logout);


module.exports = router;
