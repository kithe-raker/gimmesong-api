const StatsFunction = require("../repositories/stats.repository");

const methods = {
  getTotalSongSent: async function (req, res, next) {
    try {
      const value = await StatsFunction.getSongSentStats();

      res.json({ value });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  incrementTotalSongSent: async function (req, res, next) {
    try {
      await StatsFunction.incrementSongSentStats();

      res.json({ success: true });
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = methods;
