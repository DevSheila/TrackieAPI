const totp = require("totp-generator");
const token = totp("JBSWY3DPEHPK3PXP", {
	digits: 4,
	algorithm: "SHA-512",
	period: 60,
	// timestamp: 1465324707000,
});
console.log(token);