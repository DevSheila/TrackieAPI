const { encrypt} = require('../services/crypto');
const { sendMail } = require('../services/MAIL');
const User = require('../models/User');
const JsonWebToken = require("jsonwebtoken");
const TwoFactor = require('node-2fa');
const { JWT_SECRET } = require('../constants/constants');
const { sign } = require("jsonwebtoken");
const speakeasy = require('speakeasy');




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
  const { email, otp } = req.body;

  const user = await User.findOne({email});

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


    const toeknValidate = speakeasy.totp.verify({
      secret:user.otp,//expected
      encoding: 'base32',
      token:otp, //user input
      window:10 //valid otp for for 5 minutes
    });
    
    console.log(toeknValidate)


    if(toeknValidate){
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

   
    await sendMail({
      to: email,
      OTP:otp,
    });
    return [true, newUser];
  } catch (error) {
    return [false, 'Unable to sign up, Please try again later', error];
  }
};


