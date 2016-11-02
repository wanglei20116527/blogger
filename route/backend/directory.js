const express          = require("express");
const dirCtrl          = require("../../controller/backend/directory/directoryCtrl");
const checkLoginFilter = require("../../filter/checkLoginFilter");

const router  = express.Router();

router.get("/", checkLoginFilter, dirCtrl.getDirectoies);
router.put("/", checkLoginFilter, dirCtrl.addDirectory);
router.post("/", checkLoginFilter, dirCtrl.updateDirectory);
router.delete("/", checkLoginFilter, dirCtrl.deleteDirectory)

module.exports = router;