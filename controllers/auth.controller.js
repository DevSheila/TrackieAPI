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
    const newUser = await createUser(fname,lname,phone,email, password);
    if (!newUser[0]) {
      return res.status(400).send({
        message: 'Unable to create new user',
      });
    }
    res.send(newUser);

  }catch(error){
    console.log(error)
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
      data: "Provide email or phone number"
    });
  }

  if (!user) {
    return res.json({
      success: 0,
      data: "Invalid email"
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
        data: "Invalid OTP",
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
  try {
    
    //send mail
    // await sendMail({
    //   to: email,
    //   OTP:otp,
    // });

    //send SMS

    // client.messages
    // .create({
    //   body: otp,
    //   from: process.env.TWILIO_NUMBER,
    //   to: '+254710617776'
    // })
    // .then(message => console.log(message.sid));

    await client.messages.create({
            body: otp,
            from: process.env.TWILIO_NUMBER,
            to: phone
          })

    return [true, newUser];
  } catch (error) {
    return [false, 'Unable to sign up, Please try again later', error];
  }
};


