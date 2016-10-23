const express        = require("express");
const renderCtrl     = require("../../controller/templateRenderCtrl").backend;
const captchaCtrl    = require("../../controller/common/captchaCtrl");
const userRouter     = require("./user");
const categoryRouter = require("./category");
const articleRouter  = require("./article");
const dirRouter      = require("./directory");

let router = express.Router();

// page route
router.get("/"      , renderCtrl.renderDefaultPage);
router.get("/login" , renderCtrl.renderLoginPage);
router.get("/home"  , renderCtrl.renderHomePage);

// captcha
router.get("/captcha", 	captchaCtrl.updateCaptcha);

// user route
router.use("/user"     , userRouter);
router.use("/category" , categoryRouter);
router.use("/article"  , articleRouter);
router.use("/directory", dirRouter);

module.exports = router; 