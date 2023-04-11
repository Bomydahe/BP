import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDXFcsCgOwy7HZ7wwLU_7S6WR0TBSRVdEE",
  authDomain: "motionmatch-1c2a8.firebaseapp.com",
  projectId: "motionmatch-1c2a8",
  storageBucket: "motionmatch-1c2a8.appspot.com",
  messagingSenderId: "844011908547",
  appId: "1:844011908547:web:1c8adbc409377946e0e176",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
