const Income = require("../models/Income")
module.exports={
    addIncome: async (req,res)=>{
        req.body.user=req.decoded.result._id;
    
        if(req.body.desc== null || req.body.category== null ||req.body.amount== null ||req.body.date== null ){
            return res.json({
                success: 0,
                message:"Please enter all required fields"
            });

        }else{
            const income = new Income(req.body);
            try{
               let results= await income.save()
               return res.json({
                success: 1,
                message:"success",
                data:results
               });
            }catch(error){
                return res.json({
                    success: 0,
                    message:error
                });
            }
        }
       
    
    },
    deleteIncome:async (req,res)=>{
        try{
            // get income and  userId
            const income= await Income.findById(req.params.incomeId);
           
            if(!income){
                return res.json({
                    success: 0,
                    message:`income not found`
                });
            }
            const incomeUserId=income[0].user;

            // validate and destroy
            if(req.decoded.result._id !== incomeUserId){
                return res.json({
                    success: 0,
                    message:"you are unauthorised to delete this income"
                });
            }else{
                let results=await income.delete();
                return res.json({
                    success: 1,
                    message:"success",
                    data:results
                   });
            }
        }catch(error){
     
            return res.json({
                success: 0,
                message:`could not delete income. ${error}`
            });
    
        }
    },getAllUserIncome:async (req,res)=>{
        try{
            
        let user=req.decoded.result._id;
        let incomeList= await Income.find({user:user})

        if(!incomeList){
            return res.json({
                success: 1,
                message:"no incomes added bu=y current user",
                });
        }

        return res.json({
            success: 1,
            message:"success",
            data:incomeList
            });
            
        }catch(error){
            return res.json({
                success: 0,
                message:error
            });
    
        }
     },
     getIncomeById:async (req,res)=>{
        try{
        let incomeId = req.params.incomeId;
        let income= await Income.find({_id:incomeId})

        let user=req.decoded.result._id;

        if(income[0].user !== user){
            return res.json({
                success: 1,
                message:"You are unauthorised to view this income",
                });
        }

        return res.json({
            success: 1,
            message:"success",
            data:income
            });
            
        }catch(error){
            return res.json({
                success: 0,
                message:`income could not be accessed${error}`
            });
    
        }
     },updateIncome:async (req,res)=>{
        try{
            // get income and  userId
            const income= await Income.findById(req.params.incomeId);
            console.log(income)
           
            if(!income){
                return res.json({
                    success: 0,
                    message:`income not found`
                });
            }
            const incomeUserId=income.user;

            // validate and destroy
            if(req.decoded.result._id !== incomeUserId){
                return res.json({
                    success: 0,
                    message:"you are unauthorised to update this income"
                });
            }else{
                let results=await income.update(req.body);
                return res.json({
                    success: 1,
                    message:"success",
                    data:results
                   });
            }
        }catch(error){
     
            return res.json({
                success: 0,
                message:`could not update income. ${error}`
            });
    
        }
    }
}