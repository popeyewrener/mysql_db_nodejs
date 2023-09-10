const express = require("express");
const coin_router = require("../routers/coin_router");
const router = express.Router();
router.post("/", coin_router.coinprocessor );

module.exports = router;