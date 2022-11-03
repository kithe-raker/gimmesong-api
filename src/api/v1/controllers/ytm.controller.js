const ytm_func = require("../repositories/ytm.repository");

const methods = {
  searchYTSong: async function (req, res, next) {
    try {
      const search_text = req.query?.text ?? "",
        ctoken = req.query?.ctoken ?? "",
        itct = req.query?.itct ?? "";

      const results = await ytm_func.searchSongs(search_text, ctoken, itct);

      res.json({ success: true, ...results });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
  getYTSongDetails: async function (req, res, next) {
    try {
      const id = req.query?.id ?? "";

      const results = await ytm_func.getSongDetails(id);

      res.json({ success: true, results });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
};

module.exports = methods;
