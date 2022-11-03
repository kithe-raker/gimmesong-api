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

module.exports = { firebase, fs };
