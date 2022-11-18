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
  queryTopChartSongs: async function (req, res, next) {
    try {
      const results = await StatsFunction.queryTopChartSongs();

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

module.exports = methods;
