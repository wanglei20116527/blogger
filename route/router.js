const express = require("express");
const backend = require("./backend/backend");

let router  = express.Router();

router.use("/backend", backend);

module.exports = router;