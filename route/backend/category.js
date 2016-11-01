const express          = require("express");
const checkLoginFilter = require("../../filter/checkLoginFilter");
const categoryCtrl     = require("../../controller/backend/category/categoryCtrl");

let router = express.Router();

router.get("/all", checkLoginFilter, categoryCtrl.getCategories);
router.put("/", checkLoginFilter, categoryCtrl.addCategory);
router.post("/", checkLoginFilter, categoryCtrl.updateCategory);
router.delete("/", checkLoginFilter, categoryCtrl.deleteCategories);			 				

module.exports = router;