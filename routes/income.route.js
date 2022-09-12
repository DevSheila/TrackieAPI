const router = require('express').Router();
const incomeController = require('../controllers/income.controller');
const {checkToken}= require("../services/token_validations")//route protection with JWT

// router.get('/view/:incomeId', checkToken ,incomeController.getIncomeById);
router.get('/viewall', checkToken ,incomeController.getAllUserIncome);
router.post('/add', checkToken ,incomeController.addIncome);
router.delete('/delete/:incomeId', checkToken ,incomeController.deleteIncome);
router.put('/update/:incomeId', checkToken ,incomeController.updateIncome);


module.exports = router;
