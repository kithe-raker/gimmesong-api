const firebase = require("firebase-admin");
const { applicationDefault } = require("firebase-admin/app");
const LangTagHelper = require("../api/v1/helpers/language_tag.helper");

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
  UserSongRequestsCollection: function (uid) {
    return pathRef.UserDocument(uid).collection("user-song-requests");
  },

  // song relevant path
  SongsCollection: fs.collection("Songs"),
  SongDocument: function (id) {
    if (!id) throw "no id provided";
    return pathRef.SongsCollection.doc(id);
  },

  // song request relavant path
  SongRequestsCollection: fs.collection("SongRequests"),
  SongRequestsLangCollection: function (langTag) {
    const tag = LangTagHelper.validateTag(langTag);

    return pathRef.SongRequestsCollection.doc(tag).collection("song-requests");
  },
  SongRequestItemCollector: function (langTag, id) {
    if (!id) throw "no id provided";

    return pathRef
      .SongRequestsLangCollection(langTag)
      .doc(id)
      .collection("request-collector");
  },
  SongRequestLinksCollection: fs.collection("SongRequestLinks"),
  SongRequestLinksDoc: function (linkId) {
    if (!linkId) throw "no link's id provided";
    return fs.collection("SongRequestLinks").doc(linkId);
  },

  // stats realtime db
  SongSentStatsRef: rtdb.Default.ref("total_song_sent"),

  // song request stats
  SongRequestTotalRef: rtdb.SongRequest.ref("total_request"),
  SongRequestLangTotalRef: function (langTag) {
    const tag = LangTagHelper.validateTag(langTag);

    return pathRef.SongRequestTotalRef.child(tag);
  },
};

module.exports = { firebase, fs, fa, FieldValue, ServerValue, pathRef, rtdb };
