const express          = require("express");
const userCtrl         = require("../../controller/backend/user/userCtrl");
const loginCtrl        = require("../../controller/backend/user/loginCtrl"); 
const logoutCtrl       = require("../../controller/backend/user/logoutCtrl");
const checkLoginFilter = require("../../filter/checkLoginFilter");

let router  = express.Router();

router.get("/", checkLoginFilter,
				userCtrl.getUser);

router.post("/login" ,  loginCtrl.checkCaptcha, 
						loginCtrl.checkNameAndPassword,
						loginCtrl.loginSuccess);

router.post("/logout", 	checkLoginFilter, 
						logoutCtrl.logout);


module.exports = router;