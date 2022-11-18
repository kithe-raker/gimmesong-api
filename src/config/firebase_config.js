const firebase = require("firebase-admin");

// realtime database's url
const db_url =
  "https://gimmesong-d4f27-default-rtdb.asia-southeast1.firebasedatabase.app";
const songRequest_db_url =
  "https://gimmesong-song-request.asia-southeast1.firebasedatabase.app";

// Initialize Firebase for `Production` or `Development` environment
if (process.env.NODE_ENV === "production") {
  firebase.initializeApp({
    databaseURL: db_url,
  });
  firebase.initializeApp(
    {
      databaseURL: songRequest_db_url,
    },
    "SongRequest"
  );
} else {
  const serviceAccount = require("../../secret/gimmesong-firebase-adminsdk.json");

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: db_url,
  });
  firebase.initializeApp(
    {
      credential: firebase.credential.cert(serviceAccount),
      databaseURL: songRequest_db_url,
    },
    "SongRequest"
  );
}

const fs = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;
const ServerValue = firebase.database.ServerValue;

const rtdb = {
  Default: firebase.database(),
  SongRequest: firebase.database(firebase.app("SongRequest")),
};

// auth
const fa = firebase.auth();

const pathRef = {
  // every user relevant path
  UsersCollection: fs.collection("Users"),
  UserDocument: function (uid) {
    if (!uid) throw "no uid provided";
    return pathRef.UsersCollection.doc(uid);
  },
  UserInboxCollection: function (uid) {
    return pathRef.UserDocument(uid).collection("inbox");
  },
  UsernamesCollection: fs.collection("Usernames"),
  UsernameDocument: function (username) {
    if (!username) throw "no username provided";
    return pathRef.UsernamesCollection.doc(username);
  },

  // song relevant path
  SongsCollection: fs.collection("Songs"),
  SongDocument: function (id) {
    if (!id) throw "no id provided";
    return pathRef.SongsCollection.doc(id);
  },

  // stats realtime db
  SongSentStatsRef: rtdb.Default.ref("total_song_sent"),

  // song request stats
  SongRequestPlayCouterRef: rtdb.SongRequest.ref("play_counter"),
  SongRequestPlayCouterTotalRef: function (request_id) {
    if (!request_id) throw "no request id provided";

    return pathRef.SongRequestPlayCouterRef.child(`${request_id}/total`);
  },
};

module.exports = { firebase, fs, fa, FieldValue, ServerValue, pathRef, rtdb };
