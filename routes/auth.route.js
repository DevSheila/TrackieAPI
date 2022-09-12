const router = require('express').Router();
const authController = require('../controllers/auth.controller');
var TwoFactor = require('node-2fa');
const speakeasy=require('speakeasy')


router.post('/signup', authController.signUpUser);
router.post('/login', authController.login);
router.post('/logout/:email', authController.logout);
router.get("/generate-secret", function(request, response) {
  response.send({ "secret": TwoFactor.generateSecret() });
});

router.post("/generate-otp", function(request, response) {
  let token=speakeasy.totp({
    secret: request.body.secret,
    encoding: 'base32',
    window:5
  });
  response.send({ "otp": token });
});




module.exports = router;
