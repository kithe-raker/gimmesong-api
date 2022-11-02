const ytm_helper = require("./ytm_parser.helper");

const methods = {
  queryParams: function (params) {
    const result = [];
    for (const key in params) {
      if (typeof params[key] !== "number" && !params[key]) continue;
      result.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      );
    }
    return result.join("&");
  },
};

module.exports = { ...methods, ...ytm_helper };
