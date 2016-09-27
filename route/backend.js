const express  = require("express");
const userCtrl = require("../controller/userCtrl");

let router = express.Router();

router.post("/login" , userCtrl.login);
router.post("/logout", userCtrl.logout);

module.exports = router; 