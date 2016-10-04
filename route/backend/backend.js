const express     = require("express");
const renderCtrl  = require("../../controller/templateRenderCtrl").backend;
const captchaCtrl = require("../../controller/common/captchaCtrl");
const userRouter  = require("./user");

let router = express.Router();

// page route
router.get("/"      , renderCtrl.renderDefaultPage);
router.get("/login" , renderCtrl.renderLoginPage);
router.get("/home"  , renderCtrl.renderHomePage);

// captcha
router.get("/captcha", 	captchaCtrl.updateCaptcha);

// user route
router.use("/user", userRouter);


module.exports = router; 