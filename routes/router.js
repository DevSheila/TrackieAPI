const router = require('express').Router();

router.use('/auth', require('./auth.route'));
router.use('/income', require('./income.route'));


module.exports = router;
