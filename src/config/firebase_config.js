const firebase = require("firebase-admin");
const LangTagHelper = require("../api/v1/helpers/language_tag.helper");

// realtime database's url
const _databaseUrl = {
  production: {
    default:
      "https://gimmesong-d4f27-default-rtdb.asia-southeast1.firebasedatabase.app",
    songRequest:
      "https://gimmesong-song-request.asia-southeast1.firebasedatabase.app",
  },
  development: {
    default: "https://gimmesong-develop-default-rtdb.firebaseio.com/",
    songRequest: "https://gimmesong-develop-default-rtdb.firebaseio.com/",
  },
};

// Initialize Firebase for `Production` or `Development` environment
switch (process.env.NODE_ENV) {
  case "production":
    firebase.initializeApp({
      databaseURL: _databaseUrl.production.default,
    });
    firebase.initializeApp(
      {
        databaseURL: _databaseUrl.production.songRequest,
      },
      "SongRequest"
    );
    break;

  case "staging":
    firebase.initializeApp({
      databaseURL: _databaseUrl.development.default,
    });
    firebase.initializeApp(
      {
        databaseURL: _databaseUrl.development.default,
      },
      "SongRequest"
    );
    break;

  default:
    const serviceAccount = require("../../secret/gimmesong-develop-firebase-adminsdk.json");

    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
      databaseURL: _databaseUrl.development.default,
    });
    firebase.initializeApp(
      {
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: _databaseUrl.development.default,
      },
      "SongRequest"
    );
    break;
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

  // vinyl style relevant path
  VinylStyle: {
    Collection: fs.collection("VinylStyle"),
    DiscCollection: fs.collection("VinylStyle/disc/styles"),
    EmojiCollection: fs.collection("VinylStyle/emoji/styles"),
    /**
     *
     * @param {*} type right now we only have [disc] and [emoji] vinyl component's type
     * @param {*} id
     * @returns
     */
    StyleDocument: function (type, id) {
      if (!id) throw "no id provided";
      if (!type) throw "no type provided";
      if (type != "disc" && type != "emoji") throw "provided type not exists";

      if (type == "disc") {
        return pathRef.VinylStyle.DiscCollection.doc(id);
      } else {
        return pathRef.VinylStyle.EmojiCollection.doc(id);
      }
    },
  },
};

module.exports = { firebase, fs, fa, FieldValue, ServerValue, pathRef, rtdb };
