const router = require('express').Router();
const incomeController = require('../controllers/income.controller');
const  {checkToken}= require("../services/JWT")//route protection with JWT


router.post('/add', checkToken ,incomeController.addIncome);
router.delete('/delte/:incomeId', checkToken ,incomeController.deleteIncome);

module.exports = router;
