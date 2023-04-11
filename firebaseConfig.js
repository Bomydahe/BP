import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDh3b_G7MuCxyQbE1Hvg0o7n-2zDIy6dCU",
  authDomain: "testproject-d2c7e.firebaseapp.com",
  projectId: "testproject-d2c7e",
  storageBucket: "testproject-d2c7e.appspot.com",
  messagingSenderId: "1031930963578",
  appId: "1:1031930963578:web:64e38a6609efcfc70d3dc3",
  measurementId: "G-CCCVNE2X9N",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
