const JsonWebToken = require("jsonwebtoken")
let {JWT_SECRET}=require('../constants/constants')

let getBearerToken = function(header, callback){
  if(header) {
      token = header.split(" ");
      if(token.length == 2) {
          return callback(null, token[1]);
      } else {
          return callback("Malformed bearer token", null);
      }
  } else {
      return callback("Missing authorization header"
      
      , null);
  }
}

module.exports = {
  checkToken: (req, res, next) => {
    let token=req.headers["authorization"]

    if (token) {
      getBearerToken(token, function(error, token) {
        if(error) {
          return res.status(401).send({ 
            "success": 0, 
            "message": error
          });
        }
        JsonWebToken.verify(token, JWT_SECRET, function(error, decoded) {
            if(error) {
                console.log(error)
                return res.status(401).send({
                  "success": 0,
                  "error": "Invalid authorization token" 
                });
              } else {
                req.decoded = decoded;
                next();
              }
        });
      });
    }else {
      return res.json({
        success: 0,
        message: "Access Denied! Unauthorized User"
      });
    }
  }
}

