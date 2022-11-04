const express = require("express");
const router = express.Router();

const ytm = require("./controllers/ytm.controller");
const user = require("./controllers/user.controller");

// youtube music
router.get("/searchsongs", ytm.searchYTSong);
router.get("/getsongstreams", ytm.getYTSongDetails);

// about user
router.get("/getusername", user.getUsername);
router.get("/queryinbox", user.queryUserInbox);

router.post("/addnewuser", user.addNewUser);
router.post("/sendsong", user.sendSong);

module.exports = router;
