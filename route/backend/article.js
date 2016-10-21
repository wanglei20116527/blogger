const express          = require("express");
const articleCtrl      = require("../../controller/backend/article/articleCtrl");
const checkLoginFilter = require("../../filter/checkLoginFilter");

let router = express.Router();

router.get("/", checkLoginFilter,  articleCtrl.getArticles);
router.get("/number", checkLoginFilter, articleCtrl.getNumberOfArticles);



module.exports = router;