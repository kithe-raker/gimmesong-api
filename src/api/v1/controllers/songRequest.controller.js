const SongRequestFunction = require("../repositories/songRequest.repository");

const methods = {
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
  incrementViews: async function (req, res, next) {
    try {
      const { requestId, langTag } = req.body;
      if (!requestId) throw "no request id provided";
      if (!langTag) throw "no language tag provided";

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
