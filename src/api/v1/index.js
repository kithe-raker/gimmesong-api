const express = require("express");
const router = express.Router();

const ytm = require("./controllers/ytm.controller");
const user = require("./controllers/user.controller");
const songRequest = require("./controllers/songRequest.controller");
const stats = require("./controllers/stats.controller");

// youtube music
router.get("/searchsongs", ytm.searchYTSong);
router.get("/getsongstreams", ytm.getYTSongDetails);

// about user
router.get("/getusername", user.getUsername);
router.get("/usernameexist", user.isUsernameExists);
router.get("/queryinbox", user.authenticateJWT, user.queryUserReceivedSongs);

router.post("/user/inbox", user.authenticateJWT, user.queryUserInbox);

router.post("/addnewuser", user.authenticateJWT, user.addNewUser);
router.post("/sendsong", user.sendSong);
router.post("/playsongfrominbox", user.authenticateJWT, user.playSongFromInbox);

// song-request
router.get("/songrequest/linkdetails/:linkId", songRequest.getLinkDetails);
router.get(
  "/songrequest/details/:langTag/:id",
  songRequest.getSongRequestDetails
);
router.get(
  "/songrequest/detailsbylink/:linkId",
  songRequest.getSongRequestDetailsByLinkId
);

router.post("/songrequest/mostview", songRequest.queryMostViewSongRequest);
router.post("/songrequest/newest", songRequest.queryNewestSongRequest);
router.post(
  "/songrequest/user",
  user.authenticateJWT,
  songRequest.queryUserSongRequest
);
router.post("/songrequest/items", songRequest.querySongRequestItem);

router.post(
  "/songrequest/create",
  user.authenticateJWT,
  songRequest.createSongRequest
);
router.post("/songrequest/addsong", user.authenticateJWT, songRequest.addSong);
router.post("/songrequest/incrementview", songRequest.incrementViews);

// stats
router.get("/totalsongsent", stats.getTotalSongSent);
router.get("/topchartsongs", stats.queryTopChartSongs);

module.exports = router;
