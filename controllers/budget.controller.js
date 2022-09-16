const Budget = require("../models/Budget")
const User = require('../models/User');
const BudgetItem = require("../models/BudgetItem")

module.exports={
    addBudget: async (req,res)=>{
        //validations
        if(req.body.startDate == null || req.body.endDate== null || (req.body.income == null  && req.body.expense == null) ){ //  
          
            return res.json({
                success: 0,
                message:"Please enter all required fields"
            });

        }else{
            try{
               const userId=req.decoded.result._id;

               const user =await User.findById(userId)
               req.body.user=user._id;//get user object id

               //create a budget
               const budget = new Budget(req.body);
               let newBudget= await budget.save();

               //add income budget items
               if(req.body.income != null){
                    req.body.income.forEach(async (item) => {
                        try {

                            if(item.type == null || item.category == null || item.name == null  || item.amount == null){ 
                                return res.json({
                                    success: 0,
                                    message:"Please enter all required fields for a budget item"
                                });
                            }

                            item.budgetId=newBudget._id;
                            let budgetItem = new BudgetItem(item);
                            await budgetItem.save() 
                            
                        }catch(error){
                            return res.json({
                                success: 0,
                                message: `Could not create budget item ${error}`
                               });
                        }

                        
                    });
               }

               //add expense budget items
               if(req.body.expense != null){
                req.body.expense.forEach(async (item) => {
                    try {

                        if(item.type == null || item.category == null || item.name == null  || item.amount == null){ 
                            return res.json({
                                success: 0,
                                message:"Please enter all required fields for a budget item"
                            });
                        }

                        item.budgetId=newBudget._id;
                        let budgetItem = new BudgetItem(item); 
                        await budgetItem.save();

                    }catch(error){
                        return res.json({
                            success: 0,
                            message: `Could not create budget item ${error}`
                           });
                    }
                    
                });
               }

               let finalBudget =await Budget.findById(newBudget._id);
            
            let result = await BudgetItem.find({budgetId:finalBudget._id}).populate('budgetId');

            return res.json({
                success: 1,
                message:"successfully created budget",
                data:result
            });
           
            }catch(error){
                console.log(error)
                return res.json({
                    success: 0,
                    message:`Error occured creating budget ${error}`
                });
            }
        }
    }
    ,getBudgetById:async(req,res)=>{

        try{
            let budget =await Budget.findById(req.params.budgetId);
            let items = await BudgetItem.find({budgetId:budget._id}).populate('budgetId');

            let user = req.decoded.result.id;
            let userId= budget.user;

            if(user !== userId){
                return res.json({
                    success: 0,
                    message:`You are unauthorised to access this record`
                });
            }

            return res.json({
                success: 1,
                message:`Successully retrieved budget `,
                data:items
            });

        }catch(error){
            return res.json({
                success: 0,
                message:`Error occured creating budget ${error}`
            });

        }
    }
    ,deleteBudgetById:async(req,res)=>{

        try{
            let budget =await Budget.findById(req.params.budgetId);
            let budgetItems = await BudgetItem.find({budgetId:budget._id});

            let user= req.decoded.result._id;//current user
            let userId= budget.user;//budget user

            if(user != userId){
                return res.json({
                    success:0,
                    message:"You are unauthorised to delete this record/budget"
                })
            }

            budgetItems.forEach(async (item)=>{
                try{
                    await item.delete()

                }catch(error){
                    return res.json({
                        success: 0,
                        message:`Error occured deleting budget ${error}`
                    });
                }
            })

            await budget.delete()

            return res.json({
                success: 1,
                message:`Successully deleted budget`,
            });

        }catch(error){
            return res.json({
                success: 0,
                message:`Error occured deleting budget ${error}`
            });

        }
    },
    deleteBudgetItemById:async(req,res)=>{

        try{
            let budgetItem = await BudgetItem.findById(req.params.budgetItemId).populate('budgetId')

            let user= req.decoded.result._id;//current user
            let budgetUserId = budgetItem.budgetId.user;//budget user

            if( budgetUserId == user){
                try{

                    await budgetItem.delete()
                    return res.json({
                        success: 1,
                        message:`Successully deleted budget`,
                    });

                }catch(error){

                    return res.json({
                        success: 0,
                        message:`Error occured deleting budget ${error}`
                    });
                }
            }else{

                return res.json({
                    success: 0,
                    message:`You are unauthorised to delete this record.`
                });
            }

        }catch(error){
            return res.json({
                success: 0,
                message:`Error occured deleting budget item${error}`
            });

        }
    },
    getAllUserBudget:async (req,res)=>{
        try{
            let user= req.decoded.result._id;//current user
            let budgets=await Budget.find({user:user});

            if(budgets == null){

                return res.json({
                    success:0,
                    message:"You have no budget."
                })
            }

            let budgetItems=[];
            let budgetIds=[];

            budgets.forEach((item)=>{
                budgetIds.push(item._id)
                console.log(budgetIds)
            })

            budgetIds.forEach(async (id)=>{
               try{
                let items= await BudgetItem.find({budgetId:id}).populate('BudgetId')
                budgetItems.push(items)
                console.log(items)

               }catch(error){
                    return res.json({
                        success:0,
                        message:`An error occured ${error}`
                    })
               }
            })

            console.log(budgetIds)


            return res.json({
                success:1,
                message:"retrieved budgets",
                data:budgetItems
            })
            
        }catch(error){
            return res.json({
                success:0,
                message:`Error occured in retrieving budgets ${error}`
            })

        }
    }
}