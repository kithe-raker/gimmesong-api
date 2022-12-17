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
};

module.exports = methods;
