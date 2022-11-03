const methods = {
  SearchContentParser: function (ctx) {
    const thumbnails =
      ctx.musicResponsiveListItemRenderer.thumbnail?.musicThumbnailRenderer
        ?.thumbnail?.thumbnails || [];
    for (let idx = 0; idx < thumbnails.length; idx++) {
      const item = thumbnails[idx];
      const newThumbnail = _thumbnailTransformer(item.url);
      Object.assign(thumbnails[idx], newThumbnail);
    }
    const item = ctx.musicResponsiveListItemRenderer;
    const flexColumns = Array.isArray(item.flexColumns) && item.flexColumns;
    const subtitleRuns =
      flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs;
    const flexCol0 =
      flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text
        ?.runs[0] || {};
    const subtitles = Array.isArray(subtitleRuns) && _subtitle(subtitleRuns);

    const Item = {
      subtitle: subtitles,
      artistInfo: {
        artist: [subtitles[0]],
      },
      explicit: "badges" in item ? true : false,
      title: flexCol0.text,
      aspectRatio: item.flexColumnDisplayStyle,
      musicVideoType:
        flexCol0.navigationEndpoint?.watchEndpoint?.watchEndpointMusicConfig
          ?.musicVideoType ??
        flexCol0.navigationEndpoint?.watchEndpoint
          ?.watchEndpointMusicSupportedConfigs?.watchEndpointMusicConfig
          ?.musicVideoType,
      videoId: flexCol0.navigationEndpoint?.watchEndpoint?.videoId || "",

      thumbnails: thumbnails,
      length:
        "fixedColumns" in item &&
        item.fixedColumns[0]?.musicResponsiveListItemFixedColumnRenderer?.text
          ?.runs?.length
          ? item.fixedColumns[0]?.musicResponsiveListItemFixedColumnRenderer
              ?.text?.runs[0]?.text
          : undefined,
    };

    if (Array.isArray(Item.subtitle) && Item.subtitle[0].text === "Artist") {
      Object.assign(Item, {
        artistInfo: {
          artist: [
            {
              pageType:
                item.navigationEndpoint?.browseEndpoint
                  ?.browseEndpointContextSupportedConfigs
                  ?.browseEndpointContextMusicConfig?.pageType,
              browseId: item?.navigationEndpoint?.browseEndpoint?.browseId,
            },
          ],
        },
      });
    }

    Object.assign(Item, {});
    return Item;
  },
  SongDetailsParser: function (data) {
    const formats = data?.streamingData?.adaptiveFormats;
    let idx = -1;
    const length = formats?.length;

    const arr = [];
    while (++idx < length) {
      const item = formats[idx];
      if (item.itag < 139 && item.itag > 251) continue;
      if (item.itag === 140)
        arr.push({
          original_url: item.url,
          url: item.url,
          mimeType: "mp4",
        });
    }
    return { streams: arr };
  },
};

// ==================== Private function ====================

/**
 *
 * @param {string} url
 * @returns
 */
function _thumbnailTransformer(url) {
  const output = { url: "", placeholder: "" };
  if (!url.includes("lh3.googleusercontent.com")) {
    const split_url = url.split("?");
    const webp_url = split_url[0];
    output.url = webp_url;
    output.placeholder = webp_url?.replace("sddefault", "default");
    return output;
  }
  const webp_url = url?.replace("-rj", "-rw");
  output.url = webp_url;

  output.placeholder = webp_url?.replace(
    // /=(?:[wh][0-9].+?){2,}(-s)?/gm,
    /=w\d+-h\d+-/gm,
    "=w1-h1-p-fSoften=50,50,05-"
  );

  return output;
}

function _subtitle(items) {
  const length = items.length;
  const subtitles = Array(length);

  let idx = -1;
  while (++idx < length) {
    const item = items[idx];
    if (item.navigationEndpoint === undefined) {
      subtitles[idx] = item;
      continue;
    }

    subtitles[idx] = {
      text: item.text,
      browseId: item.navigationEndpoint.browseEndpoint?.browseId,
      pageType:
        item.navigationEndpoint.browseEndpoint
          .browseEndpointContextSupportedConfigs
          ?.browseEndpointContextMusicConfig?.pageType,
    };
  }
  return subtitles;
}

module.exports = methods;
