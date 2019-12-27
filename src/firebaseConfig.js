import firebase from 'firebase';
import 'firebase/firestore';

// Firebase configuration
// TODO unversion this file, invalidate this key and get a new one
var firebaseConfig = {
    apiKey: "AIzaSyDe-rFb_Q9-VPFCoTu3Bs2fPcVaj-nAfQA",
    authDomain: "cipheronline-4343e.firebaseapp.com",
    databaseURL: "https://cipheronline-4343e.firebaseio.com",
    projectId: "cipheronline-4343e",
    storageBucket: "cipheronline-4343e.appspot.com",
    messagingSenderId: "471453926198",
    appId: "1:471453926198:web:010654eb057cc8bb6be997",
    measurementId: "G-3M34VP4EZM"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const currentUser = auth.currentUser;

// firebase collections
const usersCollection = db.collection('users');
const roomsCollection = db.collection('rooms');

export {
    auth,
    currentUser,
    usersCollection,
    roomsCollection
}

// firebase.analytics();