const { queryParams } = require("../helpers");
const {
  API_BASE_URL,
  WEB_REMIX_KEY,
  Endpoint_names,
  ANDROID_KEY,
  API_ORIGIN,
} = require("../../../config/ytm_config");

const methods = {
  searchSongsRequest: function (text, ctoken, itct) {
    // prepare data to create a request
    const context = {
        client: {
          clientName: "WEB_REMIX",
          clientVersion: "1.20220404.01.00",
        },
      },
      params = {
        browseId: "",
        query: decodeURIComponent(text),
        params: "EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D", // songs's raw filter for youtube music
      },
      continuation =
        ctoken && ctoken !== ""
          ? { continuation: ctoken, ctoken, itct: `${itct}`, type: "next" }
          : undefined;
    const body = { context, ...params };

    // create a request
    const request = fetch(
      API_BASE_URL +
        Endpoint_names.Search +
        "?" +
        (continuation
          ? queryParams(continuation) + `&sp=EgWKAQIIAWoKEAMQBBAKEAkQBQ%3D%3D&`
          : "") +
        `key=${WEB_REMIX_KEY}`,
      {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Origin: "https://music.youtube.com",
          "User-Agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      }
    );

    return request;
  },
  songDetailsRequest: function (id, includeArtist = true) {
    const context = {
        client: { clientName: "IOS", clientVersion: "17.13.3", hl: "en" },
      },
      params = {
        videoId: id,
        racyCheckOk: true,
        contentCheckOk: true,
        playlistId: "",
        params: "",
      };
    const body = { context, ...params };

    const request = fetch(
      API_BASE_URL + Endpoint_names.Player + `?key=${ANDROID_KEY}`,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Origin: API_ORIGIN,
        },
        body: JSON.stringify(body),
        method: "POST",
      }
    );
    return request;
  },
};

module.exports = methods;
