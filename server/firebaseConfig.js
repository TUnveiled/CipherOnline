const admin = require("firebase-admin");

const serviceAccount = require("../private/cipheronline-4343e-firebase-adminsdk-9ly32-ee1e65388f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cipheronline-4343e.firebaseio.com"
});


//
// const firebase = require('firebase/admin');
//import 'firebase/firebase-firestore';

// Firebase configuration
// var firebaseConfig = {
//     apiKey: "AIzaSyDe-rFb_Q9-VPFCoTu3Bs2fPcVaj-nAfQA",
//     authDomain: "cipheronline-4343e.firebaseapp.com",
//     databaseURL: "https://cipheronline-4343e.firebaseio.com",
//     projectId: "cipheronline-4343e",
//     storageBucket: "cipheronline-4343e.appspot.com",
//     messagingSenderId: "471453926198",
//     appId: "1:471453926198:web:010654eb057cc8bb6be997",
//     measurementId: "G-3M34VP4EZM"
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
const db = admin.firestore();
// const auth = admin.auth();
// const currentUser = auth.currentUser;

// firebase collections
const usersCollection = db.collection('users');
const roomsCollection = db.collection('rooms');
const cardsCollection = db.collection('cards');
const publicCollection = db.collection('public');

exports.usersCollection = usersCollection;
exports.roomsCollection = roomsCollection;
exports.cardsCollection = cardsCollection;
exports.publicCollection = publicCollection;
    // auth,
    // currentUser,





// firebase.sanalytics();