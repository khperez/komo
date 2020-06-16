import * as firebase from 'firebase';

const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "dispersed-lists.firebaseapp.com",
    databaseURL: "https://dispersed-lists.firebaseio.com",
    projectId: "dispersed-lists",
    storageBucket: "dispersed-lists.appspot.com",
    messagingSenderId: "779023131885",
    appId: "1:779023131885:web:ff736274ee08fd561e58e4",
    measurementId: "G-2H8PXPQXR9"
  };

firebase.initializeApp(config);

const database = firebase.database();
const auth = firebase.auth();

export {
  database,
  auth
};
