const { pathRef } = require("../../../config/firebase_config");

const methods = {
  getCachedSongDetails: async function (songId) {
    const doc = await pathRef.SongDocument(songId).get();
    return { song: doc.data(), exists: doc.exists && doc.data().videoId };
  },
};

module.exports = methods;
