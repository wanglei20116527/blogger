const express          = require("express");
const dirCtrl          = require("../../controller/backend/directory/directoryCtrl");
const checkLoginFilter = require("../../filter/checkLoginFilter");

const router  = express.Router();

router.put("/", checkLoginFilter, dirCtrl.addDirectory);
router.post("/", checkLoginFilter, dirCtrl.updateDirectory);
router.delete("/", checkLoginFilter, dirCtrl.deleteDirectory)

router.get("/subDirectories", checkLoginFilter, dirCtrl.getDirectoies);

module.exports = router;