const express = require("express");
const router = express.Router();

const ytm = require("./controllers/ytm.controller");

router.get("/searchsongs", ytm.searchYTSong);

module.exports = router;
