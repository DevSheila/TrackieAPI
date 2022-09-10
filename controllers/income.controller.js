const Income = require("../models/Income")
module.exports={
    addIncome: async (req,res)=>{
        req.body.userId=req.decoded.result.id;
    
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
            const income= await Income.findOne(req.params.incomeId);
            const incomeUserId=income.dataValues.userId;
    
            // validate and destroy
            if(req.decoded.result.id !== incomeUserId){
                return res.json({
                    success: 0,
                    message:"you are unauthorised to delete this income"
                });
            }else{
                let results=await income.destroy();
                return res.json({
                    success: 1,
                    message:"success",
                    data:results
                   });
            }
        }catch(error){
            return res.json({
                success: 0,
                message:error
            });
    
        }
     }
}