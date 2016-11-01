const express          = require("express");
const articleCtrl      = require("../../controller/backend/article/articleCtrl");
const checkLoginFilter = require("../../filter/checkLoginFilter");

let router = express.Router();

router.get("/", checkLoginFilter, articleCtrl.getArticles);
router.get("/number", checkLoginFilter, articleCtrl.getNumberOfArticles);
router.get("/statistic", checkLoginFilter, articleCtrl.getStatisticOfArticles);
router.put("/", checkLoginFilter, articleCtrl.addArticle);
router.post("/", checkLoginFilter, articleCtrl.updateArticle);
router.delete("/", checkLoginFilter, articleCtrl.deleteArticle);

module.exports = router;