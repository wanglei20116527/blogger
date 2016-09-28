const express     = require("express");
const renderCtrl  = require("../controller/templateRenderCtrl").backend;
const captchaCtrl = require("../controller/captchaCtrl");
const userCtrl    = require("../controller/userCtrl"); 
const loginCtrl   = require("../controller/loginCtrl");
const logoutCtrl  = require("../controller/logoutCtrl");


const checkLoginFilter = require("../filter/checkLoginFilter");

let router = express.Router();

router.get("/"      , renderCtrl.renderDefaultPage);
router.get("/login" , renderCtrl.renderLoginPage);
router.get("/home"  , renderCtrl.renderHomePage);

router.get("/captcha", 	captchaCtrl.updateCaptcha);

router.post("/login", 	loginCtrl.checkCaptcha, 
						loginCtrl.checkNameAndPassword,
						loginCtrl.loginSuccess);

router.post("/logout", 	checkLoginFilter, 
						logoutCtrl.logout);


// router.get("/user", checkLoginFilter, userCtrl);

module.exports = router; 