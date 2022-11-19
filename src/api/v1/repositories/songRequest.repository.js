const {
  pathRef,
  ServerValue,
  fs,
  FieldValue,
} = require("../../../config/firebase_config");
const LangTagHelper = require("../helpers/language_tag.helper");
const { SongSchema } = require("../schemas/ytm.schema");

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
