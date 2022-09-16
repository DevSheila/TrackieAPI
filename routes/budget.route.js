const router = require('express').Router();
const budgetController = require('../controllers/budget.controller');
const {checkToken}= require("../services/token_validations")//route protection with JWT

router.get('/view/:budgetId', checkToken ,budgetController.getBudgetById);
// router.get('/viewall', checkToken ,budgetController.getAllUserBudget);
router.post('/add', checkToken ,budgetController.addBudget);
router.delete('/delete/:budgetId', checkToken ,budgetController.deleteBudgetById);
router.get('/budgetItem/delete/:budgetItemId', checkToken ,budgetController.deleteBudgetItemById);

// router.put('/update/:budgetId', checkToken ,budgetController.updateBudget);


module.exports = router;
