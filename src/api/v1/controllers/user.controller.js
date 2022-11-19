const UserFunction = require("../repositories/user.repository");
const { fa } = require("../../../config/firebase_config");

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
  queryUserReceivedSongs: async function (req, res, next) {
    try {
      const uid = _getUserId(req);
      if (!uid) {
        res.status(401).json({ details: "required authorization" });
        return;
      }

      const filter = req.query?.filter ?? "all";
      const results = await UserFunction.queryReceivedSongs(uid, filter);

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  queryUserInbox: async function (req, res, next) {
    try {
      const uid = _getUserId(req);
      if (!uid) {
        res.status(401).json({ details: "required authorization" });
        return;
      }

      const { filter, lastItemId, limit } = req.body;

      const results = await UserFunction.queryInbox(uid, {
        filter: filter ?? "all",
        lastItemId,
        limit,
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  addNewUser: async function (req, res, next) {
    try {
      const uid = _getUserId(req);
      if (!uid) {
        res.status(401).json({ details: "required authorization" });
        return;
      }

      const { username } = req.body;
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
      const { uid, exists } = await UserFunction.getUserIdByName(recipient);

      if (!exists) throw "Not found this username";

      await UserFunction.sendSong(uid, message, song);

      res.json({ success: true });
    } catch (error) {
      if (error == "Not found this username") {
        res.status(404).json(error);
      } else {
        res.status(500).json(error);
      }
    }
  },
  playSongFromInbox: async function (req, res, next) {
    try {
      const uid = _getUserId(req);
      if (!uid) {
        res.status(401).json({ details: "required authorization" });
        return;
      }

      const { inboxId } = req.body;
      await UserFunction.playSongFromInbox(uid, inboxId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  authenticateJWT: async function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const idToken = authHeader.split(" ")[1];
      fa.verifyIdToken(idToken)
        .then(function (decodedToken) {
          req.user = decodedToken;
          return next();
        })
        .catch(function (error) {
          return res.sendStatus(403);
        });
    } else {
      res.sendStatus(401);
    }
  },
};

// ==================== Private function ====================

function _getUserId(req) {
  return req?.user?.uid;
}

module.exports = methods;
