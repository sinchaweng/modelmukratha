const firebaseConfig = {
  apiKey: "AIzaSyBd9PkIQ_BZZPj9fUB4XB7m9iz3FYKKe-U",
  authDomain: "finalprojecthosting.firebaseapp.com",
  projectId: "finalprojecthosting",
  storageBucket: "finalprojecthosting.firebasestorage.app",
  messagingSenderId: "659910868804",
  appId: "1:659910868804:web:51f4a5dc6cdc1aadace111",
  measurementId: "G-Z924G2648Q"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); 
}

const db = firebase.firestore();
const auth = firebase.auth(); 