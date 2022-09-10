const router = require('express').Router();
const incomeController = require('../controllers/income.controller');
const  {checkToken}= require("../services/JWT")//route protection with JWT


router.post('/add', checkToken ,incomeController.addIncome);
router.delete('/delete/:incomeId', checkToken ,incomeController.deleteIncome);
router.delete('/update/:incomeId', checkToken ,incomeController.updateIncome);



module.exports = router;
