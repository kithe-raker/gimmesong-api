const express = require("express");
const router = express.Router();

const ytm = require("./controllers/ytm.controller");

// youtube music 
router.get("/searchsongs", ytm.searchYTSong);
router.get("/getsongstreams", ytm.getYTSongDetails);

// about user

// get username
// query my songs

// new user
// send song


module.exports = router;
