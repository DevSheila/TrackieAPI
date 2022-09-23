const Expense = require("../models/Expense")
module.exports={
    addExpense: async (req,res)=>{
        req.body.user=req.decoded.result._id;
    
        if(req.body.desc== null || req.body.category== null ||req.body.amount== null ||req.body.date== null ){
            return res.json({
                status: 0,
                message:"Please enter all required fields"
            });

        }else{
            const expense = new Expense(req.body);
            try{
               let results= await expense.save()
               return res.json({
                status: 1,
                message:"success",
                data:results
               });
            }catch(error){
                return res.json({
                    status: 0,
                    message:error
                });
            }
        }
       
    
    },
    deleteExpense:async (req,res)=>{
        try{
            // get expense and  userId
            const expense= await Expense.findById(req.params.expenseId);
           
            if(!expense){
                return res.json({
                    status: 0,
                    message:`expense not found`
                });
            }
            const expenseUserId=expense.user;

            // validate and destroy
            if(req.decoded.result._id !== expenseUserId){
                return res.json({
                    status: 0,
                    message:"you are unauthorised to delete this expense"
                });
            }else{
                let results=await expense.delete();
                return res.json({
                    status: 1,
                    message:"success",
                    data:results
                   });
            }
        }catch(error){
     
            return res.json({
                status: 0,
                message:`could not delete expense. ${error}`
            });
    
        }
    },getAllUserExpense:async (req,res)=>{
        try{
            
        let user=req.decoded.result._id;
        let expenseList= await Expense.find({user:user})

        if(!expenseList){
            return res.json({
                status: 1,
                message:"no expenses added bu=y current user",
                });
        }

        return res.json({
            status: 1,
            message:"success",
            data:expenseList
            });
            
        }catch(error){
            return res.json({
                status: 0,
                message:error
            });
    
        }
     },
     getExpenseById:async (req,res)=>{
        try{
        let expenseId = req.params.expenseId;
        let expense= await Expense.find({_id:expenseId})

        let user=req.decoded.result._id;

        if(expense[0].user !== user){
            return res.json({
                status: 1,
                message:"You are unauthorised to view this expense",
                });
        }

        return res.json({
            status: 1,
            message:"success",
            data:expense
            });
            
        }catch(error){
            return res.json({
                status: 0,
                message:`expense could not be accessed${error}`
            });
    
        }
     },updateExpense:async (req,res)=>{
        try{
            // get expense and  userId
            const expense= await Expense.findById(req.params.expenseId);
            console.log(expense)
           
            if(!expense){
                return res.json({
                    status: 0,
                    message:`expense not found`
                });
            }
            const expenseUserId=expense.user;

            // validate and destroy
            if(req.decoded.result._id !== expenseUserId){
                return res.json({
                    status: 0,
                    message:"you are unauthorised to update this expense"
                });
            }else{
                let results=await expense.update(req.body);
                return res.json({
                    status: 1,
                    message:"success",
                    data:results
                   });
            }
        }catch(error){
     
            return res.json({
                status: 0,
                message:`could not update expense. ${error}`
            });
    
        }
    }
}