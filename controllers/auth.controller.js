const { encrypt} = require('../services/crypto');
const { sendMail } = require('../services/MAIL');
const User = require('../models/User');
const JsonWebToken = require("jsonwebtoken");
const TwoFactor = require('node-2fa');
const { JWT_SECRET } = require('../constants/constants');
const { sign } = require("jsonwebtoken");
const speakeasy = require('speakeasy');



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);



module.exports.signUpUser = async (req, res) => {
  try{
    const { fname,lname,phone,email, password } = req.body;
    const isExisting = await findUserByEmail(email);
    if (isExisting) {
      return res.send('Already existing');
    }
    // create new user
  
    const hashedPassword = await encrypt(password);
    let secret =speakeasy.generateSecret({length:20}).base32;
    let otp = speakeasy.totp({
      secret:secret,
      encoding:'base32',

    })
    const newUser = await User.create({
      fname,
      lname,
      phone,
      email,
      password: hashedPassword,
      otp: secret
    });
    if (!newUser) {
      return res.json({
        status:0,
        message:`User not created `
      })
    }
      

    // await client.messages.create({
    //         body: otp,
    //         from: process.env.TWILIO_NUMBER,
    //         to: phone
    //       })

    return res.json({
      status:1,
      message:`Successful sign up.Next step is login`,
      data:newUser
    })

  }catch(error){

    return res.json({
      status:0,
      message:`Unable to sign up user .${error}`
    })
  }
};

module.exports.login = async (req, res) => {

  const { email, otp,phone } = req.body;

  //find means of login
  let user ="";

  if(email){
    user= await User.findOne({email});
  }else if(phone){
    user= await User.findOne({phone});

  }else{
    return res.json({
      success: 0,
      message: "Provide email or phone number"
    });
  }

  if (!user) {
    return res.json({
      success: 0,
      message: "Invalid email"
    });

  }else{
    validOtp=speakeasy.totp({
      secret: user.otp,
      encoding: 'base32'
    });


    const tokenValidate = speakeasy.totp.verify({
      secret:user.otp,//expected
      encoding: 'base32',
      token:otp, //user input
      window:20 //valid otp for for 10 minutes
    });
    


    if(tokenValidate){
      let token = sign({ result: user }, JWT_SECRET, {expiresIn: "1h"});

      return res.json({
        success: 1,
        message: "login successfully",
        token: token,
      });
    } else {
      return res.json({
        success: 0,
        message: "Invalid OTP",
        otp:otp,
        validOtp:validOtp
      });
    }
  }
};

module.exports.logout = async (req, res) => {
  try{
    let email= req.params.email

    const user = await User.findOne({
      email
    });
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      $set: { active: false },
    });
    //do some redirect?or expire session
    return res.json({
              success: 1,
              message: "logout successfully",
              user: updatedUser
            });
  }catch(error){
    res.json({
      success: 1,
      error:error
     
    }); 
  }
};

module.exports.getOtp = async (req, res) => {

  let contact =req.params.contact

  if(contact.includes('+')){
    try{
      const user = await User.findOne({ phone:contact});
  
      let otp=speakeasy.totp({
        secret: user.otp,
        encoding: 'base32'
      }); 
  
  
      let message =await  client.messages
      .create({
        body: otp,
        from: process.env.TWILIO_NUMBER,
        to: contact
      })
  
      return res.json({
        "status":1,
        "message":`successfully sent phone to : ${contact}`,
        "data":message.sid
      })
  
    }catch(error){
      return res.json({
        "status":0,
        "message":error
      })
    }
  
  }
 
  if(contact.includes('@')){

    //checkif user exists 
    const user = await User.findOne({ email:contact});

    if (!user) {
      return res.json({
        "status":0,
        "message":"user does not exist"
      });
    }else{

      
      let otp=speakeasy.totp({
        secret: user.otp,
        encoding: 'base32'
      }); 
      try{
        //send mail

        await sendMail({
          to: user.email,
          OTP:otp,
        });


        return res.json({
          "status":1,
          "message":`successfully sent email to : ${user.email}`
        })
  
      }catch(error){
        return res.json({
          "status":0,
          "message":error
        })
      }

    }
   } else {
    return res.json({
      status:0,
      message:"invalid contact format"
    })
  }

}

module.exports.deleteUser=async (req,res)=>{
    try{
        // get user and  userId
        const user= await User.findById(req.params.userId);
       
        if(!user){
            return res.json({
                success: 0,
                message:`user not found`
            });
        }
        const userId=user[0].user;

        // validate and destroy
        if(req.decoded.result._id !== userId){
            return res.json({
                success: 0,
                message:"you are unauthorised to delete this user"
            });
        }else{
            let results=await user.delete();
            return res.json({
                success: 1,
                message:"success",
                data:results
               });
        }
    }catch(error){
 
        return res.json({
            success: 0,
            message:`could not delete user. ${error}`
        });

    }
}


const findUserByEmail = async (email) => {
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return false;
  }
  return user;
};



const createUser = async (fname,lname,phone,email, password) => {

  try{

    const hashedPassword = await encrypt(password);
    let secret =speakeasy.generateSecret({length:20}).base32;
    let otp = speakeasy.totp({
      secret:secret,
      encoding:'base32',

    })
    const newUser = await User.create({
      fname,
      lname,
      phone,
      email,
      password: hashedPassword,
      otp: secret
    });
    if (!newUser) {
      return [false, 'Unable to sign you up'];
    }
      

    await client.messages.create({
            body: otp,
            from: process.env.TWILIO_NUMBER,
            to: phone
          })

    return [true, newUser];
 
  }catch(error){
    return [false, 'Unable to sign up, Please try again later', error];
  }
  
};


