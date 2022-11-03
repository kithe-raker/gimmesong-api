const { SearchContentParser, SongDetailsParser } = require("../helpers");
const ytm = require("../services/ytm_service");

const methods = {
  searchSongs: async function (text, ctoken, itct) {
    const response = await ytm.searchSongsRequest(text, ctoken, itct);

    if (!response.ok) {
      throw response.statusText;
    }

    const data = await response.json();

    // parse content
    const hasTabs = Array.isArray(
      data?.contents?.tabbedSearchResultsRenderer?.tabs
    );
    const contents =
      hasTabs &&
      data.contents.tabbedSearchResultsRenderer.tabs[0].tabRenderer?.content
        ?.sectionListRenderer?.contents;
    const continuationContents =
      data?.continuationContents?.musicShelfContinuation;

    const results =
      ctoken !== ""
        ? _parseContinuation(continuationContents, "songs")
        : _parseContents(contents, "songs");

    return results;
  },
  /**
   * Right now only returning streaming data
   * @param {string} id
   * @returns
   */
  getSongDetails: async function (id) {
    const response = await ytm.songDetailsRequest(id);

    if (!response.ok) {
      // Suggestion (check for correctness before using):
      // return new Response(response.statusText, { status: response.status });
      return error(response.status, response.statusText);
    }
    const data = await response.json();

    if (
      data &&
      !data?.streamingData &&
      data?.playabilityStatus.status === "UNPLAYABLE"
    ) {
      throw "Error Unplayable";
    }

    const result = SongDetailsParser(data);
    return result;
  },
};

// ==================== Private function ====================

function _parseContinuation(contents, filter) {
  const continuation =
    Array.isArray(contents?.continuations) &&
    contents?.continuations[0]?.nextContinuationData;
  const type = filter.includes("playlists") ? "playlists" : filter;

  const results = _parseResults(contents.contents, type);

  return {
    continuation,
    results,
    type: "next",
  };
}

function _parseContents(contents, filter) {
  const results = [];
  const continuation = {};

  let len = contents.length;
  const type = filter.includes("playlists") ? "playlists" : filter;
  while (--len > -1) {
    const shelf = { contents: [], header: { title: "" } };
    const section = contents[len];

    if (section && section.itemSectionRenderer) {
      continue;
    }
    const musicShelf = section.musicShelfRenderer;
    // Get the inner contents
    const items = Array.isArray(musicShelf.contents) && musicShelf.contents;

    // Gets the continuation tokens
    if (
      Array.isArray(musicShelf?.continuations) &&
      musicShelf?.continuations[0].nextContinuationData
    )
      Object.assign(
        continuation,
        musicShelf.continuations[0].nextContinuationData
      );

    // If the section has an array at the property `contents` - parse it.
    if (items) {
      const _results = _parseResults(items, type);
      shelf.contents = _results;
    }
    if (musicShelf.title) {
      shelf.header.title = musicShelf.title?.runs[0]?.text;
    }
    results.unshift(shelf);
  }
  return { results, continuation };
}

/**
 *
 * @param {Array} array
 * @param {*} cb
 */
function _iter(array, cb) {
  const len = array.length;
  let idx = -1;
  while (++idx < len) {
    cb(array[idx], idx, array);
  }
  idx = null;
}

function _parseResults(items, type) {
  const results = [];
  let idx = items.length;
  while (--idx > -1) {
    const entry = items[idx];
    const item = SearchContentParser(entry);
    Object.assign(item, { type: type });
    if (type === "playlists" || type === "albums") {
      let metaData = "";
      _iter(item.subtitle, (subtitle) => (metaData += subtitle.text));
      Object.assign(item, {
        metaData: metaData,
        browseId:
          entry.musicResponsiveListItemRenderer?.navigationEndpoint
            ?.browseEndpoint?.browseId,
        playlistId:
          entry.musicResponsiveListItemRenderer.menu?.menuRenderer?.items[0]
            ?.menuNavigationItemRenderer?.navigationEndpoint
            ?.watchPlaylistEndpoint?.playlistId,
      });
    }
    if (type === "songs") {
      Object.assign(item, {
        album:
          item.subtitle.at(-3).pageType?.includes("ALBUM") &&
          item.subtitle.at(-3),
      });
    }
    results.unshift(item);
  }
  return results;
}

module.exports = methods;
