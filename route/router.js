const express   = require("express");
const backend   = require("./backend/backend");
const errorCtrl = require("../controller/common/errorCtrl");

let router  = express.Router();

router.use("/", errorCtrl);
router.use("/backend", backend);

module.exports = router;