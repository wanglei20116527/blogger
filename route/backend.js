const express     = require("express");
const captchaCtrl = require("../controller/captchaCtrl"); 
const loginCtrl   = require("../controller/loginCtrl");
const logoutCtrl  = require("../controller/logoutCtrl");

let router = express.Router();

router.get("/captcha", 	captchaCtrl.updateCaptcha);

router.post("/login", 	loginCtrl.checkCaptcha, 
						loginCtrl.checkNameAndPassword,
						loginCtrl.loginSuccess);

router.post("/logout", logoutCtrl.logout);

module.exports = router; 