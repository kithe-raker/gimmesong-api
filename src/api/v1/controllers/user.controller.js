const UserFunction = require("../repositories/user.repository");

const methods = {
  getUsername: async function (req, res, next) {
    try {
      const uid = req.query?.uid;
      const results = await UserFunction.getUsername(uid);

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  isUsernameExists: async function (req, res, next) {
    try {
      const username = req.query?.username;
      const { exists } = await UserFunction.getUserIdByName(username);

      res.json({ success: true, results: { exists } });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // getUserId: async function (req, res, next) {
  //   try {
  //     const username = req.query?.username;
  //     const results = await UserFunction.getUserIdByName(username);

  //     res.json({ success: true, results });
  //   } catch (error) {
  //     res.status(500).json(error);
  //   }
  // },
  queryUserInbox: async function (req, res, next) {
    try {
      const { uid, onlyNewSong } = req.body;

      const results = await UserFunction.queryReceivedSongs(uid, onlyNewSong);

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  addNewUser: async function (req, res, next) {
    try {
      const { uid, username } = req.body;
      await UserFunction.addNewUser(uid, username);

      res.json({ success: true });
    } catch (error) {
      if (error == "This Username already exists") {
        res.status(400).json(error);
      } else {
        res.status(500).json(error);
      }
    }
  },
  sendSong: async function (req, res, next) {
    try {
      const { recipient, message, song } = req.body;

      const { recipientUid, exists } = await UserFunction.getUserIdByName(
        recipient
      );

      if (!exists) throw "Not found this username";

      // implement song parser to validate song object
      // here

      await UserFunction.sendSong(recipientUid, message, song);

      res.json({ success: true });
    } catch (error) {
      if (error == "Not found this username") {
        res.status(404).json(error);
      } else {
        res.status(500).json(error);
      }
    }
  },
};

module.exports = methods;
