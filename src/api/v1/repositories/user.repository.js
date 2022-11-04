const {
  pathRef,
  fs,
  fa,
  FieldValue,
} = require("../../../config/firebase_config");

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
   * @param {string} idToken user's session token
   * @param {string} filter all(default), new
   * @returns
   */
  queryReceivedSongs: async function (idToken, filter = "all") {
    const user = await fa.verifyIdToken(idToken).catch((_) => {
      throw "invalid session token";
    });
    const uid = user.uid;

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

    snapshot.docs.forEach((doc) => {
      const receivedData = doc.data();
      const songId = receivedData?.content?.songId;
      if (!songId) return;

      promises.push(
        this.getCachedSongDetails(songId).then((data) => {
          if (data.exists) {
            receivedData.content.song = data.song;
            receivedData.id = doc.id;
            results.push(receivedData);
          }
        })
      );
    });

    await Promise.all(promises);

    return results;
  },
  getCachedSongDetails: async function (songId) {
    const doc = await pathRef.SongDocument(songId).get();
    return { song: doc.data(), exists: doc.exists };
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
   */
  sendSong: async function (recipientUid, message, song) {
    if (!song?.videoId) throw "No song's id provided";
    if (!message) throw "No message provided";
    if (!recipientUid) throw "No recipient's uid provided";

    const batch = fs.batch();
    batch.create(pathRef.UserInboxCollection(recipientUid).doc(), {
      content: { message, songId: song.videoId },
      played: false,
      receivedAt: FieldValue.serverTimestamp(),
      recipient: recipientUid,
    });
    batch.set(
      pathRef.SongDocument(song.videoId),
      {
        ...song,
        given: FieldValue.increment(1),
        lastestGiven: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();
  },

  /**
   * @param {string} idToken user's session token
   * @param {string} username
   */
  addNewUser: async function (idToken, username) {
    const user = await fa.verifyIdToken(idToken).catch((_) => {
      throw "invalid session token";
    });
    const uid = user.uid;

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
   * @param {string} idToken user's session token
   * @param {string} inboxId target song in inbox to play
   */
  playSongFromInbox: async function (idToken, inboxId) {
    if (!inboxId) throw "No inbox's id provided";

    const user = await fa.verifyIdToken(idToken).catch((_) => {
      throw "invalid session token";
    });
    const uid = user.uid;

    await pathRef
      .UserInboxCollection(uid)
      .doc(inboxId)
      .update({ played: true });
  },
};

module.exports = methods;
