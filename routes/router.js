const router = require('express').Router();

router.get('/', (req,res)=>{
    res.send("Hello,Welcome to trackie API.!")
});
router.use('/auth', require('./auth.route'));
router.use('/income', require('./income.route'));
router.use('/expense', require('./expense.route'));
router.use('/budget', require('./budget.route'));

module.exports = router;
