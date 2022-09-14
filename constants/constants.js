require('dotenv').config();
module.exports = {
  allowedOrigins: ['http://localhost:3000/'],
  SERVER_PORT: process.env.PORT || 3000,
  SERVER_DB_URI: process.env.DB_URI,
  // JWT_SECRET: `${process.env.JWT_SECRET}`,
  JWT_SECRET: "56ab984hi",
  OTP_LENGTH: 4,
  OTP_CONFIG: {
    lowerCaseAlphabets:false,
    upperCaseAlphabets: false,
    specialChars: false,
  },
  
  MAIL_SETTINGS: {
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken:process.env.OAUTH_ACCESS_TOKEN
    },
  },
};
