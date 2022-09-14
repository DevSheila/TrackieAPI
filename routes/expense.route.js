const router = require('express').Router();
const expenseController = require('../controllers/expense.controller');
const {checkToken}= require("../services/token_validations")//route protection with JWT

router.get('/view/:expenseId', checkToken ,expenseController.getExpenseById);
router.get('/viewall', checkToken ,expenseController.getAllUserExpense);
router.post('/add', checkToken ,expenseController.addExpense);
router.delete('/delete/:expenseId', checkToken ,expenseController.deleteExpense);
router.put('/update/:expenseId', checkToken ,expenseController.updateExpense);


module.exports = router;
