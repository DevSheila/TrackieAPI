const { encrypt} = require('../services/crypto');
const { sendMail } = require('../services/MAIL');
const User = require('../models/User');
const JsonWebToken = require("jsonwebtoken");
const TwoFactor = require('node-2fa');
const { JWT_SECRET } = require('../constants/constants');
const { sign } = require("jsonwebtoken");




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
    validOtp=TwoFactor.generateToken(user.otp).token
    if(validOtp === otp){
      let token = sign({ result: user }, JWT_SECRET, {expiresIn: "1h"});
      // var token = JsonWebToken.sign({ "username": user.username, "authorized": !user["2fa"] }, app.get("jwt-secret"), {});


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

  let otpGenerated =TwoFactor.generateSecret().secret

  console.log(`token${TwoFactor.generateToken(otpGenerated).token}`)

  const newUser = await User.create({
    fname,
    lname,
    phone,
    email,
    password: hashedPassword,
    otp: otpGenerated
  });
  if (!newUser) {
    return [false, 'Unable to sign you up'];
  }
  try {
    await sendMail({
      to: email,
      OTP:TwoFactor.generateToken(otpGenerated).token,
    });
    return [true, newUser];
  } catch (error) {
    return [false, 'Unable to sign up, Please try again later', error];
  }
};

const validateUserSignUp = async (email, otp) => {
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return [false, 'User not found'];
  }
  if (user && user.otp !== otp) {
    return [false, 'Invalid OTP'];
  }
  const updatedUser = await User.findByIdAndUpdate(user._id, {
    $set: { active: true },
  });
  return [true, updatedUser];
};

