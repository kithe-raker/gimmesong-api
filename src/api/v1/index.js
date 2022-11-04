const express = require("express");
const router = express.Router();

const ytm = require("./controllers/ytm.controller");
const user = require("./controllers/user.controller");

// youtube music
router.get("/searchsongs", ytm.searchYTSong);
router.get("/getsongstreams", ytm.getYTSongDetails);

// about user
router.get("/getusername", user.getUsername);
router.get("/usernameexist", user.isUsernameExists);
router.get("/queryinbox", user.authenticateJWT, user.queryUserInbox);

router.post("/addnewuser", user.authenticateJWT, user.addNewUser);
router.post("/sendsong", user.sendSong);
router.post("/playsongfrominbox", user.authenticateJWT, user.playSongFromInbox);

module.exports = router;
