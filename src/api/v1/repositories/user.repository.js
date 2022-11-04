const { pathRef, fs, firebase } = require("../../../config/firebase_config");

const methods = {
  getUserIdByName: async function (username) {
    const doc = await pathRef.UsernameDocument(username).get();
    return { uid: doc.data()?.uid, exists: doc.exists };
  },
  getUsername: async function (uid) {
    const doc = await pathRef.UserDocument(uid).get();
    return { username: doc.data()?.username, exists: doc.exists };
  },
  queryReceivedSongs: async function (uid, onlyNewSong = false) {
    const query = pathRef
      .UserInboxCollection(uid)
      .orderBy("receivedAt", "desc");

    const snapshot = onlyNewSong
      ? await query.where("played", "==", false).get()
      : await query.get();

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
      receivedAt: firebase.firestore.FieldValue.serverTimestamp(),
      recipient: recipientUid,
    });
    batch.set(
      pathRef.SongDocument(song.videoId),
      {
        ...song,
        given: firebase.firestore.FieldValue.increment(1),
        lastestGiven: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await batch.commit();
  },

  addNewUser: async function (uid, username) {
    await fs.runTransaction(async (trans) => {
      // ensure that username is unique
      const doc = await trans.get(pathRef.UsernameDocument(username));
      if (doc.exists) throw "This Username already exists";

      // add new user's data
      trans.create(pathRef.UsernameDocument(username), {
        uid: uid,
      });
      trans.create(pathRef.UserDocument(uid), {
        username: username,
      });
    });
  },
};

module.exports = methods;
