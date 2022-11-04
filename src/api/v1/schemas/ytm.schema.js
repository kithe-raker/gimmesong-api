const Joi = require("joi");

const schemas = {
  SongSchema: Joi.object({
    title: Joi.string().required(),
    videoId: Joi.string().required(),
    artistInfo: Joi.object().keys({
      artist: Joi.array()
        .min(1)
        .items(
          Joi.object({
            text: Joi.string().required(),
            browseId: Joi.string(),
            pageType: Joi.string(),
          })
        ),
    }),
    thumbnails: Joi.array()
      .min(1)
      .items(
        Joi.object({
          url: Joi.string().required(),
          width: Joi.number(),
          height: Joi.number(),
        })
      ),
    length: Joi.string().required(),
  }),
};

module.exports = { ...schemas };
