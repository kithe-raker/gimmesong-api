const firebase = require("firebase-admin");

// Initialize Firebase for `Production` or `Development` environment
if (process.env.NODE_ENV === "production") {
  firebase.initializeApp({
    databaseURL:
      "https://gimmesong-d4f27-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
} else {
  const serviceAccount = require("../../secret/gimmesong-firebase-adminsdk.json");

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL:
      "https://gimmesong-d4f27-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

const fs = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;
const ServerValue = firebase.database.ServerValue;
const rtdb = firebase.database();
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
  SongSentStatsRef: rtdb.ref("total_song_sent"),
};

module.exports = { firebase, fs, fa, FieldValue, ServerValue, pathRef, rtdb };
