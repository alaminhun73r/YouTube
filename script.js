import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD-mdI3OlZDe9mtpKXyDjclrr1IE0LZJSc",
  authDomain: "view-49d26.firebaseapp.com",
  databaseURL: "https://view-49d26-default-rtdb.firebaseio.com",
  projectId: "view-49d26",
  storageBucket: "view-49d26.firebasestorage.app",
  messagingSenderId: "462642880975",
  appId: "1:462642880975:web:d2b4b5f5f53a583986f2ba",
  measurementId: "G-F1H6F6V8MG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Registration
document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await set(ref(db, 'users/' + user.uid), {
            name: name,
            email: email,
            interests: [],
            joined: new Date().toISOString()
        });

        alert('✅ Registration successful!');
        window.location.href = 'dashboard.html';
    } catch(error) {
        alert('❌ ' + error.message);
    }
});

// Login
document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('✅ Login successful!');
        window.location.href = 'dashboard.html';
    } catch(error) {
        alert('❌ ' + error.message);
    }
});
