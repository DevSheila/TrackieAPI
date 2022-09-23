const jwt = require("jsonwebtoken");
module.exports = {
  checkToken: (req, res, next) => {
    let token = req.headers['authorization'];
    if (token) {
      // Remove Bearer from string
      let[type, jwtToen] = token.split(" ");
      jwt.verify(jwtToen, process.env.SECRET, (err, decoded) => {
        if (err) {
          return res.json({
            status: 0,
            message: "Invalid Token..."
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.json({
        status: 0,
        message: "Access Denied! Unauthorized User"
      });
    }
  }
};
