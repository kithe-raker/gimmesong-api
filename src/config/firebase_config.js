const firebase = require("firebase-admin");

// Initialize Firebase for `Production` or `Development` environment
if (process.env.NODE_ENV === "production") {
  firebase.initializeApp();
} else {
  const serviceAccount = require("../secret/gimmesong-firebase-adminsdk.json");

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });
}

const fs = firebase.firestore();

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
};

module.exports = { firebase, fs, pathRef };
