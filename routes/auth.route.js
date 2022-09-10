const router = require('express').Router();
const authController = require('../controllers/auth.controller');
var TwoFactor = require('node-2fa');


router.post('/', authController.signUpUser);
router.post('/login', authController.login);
router.post('/logout/:email', authController.logout);
router.get("/generate-secret", function(request, response) {
  response.send({ "secret": TwoFactor.generateSecret() });
});

router.post("/generate-otp", function(request, response) {
  response.send({ "otp": TwoFactor.generateToken(request.body.secret) });
});



module.exports = router;
