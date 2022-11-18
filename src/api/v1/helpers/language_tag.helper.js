const methods = {
  validateTag: function (languageTag) {
    if (!languageTag) throw "No language tag provided";
    if (languageTag.length < 2)
      throw "Invalid language tag(must be IETF format)";

    const tag = languageTag.split("-")[0].toLowerCase();
    if (!/^[a-zA-Z]+$/.test(tag))
      throw "Invalid language tag(must be IETF format)";

    return tag;
  },
};

module.exports = methods;
