const { encrypt, compare } = require('../services/crypto');
const { generateOTP } = require('../services/OTP');
const { sendMail } = require('../services/MAIL');
const User = require('../models/User');
const passport=require('passport');
const BodyParser = require("body-parser");
const JsonWebToken = require("jsonwebtoken");
const Bcrypt = require("bcryptjs");
const TwoFactor = require('node-2fa');
const { JWT_SECRET } = require('../constants/constants');



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
    validOtp=TwoFactor.generateToken(user.otp)
    if(validOtp === otp){
      var token = JsonWebToken.sign({ "email": email }, JWT_SECRET, {});

      return res.json({
        success: 1,
        message: "login successfully",
        token: jsontoken
      });
    } else {
      return res.json({
        success: 0,
        data: "Invalid OTP"
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

// =======================================================================
// var getBearerToken = function(header, callback) {
//   if(header) {
//       token = header.split(" ");
//       if(token.length == 2) {
//           return callback(null, token[1]);
//       } else {
//           return callback("Malformed bearer token", null);
//       }
//   } else {
//       return callback("Missing authorization header", null);
//   }
// }

// var validateToken = function(request, response, next) {
//   getBearerToken(request.headers["authorization"], function(error, token) {
//       if(error) {
//           return response.status(401).send({ "success": false, "message": error });
//       }
//       JsonWebToken.verify(token, app.get("jwt-secret"), function(error, decodedToken) {
//           if(error) {
//               return response.status(401).send({ "success": false, "error": "Invalid authorization token" });
//           }
//           if(decodedToken.authorized) {
//               request.decodedToken = decodedToken;
//               next();
//           } else {
//               return response.status(401).send({ "success": false, "error": "2FA is required" });
//           }
//       });
//   });
// };

// app.post("/authenticate", function(request, response) {
//   var user = {
//       "email": "nraboy",
//       "password": "$2a$04$6ovemVqYBt2/j6lbrQ7MQuN1TW2nCrRbRnMjMrYUAP1pcJAG9zFHW",
//       "2fa": true
//   };
//   if(!request.body.email) {
//       return response.status(401).send({ "success": false, "message": "A `email` is required"});
//   } else if(!request.body.password) {
//       return response.status(401).send({ "success": false, "message": "A `password` is required"});
//   }
//   Bcrypt.compare(request.body.password, user.password, function(error, result) {
//       if(error || !result) {
//           return response.status(401).send({ "success": false, "message": "Invalid email and password" });
//       }
//       var token = JsonWebToken.sign({ "email": user.email, "authorized": !user["2fa"] }, app.get("jwt-secret"), {});
//       response.send({ "token": token, "2fa": user["2fa"] });
//   });
// });

// app.post("/verify-totp", function(request, response) {
//   var user = {
//       "email": "nraboy",
//       "password": "$2a$04$6ovemVqYBt2/j6lbrQ7MQuN1TW2nCrRbRnMjMrYUAP1pcJAG9zFHW",
//       "totpsecret": "2MXGP5X3FVUEK6W4UB2PPODSP2GKYWUT"
//   };
  // getBearerToken(request.headers["authorization"], function(error, token) {
  //     if(error) {
  //         return response.status(401).send({ "success": false, "message": error });
  //     }
  //     if(!request.body.otp) {
  //         return response.status(401).send({ "success": false, "message": "An `otp` is required"});
  //     }
  //     JsonWebToken.verify(token, app.get("jwt-secret"), function(error, decodedToken) {
  //         if(TwoFactor.verifyToken(user.totpsecret, request.body.otp)) {
  //             decodedToken.authorized = true;
  //             var token = JsonWebToken.sign(decodedToken, app.get("jwt-secret"), {});
  //             return response.send({ "token": token });
  //         } else {
  //             return response.status(401).send({ "success": false, "message": "Invalid one-time password" });
  //         }
  //     });
  // });
// });

// app.get("/generate-secret", function(request, response) {
//   response.send({ "secret": TwoFactor.generateSecret() });
// });

// app.post("/generate-otp", function(request, response) {
//   response.send({ "otp": TwoFactor.generateToken(request.body.secret) });
// });

// app.get("/protected", validateToken, function(request, response) {
//   response.send({ "message": "Welcome to the protected page" });
// });

