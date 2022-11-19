const SongRequestFunction = require("../repositories/songRequest.repository");

const methods = {
  getLinkDetails: async function (req, res, next) {
    try {
      const id = req.query?.id;

      const results = await SongRequestFunction.getLinkDetails(id);
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  queryUserSongRequest: async function (req, res, next) {
    try {
      const uid = _getUserId(req);
      if (!uid) {
        res.status(401).json({ details: "required authorization" });
        return;
      }
      const { lastRequestId, limit } = req.body;

      const results = await SongRequestFunction.queryUserSongRequest(uid, {
        limit: limit,
        lastRequestId: lastRequestId,
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  queryMostViewSongRequest: async function (req, res, next) {
    try {
      const { langTag, lastRequestId, limit } = req.body;

      const results = await SongRequestFunction.querySongRequest(langTag, {
        orderBy: "mostview",
        limit: limit,
        lastRequestId: lastRequestId,
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  queryNewestSongRequest: async function (req, res, next) {
    try {
      const { langTag, lastRequestId, limit } = req.body;

      const results = await SongRequestFunction.querySongRequest(langTag, {
        orderBy: "newest",
        limit: limit,
        lastRequestId: lastRequestId,
      });

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  createSongRequest: async function (req, res, next) {
    try {
      const uid = _getUserId(req);
      if (!uid) {
        res.status(401).json({ details: "required authorization" });
        return;
      }
      const { langTag, message, isAnonymous } = req.body;

      const results = await SongRequestFunction.createSongRequest(
        langTag,
        message,
        uid,
        isAnonymous
      );
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  addSong: async function (req, res, next) {
    try {
      const { langTag, requestId, message, song } = req.body;

      await SongRequestFunction.addSongToSongRequest(
        langTag,
        requestId,
        message,
        song
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  incrementViews: async function (req, res, next) {
    try {
      const { requestId, langTag } = req.body;

      await SongRequestFunction.incrementViews(requestId, langTag);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

// ==================== Private function ====================

function _getUserId(req) {
  return req?.user?.uid;
}

module.exports = methods;
