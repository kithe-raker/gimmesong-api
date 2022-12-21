const { pathRef } = require("../../../config/firebase_config");

const methods = {
  /**
   *
   * @param {*} type right now we only have [disc] and [emoji] vinyl component's type
   * @param {*} id
   * @returns
   */
  getStyleDetails: async function (type, id) {
    const doc = await pathRef.VinylStyle.StyleDocument(type, id).get();
    return { style: doc.data(), exists: doc.exists };
  },
  /**
   *
   * @param {{
   *            disc: string,
   *            emoji: string,
   *        }} vinylStyle
   * @returns message string if there are any error occurs
   */
  validateVinylStyle: async function (vinylStyle) {
    if (!vinylStyle.disc) return "No vinyl disc style provided";
    if (!vinylStyle.emoji) return "No vinyl emoji provided";

    // validate if the provided vinyl style is exists
    const discStyle = await this.getStyleDetails(
      "disc",
      vinylStyle.disc
    );
    if (!discStyle.exists)
      return "provided disc vinyl's style doesn't exist";

    const emojiStyle = await this.getStyleDetails("emoji", vinylStyle.emoji);
    if (!emojiStyle.exists)
      return "provided emoji vinyl's style doesn't exist";

    return;
  },
};

module.exports = methods;
