const { pathRef } = require("../../../config/firebase_config");

const methods = {
  /**
   *
   * @param {*} type right now we only have [background] and [center] vinyl component's type
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
   *            background: string,
   *            center: string,
   *        }} vinylStyle
   * @returns message string if there are any error occurs
   */
  validateVinylStyle: async function (vinylStyle) {
    if (!vinylStyle.background) return "No vinyl background style provided";
    if (!vinylStyle.center) return "No vinyl center style provided";

    // validate if the provided vinyl style is exists
    const backgroundStyle = await this.getStyleDetails(
      "background",
      vinylStyle.background
    );
    if (!backgroundStyle.exists)
      return "provided background vinyl's style doesn't exist";

    const CenterStyle = await this.getStyleDetails("center", vinylStyle.center);
    if (!CenterStyle.exists)
      return "provided center vinyl's style doesn't exist";

    return;
  },
};

module.exports = methods;
