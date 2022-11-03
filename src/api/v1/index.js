const express = require("express");
const router = express.Router();

const ytm = require("./controllers/ytm.controller");

router.get("/searchsongs", ytm.searchYTSong);
router.get("/getsongstreams", ytm.getYTSongDetails);

// test commit

module.exports = router;
