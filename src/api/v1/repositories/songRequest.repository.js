const {
  pathRef,
  ServerValue,
  fs,
  FieldValue,
} = require("../../../config/firebase_config");
const LangTagHelper = require("../helpers/language_tag.helper");
const { SongSchema } = require("../schemas/ytm.schema");
const { incrementSongSentStats } = require("./stats.repository");

const methods = {
  /**
   *
   * @param {String} langTag
   * @param {String} message
   * @param {String} requesterUid
   * @param {boolean} isAnonymous
   */
  createSongRequest: async function (
    langTag,
    message,
    requesterUid,
    isAnonymous = true
  ) {
    if (!message) throw "No message provided";
    if (!requesterUid) throw "No requesterUid provided";
    if (!langTag) throw "No language tag provided";

    const tag = LangTagHelper.validateTag(langTag);

    const batch = fs.batch();
    const requestDoc = pathRef.SongRequestsLangCollection(tag).doc();
    const requestLinkDoc = pathRef.SongRequestLinksCollection.doc();
    const userRequestDoc = pathRef
      .UserSongRequestsCollection(requesterUid)
      .doc(requestDoc.id);

    batch.create(requestDoc, {
      message,
      isAnonymous,
      shareLinkId: requestLinkDoc.id,
      language: tag,
      recentlyAdded: [],
      requester: requesterUid,
      counter: 0,
      views: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    batch.create(requestLinkDoc, {
      language: tag,
      requester: requesterUid,
      requestId: requestDoc.id,
      createdAt: FieldValue.serverTimestamp(),
    });
    batch.create(userRequestDoc, {
      language: tag,
      id: requestDoc.id,
      shareLinkId: requestLinkDoc.id,
      createdAt: FieldValue.serverTimestamp(),
    });

    await Promise.all([batch.commit(), this.incrementTotalRequestStats(tag)]);

    return { shareLinkId: requestLinkDoc.id, requestId: requestDoc.id };
  },
  /**
   *
   * @param {*} langTag
   * @param {*} requestId
   * @param {{ artistInfo: {
   *                artist: Array<{browseId: string,pageType:string,text:string}>
   *            },
   *            length: string,
   *            thumbnails: Array<{height: number,width: number,url:string}>,
   *            title: string,
   *            videoId: string
   *        }} song
   * @param {*} message
   */
  addSongToSongRequest: async function (langTag, requestId, message, song) {
    if (!song?.videoId) throw "No song's id provided";
    if (!langTag) throw "No language Tag provided";
    if (!requestId) throw "No request id provided";
    if (!message) throw "No message provided";

    const itemRef = pathRef.SongRequestItemCollector(langTag, requestId).doc();
    const targetRequestRef = pathRef
      .SongRequestsLangCollection(langTag)
      .doc(requestId);

    // validate song object
    const { error } = SongSchema.validate(song);

    const songDocData = {
      given: FieldValue.increment(1),
      lastestGiven: FieldValue.serverTimestamp(),
    };

    // if valid, update cached song details in db
    if (error) {
      throw error.message;
    }

    Object.assign(songDocData, song);

    const transaction = fs.runTransaction(async (trans) => {
      const doc = await trans.get(targetRequestRef);
      if (!doc.exists) throw "Target song request not exists";

      const recentlyAdded = doc.data()?.recentlyAdded ?? [];
      if (recentlyAdded && recentlyAdded.length > 3) {
        recentlyAdded.shift();
      }

      recentlyAdded.push({
        itemId: itemRef.id,
        songId: song.videoId,
        thumbnail: song.thumbnails[0] ?? "",
      });

      trans.update(targetRequestRef, {
        counter: FieldValue.increment(1),
        lastestAdded: FieldValue.serverTimestamp(),
        recentlyAdded: recentlyAdded,
      });
      trans.set(pathRef.SongDocument(song.videoId), songDocData, {
        merge: true,
      });
      trans.create(itemRef, {
        content: { message, songId: song.videoId },
        sentAt: FieldValue.serverTimestamp(),
      });
    });

    await Promise.all([transaction, incrementSongSentStats()]);
  },

  querySongRequest: function (params) {},

  // stats
  incrementViews: async function (id, langTag) {
    if (!id) throw "no request id provided";
    if (!langTag) throw "no language tag provided";

    const tag = LangTagHelper.validateTag(langTag);

    return await pathRef
      .SongRequestsLangCollection(tag)
      .doc(id)
      .update({ views: FieldValue.increment(1) });
  },
  incrementTotalRequestStats: async function (languageTag) {
    return await pathRef
      .SongRequestLangTotalRef(languageTag)
      .set(ServerValue.increment(1));
  },
};

module.exports = methods;
