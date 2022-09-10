const router = require('express').Router();
const incomeController = require('../controllers/auth.controller');

router.post('/', incomeController.signUpUser);
router.post('/login', incomeController.login);
router.post('/logout/:email', incomeController.logout);

module.exports = router;
