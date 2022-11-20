const SongRequestFunction = require("../repositories/songRequest.repository");

const methods = {
  getSongRequestDetailsByLinkId: async function (req, res, next) {
    try {
      const linkId = req.params?.linkId;

      const results = await SongRequestFunction.getSongRequestDetailsByLinkId(
        linkId
      );
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getSongRequestDetails: async function (req, res, next) {
    try {
      const langTag = req.params?.langTag,
        id = req.params?.id;

      const results = await SongRequestFunction.getSongRequestDetails(
        id,
        langTag
      );
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getLinkDetails: async function (req, res, next) {
    try {
      const linkId = req.params?.linkId;

      const results = await SongRequestFunction.getLinkDetails(linkId);
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
  querySongRequestItem: async function (req, res, next) {
    try {
      const { langTag, requestId, lastItemId, limit } = req.body;

      const results = await SongRequestFunction.querySongRequestItem(
        langTag,
        requestId,
        {
          limit: limit,
          lastItemId: lastItemId,
        }
      );

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
      const uid = _getUserId(req);
      if (!uid) {
        res.status(401).json({ details: "required authorization" });
        return;
      }
      const { langTag, requestId, message, song } = req.body;

      await SongRequestFunction.addSongToSongRequest(
        langTag,
        requestId,
        uid,
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
