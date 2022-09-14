const router = require('express').Router();

router.use('/auth', require('./auth.route'));
router.use('/income', require('./income.route'));
router.use('/expense', require('./expense.route'));



module.exports = router;
