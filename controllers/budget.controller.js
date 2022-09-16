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
               req.body.user=user._id;

               const budget = new Budget(req.body);
               let newBudget= await budget.save();
            //    let finalBudget =await Budget.findById(newBudget._id)




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
                            budgetItem =await budgetItem.save() 
                            
                            newBudget.budgetItems.push(budgetItem._id);
                            // console.log(budgetItem)
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
                        newBudget.budgetItems.push(budgetItem._id);

                    }catch(error){
                        return res.json({
                            success: 0,
                            message: `Could not create budget item ${error}`
                           });
                    }
                    
                });
               }

               //return saved budget
            //    finalBudget.save(newBudget)
                // await finalBudget.updateOne(newBudget)

         
                await newBudget.save()
                console.log(newBudget)

                return res.json({
                    success: 1,
                    message:"successfully created budget",
                    data:newBudget
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
}