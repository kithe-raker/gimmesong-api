const { pathRef, fs, FieldValue } = require("../../../config/firebase_config");
const { SongSchema } = require("../schemas/ytm.schema");
const SongFunction = require("./song.repository");
const VinylStyleFunction = require("./vinylStyle.repository");
const { incrementSongSentStats } = require("./stats.repository");

const methods = {
  getUserIdByName: async function (username) {
    const doc = await pathRef.UsernameDocument(username).get();
    return { uid: doc.data()?.uid, exists: doc.exists };
  },
  getUsername: async function (uid) {
    const doc = await pathRef.UserDocument(uid).get();
    return { username: doc.data()?.username, exists: doc.exists };
  },
  /**
   *
   * @param {string} uid user's id
   * @param {string} filter all(default), new
   * @returns
   */
  queryReceivedSongs: async function (uid, filter = "all") {
    const query = pathRef
      .UserInboxCollection(uid)
      .orderBy("receivedAt", "desc");

    const snapshot =
      filter == "new"
        ? await query.where("played", "==", false).get()
        : await query.get();

    // Get every song's details in inbox
    const promises = [];
    const results = [];

    var resultIndexs = {};

    for (let index = 0; index < snapshot.docs.length; index++) {
      const doc = snapshot.docs[index];
      const receivedData = doc.data();

      const songId = receivedData?.content?.songId;
      if (!songId) return;

      resultIndexs[doc.id] = index;

      promises.push(
        SongFunction.getCachedSongDetails(songId).then((data) => {
          if (data.exists) {
            receivedData.content.song = data.song;
            receivedData.id = doc.id;
            results[resultIndexs[doc.id]] = receivedData;
          }
        })
      );
    }

    await Promise.all(promises);

    return results.filter((result) => result != null && result != undefined);
  },
  /**
   *
   * @param {string} uid user's id
   * @param {*} param1
   * @returns
   */
  queryInbox: async function (
    uid,
    { filter = "all", lastItemId = "", limit = 10 }
  ) {
    var lastItemDoc;

    if (lastItemId) {
      const doc = await pathRef.UserInboxCollection(uid).doc(lastItemId).get();
      if (doc && doc.exists) lastItemDoc = doc;
    }

    const query =
      filter == "new"
        ? pathRef
            .UserInboxCollection(uid)
            .orderBy("receivedAt", "desc")
            .where("played", "==", false)
        : pathRef.UserInboxCollection(uid).orderBy("receivedAt", "desc");

    const snapshot = lastItemDoc
      ? await query.startAfter(lastItemDoc).limit(limit).get()
      : await query.limit(limit).get();

    // Get every song's details in inbox
    const promises = [];
    var results = [];

    var resultIndexs = {};

    for (let index = 0; index < snapshot.docs.length; index++) {
      const doc = snapshot.docs[index];
      const receivedData = doc.data();

      const songId = receivedData?.content?.songId;
      if (!songId) return;

      resultIndexs[doc.id] = index;

      promises.push(
        SongFunction.getCachedSongDetails(songId).then((data) => {
          if (data.exists) {
            receivedData.content.song = data.song;
            receivedData.id = doc.id;
            results[resultIndexs[doc.id]] = receivedData;
          }
        })
      );
    }

    await Promise.all(promises);
    results = results.filter((result) => result != null && result != undefined);

    if (results.length < 1) return { contents: [] };

    return {
      contents: results,
      lastItemId: results[results.length - 1].id,
    };
  },

  /**
   *
   * @param {string} recipientUid
   * @param {string} message
   * @param {{  artistInfo: {
   *                artist: Array<{browseId: string,pageType:string,text:string}>
   *            },
   *            length: string,
   *            thumbnails: Array<{height: number,width: number,url:string}>,
   *            title: string,
   *            videoId: string
   *        }} song
   * @param {{
   *            disc: string,
   *            emoji: string,
   *        }} vinylStyle
   */
  sendSong: async function (recipientUid, message, song, vinylStyle) {
    if (!song?.videoId) throw "No song's id provided";
    if (!message) throw "No message provided";
    if (!recipientUid) throw "No recipient's uid provided";

    const batch = fs.batch();

    // validate song object
    const { error } = SongSchema.validate(song);

    // if valid, update cached song details in db
    if (error) {
      throw error.message;
    }

    // validate if the provided vinyl style is exists
    const vinylError = await VinylStyleFunction.validateVinylStyle(vinylStyle);
    if (vinylError) {
      throw vinylError;
    }

    Object.assign(song, {
      given: FieldValue.increment(1),
      lastestGiven: FieldValue.serverTimestamp(),
    });

    batch.set(pathRef.SongDocument(song.videoId), song, {
      merge: true,
    });

    batch.create(pathRef.UserInboxCollection(recipientUid).doc(), {
      content: { message, songId: song.videoId },
      vinyl_style: vinylStyle,
      played: false,
      receivedAt: FieldValue.serverTimestamp(),
      recipient: recipientUid,
    });

    await Promise.all([incrementSongSentStats(), batch.commit()]);
  },

  /**
   * @param {string} uid user's id
   * @param {string} username
   */
  addNewUser: async function (uid, username) {
    await fs.runTransaction(async (trans) => {
      // ensure that username is unique
      const doc = await trans.get(pathRef.UsernameDocument(username));
      if (doc.exists) throw "This Username already taken";

      // add new user's data
      trans.create(pathRef.UsernameDocument(username), {
        uid: uid,
      });
      trans.create(pathRef.UserDocument(uid), {
        username: username,
      });
    });
  },
  /**
   * @param {string} uid user's id
   * @param {string} inboxId target song in inbox to play
   */
  playSongFromInbox: async function (uid, inboxId) {
    if (!inboxId) throw "No inbox's id provided";

    await pathRef
      .UserInboxCollection(uid)
      .doc(inboxId)
      .update({ played: true });
  },
};

module.exports = methods;
