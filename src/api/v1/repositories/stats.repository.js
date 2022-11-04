const { pathRef, ServerValue } = require("../../../config/firebase_config");

const methods = {
  getSongSentStats: async function () {
    const snapshot = await pathRef.SongSentStatsRef.once("value");
    return snapshot?.val() ?? 0;
  },
  incrementSongSentStats: async function () {
    return await pathRef.SongSentStatsRef.set(ServerValue.increment(1));
  },
};

module.exports = methods;
